import { FieldValue } from 'firebase-admin/firestore';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin'; // New import for local auth
import fs from 'fs';
import fetch from 'node-fetch';
import { auth, db } from './firebaseAdmin.js'; // Keep auth from global
import { fileURLToPath } from 'url';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SpeechClient } from '@google-cloud/speech';
import express from 'express';
import NodeCache from 'node-cache';

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyFilePath = path.join(__dirname, 'serviceAccountKey.json');

// --- DB CONNECTION FIX ---
// We create a dedicated Firestore connection for the Agent using the key file directly.
// This solves the "Could not load default credentials" error without needing global env vars.
let dbAgent;
try {
    const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    // Initialize a specific app instance for the agent to avoid conflicts
    // Check if app already exists to avoid duplicate app error
    const agentApp = !admin.apps.find(app => app.name === 'agentWorker')
        ? admin.initializeApp({ credential: admin.credential.cert(serviceAccount) }, 'agentWorker')
        : admin.app('agentWorker');

    dbAgent = agentApp.firestore();
    console.log("✅ AI Agent connected to Firestore using Service Account.");
} catch (e) {
    console.error("❌ Agent DB Init Error:", e.message);
    // Fallback to global db if local init fails (though likely will error again if global failed)
    const globalAdmin = await import('./firebaseAdmin.js');
    dbAgent = globalAdmin.db;
}

// --- USER PROFILE CACHE ---
// Cache user profile data (like deviceId) to reduce Firestore reads.
// stdTTL: 300 seconds (5 minutes)
const userCache = new NodeCache({ stdTTL: 300 }); 
console.log("✅ User profile cache initialized with 5-min TTL.");

// --- ONE-TIME DATA POPULATION ---
// This function runs on server start to ensure Firestore has a base set of tips.
const populateTips = async () => {
    const tipsCollection = dbAgent.collection('tips');
    const snapshot = await tipsCollection.get();
    if (snapshot.empty) {
        console.log('Populating "tips" collection in Firestore...');
        const tips = [
            { category: 'general', tip: 'Unplug electronics when not in use, as they can still draw "phantom" power in standby mode.' },
            { category: 'general', tip: 'Switch to LED light bulbs. They use up to 80% less energy than traditional incandescent bulbs.' },
            { category: 'high_usage', tip: 'Your recent energy usage has been higher than your average. Try to identify which appliances you\'ve been using more frequently and see if you can reduce their usage.' },
            { category: 'high_grid_usage', tip: 'You are using a lot of energy from the grid. Try to shift energy-intensive tasks, like laundry, to daytime hours when your solar panels generate the most power.' }
        ];
        const batch = dbAgent.batch();
        tips.forEach(tip => {
            const docRef = tipsCollection.doc(); // Auto-generate ID
            batch.set(docRef, tip);
        });
        await batch.commit();
        console.log('✅ "tips" collection populated successfully.');
    }
};

// Populate tips on startup and log any errors.
populateTips().catch(error => console.error("🔥 Error populating tips:", error));


// --- MIDDLEWARE ---
const verifyToken = async (req, res, next) => {
    let idToken = req.headers['x-auth-token'];
    if (!idToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    }

    if (!idToken) return res.status(401).json({ success: false, error: 'No token provided' });

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Token Verification Error:", error);
        return res.status(403).json({ success: false, error: 'Invalid token' });
    }
};

// --- RATE LIMITER ---
const queryRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 requests per windowMs
    message: { success: false, error: "Too many requests, please try again later." }
});

// Initialize SpeechClient with a hybrid approach for production readiness
let speechClient;
if (fs.existsSync(keyFilePath)) {
    // Local development: Use the key file
    speechClient = new SpeechClient({ keyFilename: keyFilePath });
    console.log("✅ SpeechClient initialized using local service account key.");
} else {
    // Production (App Hosting): Use Application Default Credentials
    speechClient = new SpeechClient();
    console.log("✅ SpeechClient initialized using Application Default Credentials.");
}

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    // Add a system instruction to guide the model's behavior
    systemInstruction: `You are Christine, a helpful and friendly AI assistant for EnerGreen. 
    
    Your primary goal is to assist users with their energy-related questions and feedback.
    
    SPECIAL INSTRUCTION FOR ISSUE REPORTS:
    If a user says they are reporting an issue (especially about a device stopping data), you must:
    1. Be empathetic (e.g., "Oh, I see. I'm sorry to hear that...").
    2. Acknowledge the specific device ID and issue mentioned in their message. DO NOT ask for the device ID if they already provided it.
    3. Immediately ask if they want you to submit this as a formal complaint or support ticket.
    
    When a user asks for information that can be retrieved by one of your available tools, you must use the tool. Do not ask for permission; just use the tool. If the user's query is conversational, respond naturally.`
});

// --- CORRECTED TOOL DEFINITIONS ---
const energyToolFunctions = [
    {
        name: "getEnergySummary",
        description: "Get the user's latest daily energy summary, including total consumption, solar vs. grid percentage, and cost.",
        parameters: {
            type: "OBJECT",
            properties: {},
        }
    },
    {
        name: "submitFeedback",
        description: "Submit user feedback, which can be a complaint, suggestion, bug report, or a general tip. This is used to formally log the user's input in the system.",
        parameters: {
            type: "OBJECT",
            properties: {
                feedbackType: {
                    type: "STRING",
                    description: "The category of the feedback.",
                    enum: ["COMPLAINT", "SUGGESTION", "BUG", "TIP"]
                },
                feedbackText: {
                    type: "STRING",
                    description: "The detailed content of the user's feedback."
                }
            },
            required: ["feedbackType", "feedbackText"]
        }
    },
    {
        name: "getHistoricalData",
        description: "Get the user's historical energy data for a specified period, such as 'last 7 days' or 'last 30 days'.",
        parameters: {
            type: "OBJECT",
            properties: {
                period: {
                    type: "STRING",
                    description: "The time period for which to retrieve data.",
                    enum: ["last_7_days", "last_30_days"]
                }
            },
            required: ["period"]
        }
    },
    {
        name: "googleSearch",
        description: "Performs a Google search to answer general knowledge questions or find information on the web.",
        parameters: {
            type: "OBJECT",
            properties: {
                query: {
                    type: "STRING",
                    description: "The search query."
                }
            },
            required: ["query"]
        }
    },
    {
        name: "customerSupport",
        description: "Provides simple troubleshooting assistance for common customer issues.",
        parameters: {
            type: "OBJECT",
            properties: {
                issue: {
                    type: "STRING",
                    description: "A brief description of the issue the user is facing.",
                    enum: ["no_power", "high_bill", "panel_not_working"]
                }
            },
            required: ["issue"]
        }
    },
    {
        name: "getEnergySavingTips",
        description: "Provides a list of personalized energy-saving tips to help users reduce their consumption.",
        parameters: {
            type: "OBJECT",
            properties: {},
        }
    }
];

const router = express.Router();

router.use(express.raw({
    type: 'audio/webm',
    limit: '50mb'
}));

// --- HELPER: PCM to WAV Converter ---
function pcmToWav(pcmBase64, sampleRate = 24000) {
    const pcmData = Buffer.from(pcmBase64, 'base64');
    const header = Buffer.alloc(44);

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + pcmData.length, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(pcmData.length, 40);

    return Buffer.concat([header, pcmData]);
}

// --- HELPER: Generate Speech via Gemini API (Sulafat) ---
async function generateSpeech(text) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: text }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: "Sulafat" }
                }
            }
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini TTS API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (inlineData) {
        return pcmToWav(inlineData.data, 24000);
    }
    throw new Error("No audio data returned from Gemini.");
}

// --- Helper function to get user profile data (with caching) ---
const getUserProfileData = async (uid) => {
    const cacheKey = `profile_${uid}`;
    let profileData = userCache.get(cacheKey);

    if (!profileData) {
        console.log(`CACHE MISS for user ${uid}. Fetching from Firestore.`);
        const appId = 'default-app-id';
        const profileDoc = await dbAgent.doc(`artifacts/${appId}/users/${uid}/userProfile/profile`).get();

        if (!profileDoc.exists) {
            throw new Error("User profile not found.");
        }
        profileData = profileDoc.data();
        userCache.set(cacheKey, profileData);
    } else {
        console.log(`CACHE HIT for user ${uid}.`);
    }
    return profileData;
};

router.post('/query', queryRateLimiter, verifyToken, async (req, res) => {
    console.log('AI Agent endpoint hit!');

    let transcription = "";
    let imagePart = null;

    // Handle JSON input (Unified Text, Audio, and Image)
    if (req.is('application/json')) {
        // 1. Handle Audio (Base64)
        if (req.body.audio) {
            try {
                const speechRequest = {
                    audio: { content: req.body.audio },
                    config: {
                        encoding: 'WEBM_OPUS',
                        sampleRateHertz: 48000,
                        languageCode: 'en-US',
                    },
                };
                console.log("Sending to Cloud STT...");
                const [speechResponse] = await speechClient.recognize(speechRequest);
                transcription = speechResponse.results
                    .map(result => result.alternatives[0].transcript)
                    .join('\n');
                console.log(`Audio Transcription: "${transcription}"`);
            } catch (sttError) {
                console.error("STT Error:", sttError);
                return res.status(500).json({ error: "Speech recognition failed." });
            }
        } 
        // 2. Handle Text
        else if (req.body.text || req.body.content) {
            transcription = req.body.text || req.body.content;
            console.log(`Text Input: "${transcription}"`);
        }

        // 3. Handle Image
        if (req.body.image && req.body.mimeType) {
            console.log("Image received.");
            imagePart = {
                inlineData: {
                    data: req.body.image,
                    mimeType: req.body.mimeType
                }
            };
        }
    } else {
        // Fallback: Raw Audio Blob (Legacy support)
        if (!req.body || req.body.length === 0) {
            return res.status(400).json({ error: 'No audio data received.' });
        }
        try {
            const audioBytes = req.body.toString('base64');
            const speechRequest = {
                audio: { content: audioBytes },
                config: {
                    encoding: 'WEBM_OPUS',
                    sampleRateHertz: 48000,
                    languageCode: 'en-US',
                },
            };
            console.log("Sending to Cloud STT (Raw Blob)...");
            const [speechResponse] = await speechClient.recognize(speechRequest);
            transcription = speechResponse.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');
        } catch (sttError) {
             console.error("STT Error:", sttError);
             return res.status(500).json({ error: "Speech recognition failed." });
        }
    }

    // Fail if no intelligible input (text or audio) is found, UNLESS there is an image (users might just send an image).
    // If just an image, we can default the text to "What is this?".
    if (!transcription && !imagePart) {
        // Try to generate a polite "I didn't catch that" response audio
        const fallbackAudio = await generateSpeech("I didn't catch that. Could you please repeat?");
        res.set('Content-Type', 'audio/wav');
        return res.send(fallbackAudio);
    }

    if (!transcription && imagePart) {
        transcription = "What is this image about?";
    }

    try {
        // 2. Tool and Session Management
        const availableTools = {
            getEnergySummary: async ({ uid }) => {
                console.log(`TOOL EXECUTED: getEnergySummary for user ${uid}`);
                try {
                    // A. Get Device ID from Profile (using caching helper)
                    const profileData = await getUserProfileData(uid);
                    const deviceId = profileData.deviceId;
                    if (!deviceId || deviceId === 'None') return { error: "No smart meter linked to this account." };

                    // B. Query Device Data
                    const summaryQuery = dbAgent.collection(`devices/${deviceId}/daily_summaries`)
                        .orderBy('date', 'desc')
                        .limit(1);

                    const snapshot = await summaryQuery.get();

                    if (snapshot.empty) {
                        return { error: "No energy data recorded yet." };
                    }

                    const data = snapshot.docs[0].data();

                    // C. Date Check for "Today"
                    // Get Philippine time (UTC+8) for today's date string
                    const today = new Date();
                    const todayStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }); // YYYY-MM-DD

                    let message = "Here is your latest energy summary.";
                    if (data.date !== todayStr) {
                        message = `No summary available for today (${todayStr}). Showing the most recent summary from ${data.date}.`;
                    }

                    return {
                        message: message,
                        date: data.date,
                        totalKwh: ((data.gridKwhTotal || 0) + (data.solarKwhTotal || 0)).toFixed(2) + " kWh",
                        solarKwh: (data.solarKwhTotal || 0).toFixed(2) + " kWh",
                        gridKwh: (data.gridKwhTotal || 0).toFixed(2) + " kWh",
                        cost: (data.cost || 0).toFixed(2),
                        currency: "PHP (Pesos)",
                        electricityProvider: data.electricityProvider || "Unknown"
                    };

                } catch (dbError) {
                    console.error("Firestore query failed:", dbError);
                    return { error: "Failed to retrieve data." };
                }
            },
            submitFeedback: async ({ uid, feedbackType, feedbackText }) => {
                console.log(`TOOL EXECUTED: submitFeedback for user ${uid}`);
                try {
                    // Save feedback
                    await dbAgent.collection('feedback').add({
                        uid: uid,
                        type: feedbackType,
                        text: feedbackText,
                        status: 'new',
                        createdAt: FieldValue.serverTimestamp() // Use server timestamp here too
                    });

                    // Create a notification for the user
                    const notificationRef = dbAgent.collection(`artifacts/default-app-id/users/${uid}/notifications`);
                    const notificationMessage = `Thanks for your ${feedbackType.toLowerCase()}! We've received it and will look into it shortly.`;

                    await notificationRef.add({
                        title: 'Feedback Received',
                        message: notificationMessage,
                        createdAt: FieldValue.serverTimestamp(),
                        read: false,
                        type: 'feedback_confirmation' // Optional: for filtering/styling in UI
                    });

                    return { status: "Feedback submitted successfully. You've received a confirmation notification." };
                } catch (dbError) {
                    console.error("Firestore write failed:", dbError);
                    return { status: "Failed to submit feedback due to a database error." };
                }
            },
            getHistoricalData: async ({ uid, period }) => {
                console.log(`TOOL EXECUTED: getHistoricalData for user ${uid} for period ${period}`);
                try {
                    // Get Device ID from Profile (using caching helper)
                    const profileData = await getUserProfileData(uid);
                    const deviceId = profileData.deviceId;
                    if (!deviceId || deviceId === 'None') return { error: "No smart meter linked to this account." };

                    let days = 7;
                    if (period === 'last_30_days') {
                        days = 30;
                    }

                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - days);

                    const endDateStr = endDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
                    const startDateStr = startDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

                    const summaryQuery = dbAgent.collection(`devices/${deviceId}/daily_summaries`)
                        .where('date', '>=', startDateStr)
                        .where('date', '<=', endDateStr)
                        .orderBy('date', 'desc');

                    const snapshot = await summaryQuery.get();

                    if (snapshot.empty) {
                        return { error: `No energy data recorded for the ${period}.` };
                    }

                    const data = snapshot.docs.map(doc => doc.data());

                    const totalKwh = data.reduce((acc, cur) => acc + (cur.gridKwhTotal || 0) + (cur.solarKwhTotal || 0), 0);
                    const totalCost = data.reduce((acc, cur) => acc + (cur.cost || 0), 0);

                    return {
                        period: period,
                        startDate: startDateStr,
                        endDate: endDateStr,
                        totalKwh: totalKwh.toFixed(2) + " kWh",
                        totalCost: totalCost.toFixed(2) + " PHP",
                        summaries: data
                    };

                } catch (dbError) {
                    console.error("Firestore query failed:", dbError);
                    return { error: "Failed to retrieve historical data." };
                }
            },
            googleSearch: async ({ query }) => {
                console.log(`TOOL EXECUTED: googleSearch with query: "${query}"`);
                const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || process.env.VITE_GOOGLE_CUSTOM_SEARCH_API_KEY;
                const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

                if (!apiKey || !searchEngineId) {
                    console.error("Google Search API Key or Search Engine ID is not configured.");
                    return { error: "I'm sorry, the search feature is not configured." };
                }

                const url = `https://www.googleapis.com/customsearch/v1`;

                try {
                    const response = await axios.get(url, {
                        params: {
                            key: apiKey,
                            cx: searchEngineId,
                            q: query
                        }
                    });

                    const results = response.data.items;

                    if (!results || results.length === 0) {
                        return { result: "I couldn't find any results for that query." };
                    }

                    // Format the top 3 results for the model
                    const formattedResults = results.slice(0, 3).map((r, i) =>
                        `Result ${i + 1}: ${r.title} - ${r.snippet} (Link: ${r.link})`
                    ).join('\n');

                    return { result: formattedResults };

                } catch (error) {
                    console.error("Google Custom Search API call failed:", error.response ? error.response.data : error.message);
                    return { error: "I'm sorry, I was unable to perform the search due to an API error." };
                }
            },
            customerSupport: async ({ issue }) => {
                console.log(`TOOL EXECUTED: customerSupport for issue: ${issue}`);
                let supportResponse = "I'm sorry, I can't help with that specific issue. Please contact our support team for more assistance.";
                switch (issue) {
                    case "no_power":
                        supportResponse = "First, please check if there is a power outage in your area. You can also check your circuit breaker to see if it has tripped. If the issue persists, please contact your electricity provider.";
                        break;
                    case "high_bill":
                        supportResponse = "High bills can be caused by a number of factors, including increased usage or changes in your electricity plan. You can use the EnerGreen app to monitor your daily consumption and identify which appliances areusing the most energy. You can also ask me for energy-saving tips.";
                        break;
                    case "panel_not_working":
                        supportResponse = "If your solar panels are not generating power, please first check if they are clean and free of debris. Also, ensure that the inverter is turned on and functioning correctly. If you've checked these and the problem continues, it may be best to contact a qualified technician to inspect your system.";
                        break;
                }
                return { response: supportResponse };
            },
            getEnergySavingTips: async ({ uid }) => {
                console.log(`TOOL EXECUTED: getEnergySavingTips for user ${uid}`);
                try {
                    // 1. Define paths
                    const userTipsRef = dbAgent.doc(`artifacts/default-app-id/users/${uid}/userProfile/tips`);
                    const globalTipsRef = dbAgent.collection('tips');

                    // 2. Get user's deviceId for usage analysis (using caching helper)
                    const profileData = await getUserProfileData(uid);
                    const deviceId = profileData.deviceId;
                    if (!deviceId || deviceId === 'None') {
                        // For users without a device, return a random general tip without tracking.
                        const tipsSnapshot = await globalTipsRef.where('category', '==', 'general').get();
                        if (tipsSnapshot.empty) return { tips: ["Remember to turn off lights when you leave a room!"] };
                        const tips = tipsSnapshot.docs.map(doc => doc.data().tip);
                        return { tips: [tips[Math.floor(Math.random() * tips.length)]] };
                    }

                    // 3. Get delivered tips and all global tips concurrently
                    const [userTipsDoc, globalTipsSnapshot] = await Promise.all([
                        userTipsRef.get(),
                        globalTipsRef.get()
                    ]);

                    let deliveredIds = userTipsDoc.exists ? userTipsDoc.data().delivered_ids || [] : [];
                    const allGlobalTips = globalTipsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    // 4. Analyze usage to get tipCategory
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - 7);
                    const summaryQuery = dbAgent.collection(`devices/${deviceId}/daily_summaries`)
                        .where('date', '>=', startDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }))
                        .orderBy('date', 'desc');

                    const summarySnapshot = await summaryQuery.get();
                    let tipCategory = 'general';

                    if (summarySnapshot.size >= 2) {
                        const summaries = summarySnapshot.docs.map(doc => doc.data());
                        const latestSummary = summaries[0];
                        const previousSummaries = summaries.slice(1);
                        const avgTotalKwh = previousSummaries.reduce((acc, cur) => acc + (cur.gridKwhTotal || 0) + (cur.solarKwhTotal || 0), 0) / previousSummaries.length;
                        const latestTotalKwh = (latestSummary.gridKwhTotal || 0) + (latestSummary.solarKwhTotal || 0);

                        if (latestTotalKwh > avgTotalKwh * 1.2) tipCategory = 'high_usage';
                        else if (latestSummary.solarKwhTotal > 0 && (latestSummary.gridKwhTotal / latestTotalKwh) > 0.7) tipCategory = 'high_grid_usage';
                    }

                    // 5. Filter for unseen tips in the determined category
                    let candidateTips = allGlobalTips.filter(tip =>
                        tip.category === tipCategory && !deliveredIds.includes(tip.id)
                    );

                    // 6. Handle exhaustion: If no unseen tips, fall back to general
                    if (candidateTips.length === 0 && tipCategory !== 'general') {
                        console.log(`Category ${tipCategory} exhausted for user ${uid}, falling back to general.`);
                        candidateTips = allGlobalTips.filter(tip =>
                            tip.category === 'general' && !deliveredIds.includes(tip.id)
                        );
                    }

                    // 7. Handle total exhaustion: If still no tips, reset the list and try again
                    if (candidateTips.length === 0) {
                        console.log(`All tips exhausted for user ${uid}. Resetting delivered list.`);
                        deliveredIds = []; // Reset the list
                        candidateTips = allGlobalTips.filter(tip => tip.category === tipCategory);
                    }

                    // 8. Select a random tip from the candidates
                    const selectedTip = candidateTips[Math.floor(Math.random() * candidateTips.length)];

                    // 9. Update the user's delivered tips list in Firestore
                    deliveredIds.push(selectedTip.id);
                    await userTipsRef.set({ delivered_ids: deliveredIds }, { merge: true });

                    // 10. Return the tip text
                    return { tips: [selectedTip.tip] };

                } catch (dbError) {
                    console.error("Failed to retrieve energy saving tips:", dbError);
                    return { tips: ["Failed to fetch personalized tips. As a general tip, try using appliances during off-peak hours."] };
                }
            },
        };

        // 3. Run Gemini with Session Memory
        // Fetch history from Firestore
        const sessionRef = dbAgent.collection('agent_sessions').doc(req.user.uid);
        const sessionDoc = await sessionRef.get();
        let history = sessionDoc.exists ? sessionDoc.data().history || [] : [];

        // DEFENSIVE FIX: Sanitize history immediately after loading to handle any corrupted sessions.
        if (history.length > 0 && history[0].role !== 'user') {
            console.warn(`[HISTORY FIX] Loaded invalid history for user ${req.user.uid}. Sanitizing...`);
            const firstUserIndex = history.findIndex(h => h.role === 'user');
            if (firstUserIndex > -1) {
                history = history.slice(firstUserIndex);
            } else {
                // The history is completely invalid with no user messages. Start fresh.
                console.error(`[HISTORY FIX] No user role found in history for user ${req.user.uid}. Clearing history.`);
                history = [];
            }
        }

        // Start a chat with the (now sanitized) existing history
        const chat = model.startChat({
            history: history,
            tools: [{ functionDeclarations: energyToolFunctions }],
        });

        // Send the new message (supporting text + image)
        const messageParts = imagePart ? [{ text: transcription }, imagePart] : transcription;
        console.log(`Sending to Gemini (Image attached: ${!!imagePart})...`);
        
        const result = await chat.sendMessage(messageParts);
        const response = result.response;

        // Check for function call
        const call = response?.candidates?.[0]?.content?.parts?.[0]?.functionCall;
        let geminiResponseText;

        if (call) {
            console.log("Gemini wants to call:", call.name);
            const apiResponse = await availableTools[call.name]({ ...call.args, uid: req.user.uid });
            console.log("Tool Result:", apiResponse);

            // Send tool result back to Gemini
            const result2 = await chat.sendMessage([
                {
                    functionResponse: {
                        name: call.name,
                        response: apiResponse,
                    },
                },
            ]);
            geminiResponseText = result2.response.text();
        } else {
            // It was a simple text response
            geminiResponseText = response.text();
        }

        console.log(`Gemini Text: "${geminiResponseText}"`);

        // Update and save the history
        let updatedHistory = await chat.getHistory();

        // Prune history to keep the last 10 turns
        if (updatedHistory.length > 10) {
            updatedHistory = updatedHistory.slice(updatedHistory.length - 10);
        }

        // FIX: Ensure the pruned history always starts with a 'user' role.
        if (updatedHistory.length > 0 && updatedHistory[0].role !== 'user') {
            // If the first record is not from the user, slice it off to maintain a valid chat sequence.
            updatedHistory = updatedHistory.slice(1);
        }

        await sessionRef.set({
            history: updatedHistory,
            updatedAt: FieldValue.serverTimestamp() // Use server timestamp for TTL
        }, { merge: true });

        // 4. Text-to-Speech
        console.log("Generating Audio (Sulafat)...");
        const audioBuffer = await generateSpeech(geminiResponseText);
        console.log("Audio generated successfully.");

        res.set('Content-Type', 'audio/wav');
        res.send(audioBuffer);

    } catch (error) {
        console.error("Agent Error:", error);
        // If Gemini throws a 400, log the details
        if (error.response) {
            console.error("Gemini API Error Details:", JSON.stringify(error.response, null, 2));
        }
        res.status(500).json({ message: "Processing failed", error: error.message });
    }
});

export { router as agentRouter };
import express from 'express';
import { SpeechClient } from '@google-cloud/speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth, db } from './firebaseAdmin.js'; // Keep auth from global
import fetch from 'node-fetch';
import fs from 'fs';
import admin from 'firebase-admin'; // New import for local auth
import rateLimit from 'express-rate-limit';
import axios from 'axios';

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
    systemInstruction: "You are Christine, a helpful and friendly AI assistant for EnerGreen. Your primary goal is to assist users with their energy-related questions and feedback. When a user asks for information that can be retrieved by one of your available tools, you must use the tool. Do not ask for permission; just use the tool. If the user's query is conversational, respond naturally."
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

router.post('/query', queryRateLimiter, verifyToken, async (req, res) => {
    router.post('/query', queryRateLimiter, verifyToken, async (req, res) => {
        console.log('AI Agent endpoint hit!');

        if (!req.body || req.body.length === 0) {
            return res.status(400).json({ error: 'No audio data received.' });
        }

        try {
            // 1. Speech-to-Text
            const audioBytes = req.body.toString('base64');
            const speechRequest = {
                audio: { content: audioBytes },
                config: {
                    encoding: 'WEBM_OPUS',
                    sampleRateHertz: 48000,
                    languageCode: 'en-US',
                },
            };

            console.log("Sending to Cloud STT...");
            const [speechResponse] = await speechClient.recognize(speechRequest);
            const transcription = speechResponse.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');
            console.log(`Transcription: "${transcription}"`);

            if (!transcription) {
                const fallbackAudio = await generateSpeech("I didn't catch that. Could you please repeat?");
                res.set('Content-Type', 'audio/wav');
                return res.send(fallbackAudio);
            }

            // 2. Tool Execution Logic
            const availableTools = {
                getEnergySummary: async ({ uid }) => {
                    console.log(`TOOL EXECUTED: getEnergySummary for user ${uid}`);
                    try {
                        // A. Get Device ID from Profile
                        // Use the dedicated dbAgent connection
                        const appId = 'default-app-id';
                        const profileDoc = await dbAgent.doc(`artifacts/${appId}/users/${uid}/userProfile/profile`).get();

                        if (!profileDoc.exists) {
                            console.log("Profile not found");
                            return { error: "User profile not found." };
                        }

                        const deviceId = profileDoc.data().deviceId;
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
                        await dbAgent.collection('feedback').add({
                            uid: uid,
                            type: feedbackType,
                            text: feedbackText,
                            status: 'new',
                            createdAt: new Date().toISOString()
                        });
                        return { status: "Feedback submitted successfully." };
                    } catch (dbError) {
                        console.error("Firestore write failed:", dbError);
                        return { status: "Failed to submit feedback due to a database error." };
                    }
                },
                getHistoricalData: async ({ uid, period }) => {
                    console.log(`TOOL EXECUTED: getHistoricalData for user ${uid} for period ${period}`);
                    try {
                        const appId = 'default-app-id';
                        const profileDoc = await dbAgent.doc(`artifacts/${appId}/users/${uid}/userProfile/profile`).get();
                        if (!profileDoc.exists) {
                            return { error: "User profile not found." };
                        }
                        const deviceId = profileDoc.data().deviceId;
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
                    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
                    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

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
                            supportResponse = "High bills can be caused by a number of factors, including increased usage or changes in your electricity plan. You can use the EnerGreen app to monitor your daily consumption and identify which appliances are using the most energy. You can also ask me for energy-saving tips.";
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
                        // 1. Get user's device ID
                        const appId = 'default-app-id';
                        const profileDoc = await dbAgent.doc(`artifacts/${appId}/users/${uid}/userProfile/profile`).get();
                        if (!profileDoc.exists) return { tips: ["Could not find your user profile to analyze usage."] };
                        const deviceId = profileDoc.data().deviceId;
                        if (!deviceId || deviceId === 'None') return { tips: ["No smart meter is linked to your account, so I cannot provide personalized tips."] };

                        // 2. Fetch last 7 days of data
                        const endDate = new Date();
                        const startDate = new Date();
                        startDate.setDate(endDate.getDate() - 7);
                        const endDateStr = endDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
                        const startDateStr = startDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

                        const summaryQuery = dbAgent.collection(`devices/${deviceId}/daily_summaries`)
                            .where('date', '>=', startDateStr)
                            .orderBy('date', 'desc');
                        const snapshot = await summaryQuery.get();

                        if (snapshot.empty || snapshot.size < 2) {
                            // Not enough data, return a general tip
                            const tipsSnapshot = await dbAgent.collection('tips').where('category', '==', 'general').limit(1).get();
                            if (tipsSnapshot.empty) return { tips: ["Remember to turn off lights when you leave a room!"] };
                            return { tips: tipsSnapshot.docs.map(doc => doc.data().tip) };
                        }

                        const summaries = snapshot.docs.map(doc => doc.data());
                        const latestSummary = summaries[0];
                        const previousSummaries = summaries.slice(1);

                        // 3. Analyze data for patterns
                        const avgTotalKwh = previousSummaries.reduce((acc, cur) => acc + (cur.gridKwhTotal || 0) + (cur.solarKwhTotal || 0), 0) / previousSummaries.length;
                        const latestTotalKwh = (latestSummary.gridKwhTotal || 0) + (latestSummary.solarKwhTotal || 0);

                        let tipCategory = 'general'; // Default category

                        // Pattern 1: Usage is 20% higher than average
                        if (latestTotalKwh > avgTotalKwh * 1.2) {
                            tipCategory = 'high_usage';
                        }
                        // Pattern 2: Grid usage is more than 70% of total usage (and they have solar)
                        else if (latestSummary.solarKwhTotal > 0 && (latestSummary.gridKwhTotal / latestTotalKwh) > 0.7) {
                            tipCategory = 'high_grid_usage';
                        }

                        // 4. Fetch relevant tip from Firestore
                        const tipsSnapshot = await dbAgent.collection('tips').where('category', '==', tipCategory).get();
                        if (tipsSnapshot.empty) {
                            // Fallback to general if specific tip is not found
                            const generalTipsSnapshot = await dbAgent.collection('tips').where('category', '==', 'general').limit(1).get();
                            if (generalTipsSnapshot.empty) return { tips: ["Remember to turn off lights when you leave a room!"] };
                            return { tips: generalTipsSnapshot.docs.map(doc => doc.data().tip) };
                        }

                        // Return a random tip from the selected category
                        const tips = tipsSnapshot.docs.map(doc => doc.data().tip);
                        const randomTip = tips[Math.floor(Math.random() * tips.length)];

                        return { tips: [randomTip] };

                    } catch (dbError) {
                        console.error("Failed to retrieve energy saving tips:", dbError);
                        // Fallback to a hardcoded general tip on error
                        return { tips: ["Failed to fetch personalized tips. As a general tip, try using appliances during off-peak hours."] };
                    }
                },
            };

            // 3. Run Gemini with Tools
            async function run(prompt, uid) {
                const result = await model.generateContent({
                    contents: [{ parts: [{ text: prompt }] }],
                    // FIX: Correctly pass the function declarations array
                    tools: [{ functionDeclarations: energyToolFunctions }],
                });

                const call = result.response?.candidates?.[0]?.content?.parts?.[0]?.functionCall;

                if (call) {
                    console.log("Gemini wants to call:", call.name);
                    // Pass UID to the tool
                    const apiResponse = await availableTools[call.name]({ ...call.args, uid });

                    console.log("Tool Result:", apiResponse);

                    // Send result back to Gemini to generate final text
                    const result2 = await model.generateContent({
                        contents: [
                            { role: 'user', parts: [{ text: prompt }] },
                            { role: 'model', parts: [{ functionCall: call }] },
                            { role: 'function', parts: [{ functionResponse: { name: call.name, response: apiResponse } }] }
                        ],
                        tools: [{ functionDeclarations: energyToolFunctions }]
                    });
                    return result2.response;
                }

                return result.response;
            }

            console.log("Running Gemini...");
            const response = await run(transcription, req.user.uid);
            const geminiResponseText = response.text();
            console.log(`Gemini Text: "${geminiResponseText}"`);

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
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
            // NEW TOOL IMPLEMENTATION
            submitFeedback: async ({ uid, feedbackType, feedbackText }) => {
                console.log(`TOOL EXECUTED: submitFeedback for user ${uid}`);
                try {
                    // Using 'feedback' collection at root, or adjust path as needed
                    // e.g. artifacts/default-app-id/public/data/feedback
                    await dbAgent.collection('feedback').add({
                        uid: uid,
                        type: feedbackType,
                        text: feedbackText,
                        status: 'new',
                        createdAt: new Date().toISOString() // Store as ISO string or Firestore Timestamp
                    });
                    return { status: "Feedback submitted successfully." };
                } catch (dbError) {
                    console.error("Firestore write failed:", dbError);
                    return { status: "Failed to submit feedback due to a database error." };
                }
            }
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
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
    systemInstruction: "You are Bryl, an expert admin assistant for EnerGreen. Your primary goal is to help admins manage the system by providing data and executing administrative tasks. When an admin asks for information that can be retrieved by one of your available tools, you must use the tool. Do not ask for permission; just use the tool. If the user's query is conversational, respond naturally."
});

// --- ADMIN-SPECIFIC TOOL DEFINITIONS ---
const adminToolFunctions = [
    {
        name: "getSystemStatus",
        description: "Get the current operational status of the EnerGreen system.",
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

// --- HELPER: Generate Speech via Gemini API (Imanis - Male) ---
async function generateSpeech(text) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: text }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: "Orus" }
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

        // 2. Tool and Session Management
        const availableTools = {
            getSystemStatus: async () => {
                console.log(`TOOL EXECUTED: getSystemStatus`);
                // In a real scenario, this could check database connections, API health, etc.
                return { status: "All systems are operational." };
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
            tools: [{ functionDeclarations: adminToolFunctions }],
        });

        // Send the new message
        const result = await chat.sendMessage(transcription);
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
        console.log("Generating Audio (Orus)...");
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

export { router as adminAgentRouter };
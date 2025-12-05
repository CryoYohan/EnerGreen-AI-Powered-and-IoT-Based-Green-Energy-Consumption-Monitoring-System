import { FieldValue } from 'firebase-admin/firestore';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';
import fs from 'fs';
import fetch from 'node-fetch';
import { auth } from './firebaseAdmin.js';
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

// --- DB CONNECTION ---
let dbAgent;
try {
    const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    const agentApp = !admin.apps.find(app => app.name === 'agentWorker')
        ? admin.initializeApp({ credential: admin.credential.cert(serviceAccount) }, 'agentWorker')
        : admin.app('agentWorker');

    dbAgent = agentApp.firestore();
    console.log("✅ Kobe Agent connected to Firestore using Service Account.");
} catch (e) {
    console.error("❌ Kobe Agent DB Init Error:", e.message);
    const globalAdmin = await import('./firebaseAdmin.js');
    dbAgent = globalAdmin.db;
}

const userCache = new NodeCache({ stdTTL: 300 });

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

const queryRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { success: false, error: "Too many requests, please try again later." }
});

// --- SPEECH CLIENT ---
let speechClient;
if (fs.existsSync(keyFilePath)) {
    speechClient = new SpeechClient({ keyFilename: keyFilePath });
} else {
    speechClient = new SpeechClient();
}

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You are Kobe, an energetic and helpful onboarding assistant for EnerGreen. Your primary goal is to guide users on how to use the application, explain features, and walk them through tutorials. You should be encouraging and clear. When a user asks for help with a specific page or feature, use the available tools to provide accurate information. If the user's query is conversational, respond naturally."
});

// --- TOOLS ---
const kobeToolFunctions = [
    {
        name: "getPageGuide",
        description: "Retrieves a guide and tutorial steps for a specific page or feature in the application.",
        parameters: {
            type: "OBJECT",
            properties: {
                pageName: {
                    type: "STRING",
                    description: "The name of the page or feature to get the guide for (e.g., 'Home', 'Solar Panel', 'Appliances', 'Carbon Emission', 'Cost', 'Forecast')."
                }
            },
            required: ["pageName"]
        }
    },
    {
        name: "getFeatureExplanation",
        description: "Provides a detailed explanation of a specific feature or term used in the application.",
        parameters: {
            type: "OBJECT",
            properties: {
                featureName: {
                    type: "STRING",
                    description: "The name of the feature or term (e.g., 'Phantom Load', 'Solar Yield', 'Grid Parity')."
                }
            },
            required: ["featureName"]
        }
    }
];

const router = express.Router();
router.use(express.raw({ type: 'audio/webm', limit: '50mb' }));

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

// --- HELPER: Generate Speech via Gemini API (Fenrir) ---
async function generateSpeech(text) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: text }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Fenrir" } } }
        }
    };
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`Gemini TTS API Error (${response.status}): ${await response.text()}`);
    const data = await response.json();
    const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (inlineData) return pcmToWav(inlineData.data, 24000);
    throw new Error("No audio data returned from Gemini.");
}

// --- TTS Endpoint for Frontend UI ---
router.post('/tts', queryRateLimiter, verifyToken, async (req, res) => {
    const { text } = req.body; // Expecting JSON body { text: "..." } (parsed by express.json() in index.js)
    
    // NOTE: index.js uses express.json(), but this router uses express.raw for the /query endpoint.
    // We need to handle the body parsing manually if this specific router overrides body parsing,
    // OR rely on the fact that express.raw is only on /query if mounted specifically.
    // Let's check the router setup.
    // The router has `router.use(express.raw(...))`. This applies to ALL routes in this router if placed at top.
    // FIX: Move the `express.raw` middleware to be specific to the `/query` route OR handle parsing here.
    
    // Actually, since we defined router.use(express.raw...) at the top, it intercepts everything.
    // We should parse the raw body if it's JSON.
    
    try {
        let messageText = text;

        // Fallback manual parsing if body is a Buffer (due to express.raw)
        if (Buffer.isBuffer(req.body)) {
             try {
                const jsonBody = JSON.parse(req.body.toString());
                messageText = jsonBody.text;
             } catch (e) {
                // If not JSON, maybe it's just raw text? Unlikely for this endpoint.
                console.error("TTS parsing error:", e);
             }
        } else if (req.body && req.body.text) {
            messageText = req.body.text;
        }
        
        if (!messageText) {
             return res.status(400).json({ error: "No text provided for TTS." });
        }

        console.log(`Generating TTS (Fenrir) for: "${messageText.substring(0, 50)}..."`);
        const audioBuffer = await generateSpeech(messageText);
        res.set('Content-Type', 'audio/wav').send(audioBuffer);

    } catch (error) {
        console.error("TTS Endpoint Error:", error);
        res.status(500).json({ error: "Failed to generate speech." });
    }
});

// --- HARDCODED GUIDES (Placeholder for DB or separate config) ---
const pageGuides = {
    "home": {
        description: "The Home dashboard gives you a quick overview of your current energy status.",
        steps: [
            "Check the 'Real-Time Power' card to see your current consumption.",
            "View the 'Energy Mix' to see how much comes from Solar vs. Grid.",
            "Look at 'Quick Actions' to easily add a device or view reports."
        ]
    },
    "solar panel": {
        description: "The Solar Panel page allows you to monitor your solar energy generation and system health.",
        steps: [
            "View the 'Daily Generation' graph to track peak sunlight hours.",
            "Check 'System Health' to ensure all panels are functioning.",
            "Use the 'ROI Calculator' to see your estimated savings."
        ]
    },
    "appliances": {
        description: "Manage your connected smart appliances and track their individual consumption.",
        steps: [
            "Click 'Add Appliance' to connect a new smart plug.",
            "Select an appliance to view its usage history and set schedules.",
            "Toggle the switch to remotely turn an appliance on or off."
        ]
    },
    "carbon emission": {
        description: "Track your environmental impact and carbon footprint.",
        steps: [
            "View your 'Total Emissions' in kg CO2.",
            "Compare your emissions to the average household.",
            "Read tips on how to reduce your footprint."
        ]
    },
    "cost": {
        description: "Analyze your energy costs and bill estimations.",
        steps: [
            "See your 'Projected Monthly Bill' based on current usage.",
            "Break down costs by day or week.",
            "Set a budget alert to get notified if you exceed a certain amount."
        ]
    },
    "forecast": {
        description: "Predict future energy usage and solar generation.",
        steps: [
            "View the 'Generation Forecast' based on weather data.",
            "Check 'Consumption Prediction' to plan your usage.",
            "Use this data to schedule high-energy tasks when solar generation is high."
        ]
    }
};

router.post('/query', queryRateLimiter, verifyToken, async (req, res) => {
    console.log('Kobe Agent endpoint hit!');
    if (!req.body || req.body.length === 0) return res.status(400).json({ error: 'No audio data received.' });

    try {
        const audioBytes = req.body.toString('base64');
        const speechRequest = {
            audio: { content: audioBytes },
            config: { encoding: 'WEBM_OPUS', sampleRateHertz: 48000, languageCode: 'en-US' },
        };
        const [speechResponse] = await speechClient.recognize(speechRequest);
        const transcription = speechResponse.results.map(result => result.alternatives[0].transcript).join('\n');
        console.log(`Transcription: "${transcription}"`);

        if (!transcription) {
            const fallbackAudio = await generateSpeech("I didn't catch that. Could you please repeat?");
            return res.set('Content-Type', 'audio/wav').send(fallbackAudio);
        }

        const availableTools = {
            getPageGuide: async ({ pageName }) => {
                console.log(`TOOL EXECUTED: getPageGuide (page: ${pageName})`);
                const key = pageName.toLowerCase();
                // Simple partial match
                const foundKey = Object.keys(pageGuides).find(k => k.includes(key) || key.includes(k));
                
                if (foundKey) {
                    return pageGuides[foundKey];
                }
                return { error: `I couldn't find a specific guide for '${pageName}'. Try asking about 'Home', 'Solar', 'Appliances', or 'Cost'.` };
            },
            getFeatureExplanation: async ({ featureName }) => {
                 console.log(`TOOL EXECUTED: getFeatureExplanation (feature: ${featureName})`);
                 // Simple placeholder response
                 return { explanation: `I can explain '${featureName}'. (This is a placeholder for a dictionary lookup).` };
            }
        };

        const sessionRef = dbAgent.collection('kobe_sessions').doc(req.user.uid);
        const sessionDoc = await sessionRef.get();
        let history = sessionDoc.exists ? sessionDoc.data().history || [] : [];
        
        if (history.length > 0 && history[0].role !== 'user') {
             const firstUserIndex = history.findIndex(h => h.role === 'user');
             history = firstUserIndex > -1 ? history.slice(firstUserIndex) : [];
        }

        const chat = model.startChat({ history: history, tools: [{ functionDeclarations: kobeToolFunctions }] });
        const result = await chat.sendMessage(transcription);
        const response = result.response;
        const call = response?.candidates?.[0]?.content?.parts?.[0]?.functionCall;
        let geminiResponseText;

        if (call) {
            console.log("Gemini wants to call:", call.name);
            const apiResponse = await availableTools[call.name]({ ...call.args });
            console.log("Tool Result:", apiResponse);
            const result2 = await chat.sendMessage([{ functionResponse: { name: call.name, response: apiResponse } }]);
            geminiResponseText = result2.response.text();
        } else {
            geminiResponseText = response.text();
        }

        console.log(`Gemini Response: "${geminiResponseText}"`);

        let updatedHistory = await chat.getHistory();
        if (updatedHistory.length > 10) updatedHistory = updatedHistory.slice(updatedHistory.length - 10);
        if (updatedHistory.length > 0 && updatedHistory[0].role !== 'user') updatedHistory = updatedHistory.slice(1);
        await sessionRef.set({ history: updatedHistory, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

        const audioBuffer = await generateSpeech(geminiResponseText);
        res.set('Content-Type', 'audio/wav').send(audioBuffer);

    } catch (error) {
        console.error("Kobe Agent Error:", error);
        res.status(500).json({ message: "Processing failed", error: error.message });
    }
});

export { router as kobeAgentRouter };

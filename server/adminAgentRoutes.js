import { FieldValue } from 'firebase-admin/firestore';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';
import fs from 'fs';
import fetch from 'node-fetch';
import { auth, db } from './firebaseAdmin.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SpeechClient } from '@google-cloud/speech';
import express from 'express';
import NodeCache from 'node-cache';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyFilePath = path.join(__dirname, 'serviceAccountKey.json');

let dbAgent;
try {
    const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    const agentApp = !admin.apps.find(app => app.name === 'agentWorker')
        ? admin.initializeApp({ credential: admin.credential.cert(serviceAccount) }, 'agentWorker')
        : admin.app('agentWorker');
    dbAgent = agentApp.firestore();
    console.log("✅ AI Agent (Bryl) connected to Firestore using Service Account.");
} catch (e) {
    console.error("❌ Agent DB Init Error:", e.message);
    const globalAdmin = await import('./firebaseAdmin.js');
    dbAgent = globalAdmin.db;
}

const userCache = new NodeCache({ stdTTL: 300 });

const verifyToken = async (req, res, next) => {
    let idToken = req.headers['x-auth-token'] || (req.headers.authorization && req.headers.authorization.split('Bearer ')[1]);
    if (!idToken) return res.status(401).json({ success: false, error: 'No token provided' });
    try {
        req.user = await auth.verifyIdToken(idToken);
        next();
    } catch (error) {
        return res.status(403).json({ success: false, error: 'Invalid token' });
    }
};

const queryRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { success: false, error: "Too many requests, please try again later." }
});

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
    systemInstruction: "You are Bryl, an expert admin assistant for EnerGreen. Your primary goal is to help admins manage the system by providing data and executing administrative tasks. When an admin asks for information that can be retrieved by one of your available tools, you must use the tool. Do not ask for permission; just use the tool. If the user's query is conversational, respond naturally."
});

const adminToolFunctions = [
    {
        name: "getSystemStatus",
        description: "Get the current operational status of the EnerGreen system.",
        parameters: { type: "OBJECT", properties: {} }
    },
    {
        name: "getSystemAnalytics",
        description: "Get a high-level summary of the entire system for a given period (today, last 7 days, last 30 days), including total users, active devices, and mocked energy statistics.",
        parameters: {
            type: "OBJECT",
            properties: {
                period: {
                    type: "STRING",
                    description: "The period for which to retrieve analytics.",
                    enum: ["today", "last_7_days", "last_30_days"]
                }
            },
            required: ["period"]
        }
    },
    {
        name: "assignDeviceToUser",
        description: "Assign a specific smart meter (device ID) to a specific user (user ID).",
        parameters: {
            type: "OBJECT",
            properties: {
                deviceId: { type: "STRING", description: "The ID of the smart meter device." },
                userId: { type: "STRING", description: "The ID of the user to assign the device to." }
            },
            required: ["deviceId", "userId"]
        }
    },
    {
        name: "listDevicesByStatus",
        description: "List all smart meter devices based on their assignment status.",
        parameters: {
            type: "OBJECT",
            properties: {
                status: {
                    type: "STRING",
                    description: "The assignment status of the devices to list.",
                    enum: ["unassigned", "assigned"]
                }
            },
            required: ["status"]
        }
    },
    {
        name: "sendMessageToUser",
        description: "Send a direct notification message to a specific user.",
        parameters: {
            type: "OBJECT",
            properties: {
                userId: { type: "STRING", description: "The ID of the user to send the message to." },
                title: { type: "STRING", description: "The title of the message." },
                message: { type: "STRING", description: "The content of the message." }
            },
            required: ["userId", "title", "message"]
        }
    },
    {
        name: "listRecentFeedback",
        description: "List recent unresolved user feedback submissions, with options to filter by type and limit the number of results.",
        parameters: {
            type: "OBJECT",
            properties: {
                type: {
                    type: "STRING",
                    description: "The type of feedback to filter by.",
                    enum: ["BUG", "SUGGESTION", "COMPLAINT", "TIP", "all"]
                },
                limit: {
                    type: "NUMBER",
                    description: "Maximum number of feedback entries to retrieve (default is 5).",
                    default: 5
                }
            }
        }
    },
    {
        name: "getWeeklySummaryReport",
        description: "Generates a summary of performance including new users, revenue, energy stats, and feedback counts for a specified period.",
        parameters: {
            type: "OBJECT",
            properties: {
                period: {
                    type: "STRING",
                    description: "The time period for which to generate the report.",
                    enum: ["last_7_days", "last_30_days", "last_year"],
                    default: "last_7_days"
                }
            },
            required: ["period"]
        }
    },
    {
        name: "summarizeFeedback",
        description: "Summarizes unresolved user feedback over a given period, filtered by type. It provides counts and the content of the feedback.",
        parameters: {
            type: "OBJECT",
            properties: {
                type: {
                    type: "STRING",
                    description: "The type of feedback to filter by.",
                    enum: ["BUG", "SUGGESTION", "COMPLAINT", "TIP", "all"],
                    default: "all"
                },
                period: {
                    type: "STRING",
                    description: "The time period to summarize feedback for.",
                    enum: ["last_7_days", "last_30_days"],
                    default: "last_7_days"
                }
            },
            required: ["period"]
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

async function generateSpeech(text) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: text }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Orus" } } }
        }
    };
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`Gemini TTS API Error (${response.status}): ${await response.text()}`);
    const data = await response.json();
    const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (inlineData) return pcmToWav(inlineData.data, 24000);
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
            // No need to throw here, just return null so it can be handled
            return null;
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

    // Handle text-based input (JSON)
    if (req.is('application/json')) {
        // Note: express.json() middleware is usually applied globally in index.js, 
        // but here we are inside a router that might handle raw body.
        // We need to ensure we can parse JSON if the global middleware hasn't consumed it 
        // or if we are mixed with raw body parser.
        // Given the setup in index.js: app.use(express.json()); happens BEFORE mounting this router.
        // However, this router has router.use(express.raw(...)).
        // If the content-type is application/json, the global express.json() likely parsed it into req.body.

        if (!req.body || (!req.body.text && !req.body.content)) {
            return res.status(400).json({ error: 'No text data received.' });
        }

        // We can process this directly
        var transcription = req.body.text || req.body.content;
        console.log(`Text Input: "${transcription}"`);
    } else {
        // Handle Audio input
        if (!req.body || req.body.length === 0) return res.status(400).json({ error: 'No audio data received.' });

        try {
            console.log("Sending to Cloud STT...");
            const audioBytes = req.body.toString('base64');
            const speechRequest = {
                audio: { content: audioBytes },
                config: { encoding: 'WEBM_OPUS', sampleRateHertz: 48000, languageCode: 'en-US' },
            };
            const [speechResponse] = await speechClient.recognize(speechRequest);
            var transcription = speechResponse.results.map(result => result.alternatives[0].transcript).join('\n');
            console.log(`Transcription: "${transcription}"`);

            if (!transcription) {
                const fallbackAudio = await generateSpeech("I didn't catch that. Could you please repeat?");
                return res.set('Content-Type', 'audio/wav').send(fallbackAudio);
            }
        } catch (sttError) {
            console.error("STT Error:", sttError);
            return res.status(500).json({ error: "Speech recognition failed." });
        }
    }

    try {
        const availableTools = {
            getSystemStatus: async () => {
                console.log(`TOOL EXECUTED: getSystemStatus`);
                try {
                    // Attempt to fetch a simple document to check DB connection
                    // Read a known, common document. For example, the first 1 user document.
                    await dbAgent.collection('artifacts/default-app-id/users').limit(1).get();
                    return { status: "All systems are operational. Database connection is healthy." };
                } catch (error) {
                    console.error("Error checking system status:", error);
                    return { status: "System is experiencing issues. Database connection failed.", details: error.message };
                }
            },

            getSystemAnalytics: async ({ period = 'today' }) => {
                console.log(`TOOL EXECUTED: getSystemAnalytics (period: ${period})`);
                try {
                    const totalUsersSnapshot = await dbAgent.collection('artifacts/default-app-id/users').get();
                    const totalUsers = totalUsersSnapshot.size;

                    let newUsers = 0;
                    let devicesActive = 0;
                    let totalKwh = 0;
                    let solarKwh = 0;

                    const now = new Date();
                    let startDate = new Date(now);

                    if (period === 'today') {
                        startDate.setHours(0, 0, 0, 0);
                    } else if (period === 'last_7_days') {
                        startDate.setDate(now.getDate() - 7);
                        startDate.setHours(0, 0, 0, 0);
                    } else if (period === 'last_30_days') {
                        startDate.setDate(now.getDate() - 30);
                        startDate.setHours(0, 0, 0, 0);
                    }

                    const usersRef = dbAgent.collection('artifacts/default-app-id/users');
                    const newUsersQuery = usersRef.where('userProfile.profile.createdAt', '>=', startDate);
                    const newUsersSnapshot = await newUsersQuery.get();
                    newUsers = newUsersSnapshot.size;

                    const activeDevicesSnapshot = await dbAgent.collection('devices').where('userId', '!=', null).get();
                    devicesActive = activeDevicesSnapshot.size;

                    if (period === 'today') {
                        totalKwh = totalUsers * (Math.random() * 15 + 5); // 5-20 kWh per user
                        solarKwh = totalKwh * (Math.random() * 0.4 + 0.3); // 30-70% solar
                    } else if (period === 'last_7_days') {
                        totalKwh = totalUsers * (Math.random() * 15 + 5) * 7;
                        solarKwh = totalKwh * (Math.random() * 0.4 + 0.3);
                    } else if (period === 'last_30_days') {
                        totalKwh = totalUsers * (Math.random() * 15 + 5) * 30;
                        solarKwh = totalKwh * (Math.random() * 0.4 + 0.3);
                    }

                    return {
                        period: period,
                        totalUsers: totalUsers,
                        newUsers: newUsers,
                        activeDevices: devicesActive,
                        totalEnergyKwh: totalKwh.toFixed(2),
                        solarEnergyKwh: solarKwh.toFixed(2),
                        gridEnergyKwh: (totalKwh - solarKwh).toFixed(2),
                        message: "Analytics are currently high-level. More detailed reports coming soon!"
                    };

                } catch (error) {
                    console.error("Error getting system analytics:", error);
                    return { error: "Failed to retrieve system analytics." };
                }
            },

            listDevicesByStatus: async ({ status }) => {
                console.log(`TOOL EXECUTED: listDevicesByStatus (status: ${status})`);
                try {
                    const devicesRef = dbAgent.collection('devices');
                    let query;
                    if (status === 'unassigned') {
                        query = devicesRef.where('userId', '==', null);
                    } else { // 'assigned'
                        query = devicesRef.where('userId', '!=', null);
                    }
                    const snapshot = await query.get();
                    if (snapshot.empty) {
                        return { message: `No ${status} devices found.` };
                    }
                    const deviceList = snapshot.docs.map(doc => {
                        const { userId, ...rest } = doc.data(); // Exclude userId
                        return { deviceId: doc.id, ...rest };
                    });
                    return { devices: deviceList, count: deviceList.length };
                } catch (error) {
                    return { error: "An internal error occurred while listing devices." };
                }
            },
            sendMessageToUser: async ({ userId, title, message }) => {
                console.log(`TOOL EXECUTED: sendMessageToUser (user: ${userId})`);
                try {
                    await auth.getUser(userId); // Validate user exists
                    const notificationRef = dbAgent.collection(`artifacts/default-app-id/users/${userId}/notifications`);
                    await notificationRef.add({
                        title: title,
                        message: message,
                        createdAt: FieldValue.serverTimestamp(),
                        read: false,
                        type: 'admin_message'
                    });
                    return { success: `Message successfully sent to user ${userId}.` };
                } catch (error) {
                    if (error.code === 'auth/user-not-found') return { error: `User with ID ${userId} not found.` };
                    return { error: "An internal error occurred while sending the message." };
                }
            },
            listRecentFeedback: async ({ type = 'all', limit = 5 }) => {
                console.log(`TOOL EXECUTED: listRecentFeedback (type: ${type}, limit: ${limit})`);
                try {
                    let feedbackQuery = dbAgent.collection('feedback');

                    if (type && type.toLowerCase() !== 'all') {
                        feedbackQuery = feedbackQuery.where('type', '==', type.toUpperCase());
                    }

                    // Fetch a larger batch to account for filtering resolved items in memory
                    // (Since 'status' might be undefined for new items, we can't easily query != 'resolved')
                    const fetchLimit = Math.max(limit * 4, 20);
                    const snapshot = await feedbackQuery.orderBy('createdAt', 'desc').limit(fetchLimit).get();

                    // Filter: Exclude 'resolved' status. Keeps 'new', null, undefined, etc.
                    let validDocs = snapshot.docs.filter(doc => doc.data().status !== 'resolved');

                    // Apply the user's requested limit
                    if (validDocs.length > limit) {
                        validDocs = validDocs.slice(0, limit);
                    }

                    if (validDocs.length === 0) {
                        return { message: `No unresolved ${type && type.toLowerCase() !== 'all' ? type.toLowerCase() : ''} feedback found.` };
                    }

                    // Fetch all user profiles concurrently
                    const userProfilePromises = validDocs.map(doc => getUserProfileData(doc.data().uid).catch(() => null));
                    const userProfiles = await Promise.all(userProfilePromises);

                    const feedbackList = validDocs.map((doc, index) => {
                        const data = doc.data();
                        const profile = userProfiles[index];
                        return {
                            submittedBy: profile?.fullName || 'An unknown user',
                            feedbackType: data.type,
                            feedbackContent: data.text,
                            status: data.status || 'new'
                        };
                    });

                    return { feedback: feedbackList };
                } catch (error) {
                    console.error("Error listing feedback:", error);
                    return { error: "Failed to retrieve feedback." };
                }
            },

            getWeeklySummaryReport: async ({ period = 'last_7_days' }) => {
                console.log(`TOOL EXECUTED: getWeeklySummaryReport (period: ${period})`);
                try {
                    const now = new Date();
                    let daysAgo = 7;
                    let periodText = "Last 7 Days";

                    if (period === 'last_30_days') {
                        daysAgo = 30;
                        periodText = "Last 30 Days";
                    } else if (period === 'last_year') {
                        daysAgo = 365;
                        periodText = "Last Year";
                    }

                    const startDate = new Date();
                    startDate.setDate(now.getDate() - daysAgo);
                    startDate.setHours(0, 0, 0, 0);

                    // 1. New Users
                    const usersRef = dbAgent.collection('artifacts/default-app-id/users');
                    const newUsersQuery = usersRef.where('userProfile.profile.createdAt', '>=', startDate);
                    const newUsersSnapshot = await newUsersQuery.get();
                    const newUsersCount = newUsersSnapshot.size;

                    // 2. Revenue (Simplified)
                    // FIX: Use collectionGroup to query subcollections across all users
                    const premiumUsersSnapshot = await dbAgent.collectionGroup('userProfile')
                        .where('subscriptionTier', '==', 'Premium')
                        .where('role', '!=', 'admin')
                        .get();

                    const premiumUsersCount = premiumUsersSnapshot.size;
                    const monthlyRecurringRevenue = premiumUsersCount * 599;

                    const soldDevicesSnapshot = await dbAgent.collection('devices').where('userId', '!=', null).get();
                    const soldDevicesCount = soldDevicesSnapshot.size;
                    const totalHardwareRevenue = soldDevicesCount * 4999;

                    // 4. Energy Stats (Real Aggregation)
                    // Format startDate to YYYY-MM-DD for string comparison in Firestore
                    const startDateStr = startDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

                    const energySnapshot = await dbAgent.collectionGroup('daily_summaries')
                        .where('lastUpdated', '>=', startDateStr)
                        .get();

                    let realTotalKwh = 0;
                    let realSolarKwh = 0;

                    energySnapshot.forEach(doc => {
                        const data = doc.data();
                        realTotalKwh += (data.gridKwhTotal || 0) + (data.solarKwhTotal || 0);
                        realSolarKwh += (data.solarKwhTotal || 0);
                    });

                    // 5. Feedback Counts
                    const feedbackRef = dbAgent.collection('feedback');
                    const feedbackQuery = feedbackRef.where('createdAt', '>=', startDate);
                    const feedbackSnapshot = await feedbackQuery.get();
                    const totalFeedback = feedbackSnapshot.size;
                    let feedbackByType = { BUG: 0, SUGGESTION: 0, COMPLAINT: 0, TIP: 0, OTHER: 0 };
                    feedbackSnapshot.docs.forEach(doc => {
                        const type = doc.data().type;
                        if (feedbackByType.hasOwnProperty(type)) {
                            feedbackByType[type]++;
                        } else {
                            feedbackByType['OTHER'] = (feedbackByType['OTHER'] || 0) + 1;
                        }
                    });

                    return {
                        period: periodText,
                        newUsers: newUsersCount,
                        revenue: {
                            currentMRR: `₱${monthlyRecurringRevenue.toLocaleString()}`,
                            totalHardwareRevenue: `₱${totalHardwareRevenue.toLocaleString()}`,
                            note: "Weekly revenue tracking is still in development."
                        },
                        energy: {
                            totalConsumptionKwh: realTotalKwh.toFixed(2),
                            solarGenerationKwh: realSolarKwh.toFixed(2),
                        },
                        feedback: {
                            totalReceived: totalFeedback,
                            breakdown: feedbackByType
                        }
                    };

                } catch (error) {
                    console.error("Error generating weekly summary:", error);
                    return { error: "Failed to generate the weekly summary report." };
                }
            },
            summarizeFeedback: async ({ type = 'all', period = 'last_7_days' }) => {
                console.log(`TOOL EXECUTED: summarizeFeedback (type: ${type}, period: ${period})`);
                try {
                    const now = new Date();
                    const startDate = new Date(now);
                    if (period === 'last_7_days') {
                        startDate.setDate(now.getDate() - 7);
                    } else if (period === 'last_30_days') {
                        startDate.setDate(now.getDate() - 30);
                    }
                    startDate.setHours(0, 0, 0, 0);

                    let feedbackQuery = dbAgent.collection('feedback').where('createdAt', '>=', startDate);

                    if (type && type.toLowerCase() !== 'all') {
                        feedbackQuery = feedbackQuery.where('type', '==', type.toUpperCase());
                    }

                    const snapshot = await feedbackQuery.orderBy('createdAt', 'desc').get();

                    // Filter out resolved feedback
                    const unresolvedDocs = snapshot.docs.filter(doc => doc.data().status !== 'resolved');

                    if (unresolvedDocs.length === 0) {
                        return { message: `No unresolved ${type !== 'all' ? type.toLowerCase() : ''} feedback found in the ${period}.` };
                    }

                    const userProfilePromises = unresolvedDocs.map(doc => getUserProfileData(doc.data().uid).catch(() => null));
                    const userProfiles = await Promise.all(userProfilePromises);

                    const feedbackList = unresolvedDocs.map((doc, index) => {
                        const data = doc.data();
                        const profile = userProfiles[index];
                        return {
                            submittedBy: profile?.fullName || 'Unknown User',
                            type: data.type,
                            content: data.text,
                            date: data.createdAt.toDate().toISOString().split('T')[0]
                        };
                    });

                    let breakdown = {};
                    if (type.toLowerCase() === 'all') {
                        feedbackList.forEach(item => {
                            breakdown[item.type] = (breakdown[item.type] || 0) + 1;
                        });
                    }

                    return {
                        summary: {
                            totalFound: unresolvedDocs.length,
                            period: period,
                            filterType: type,
                            ...(Object.keys(breakdown).length > 0 && { breakdown: breakdown })
                        },
                        feedback: feedbackList
                    };

                } catch (error) {
                    console.error("Error summarizing feedback:", error);
                    return { error: "Failed to summarize feedback." };
                }
            },
        };

        const sessionRef = dbAgent.collection('agent_sessions').doc(req.user.uid);
        const sessionDoc = await sessionRef.get();
        let history = sessionDoc.exists ? sessionDoc.data().history || [] : [];
        if (history.length > 0 && history[0].role !== 'user') {
            const firstUserIndex = history.findIndex(h => h.role === 'user');
            history = firstUserIndex > -1 ? history.slice(firstUserIndex) : [];
        }

        const chat = model.startChat({ history: history, tools: [{ functionDeclarations: adminToolFunctions }] });
        const result = await chat.sendMessage(transcription);
        const response = result.response;
        const call = response?.candidates?.[0]?.content?.parts?.[0]?.functionCall;
        let geminiResponseText;

        if (call) {
            console.log("Gemini wants to call:", call.name);
            const apiResponse = await availableTools[call.name]({ ...call.args, uid: req.user.uid });
            console.log("Tool Result:", apiResponse);
            const result2 = await chat.sendMessage([{ functionResponse: { name: call.name, response: apiResponse } }]);
            geminiResponseText = result2.response.text();
        } else {
            geminiResponseText = response.text();
        }

        console.log(`Gemini Text: "${geminiResponseText}"`);
        let updatedHistory = await chat.getHistory();
        if (updatedHistory.length > 10) updatedHistory = updatedHistory.slice(updatedHistory.length - 10);
        if (updatedHistory.length > 0 && updatedHistory[0].role !== 'user') updatedHistory = updatedHistory.slice(1);
        await sessionRef.set({ history: updatedHistory, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

        console.log("Generating Audio (Orus)...");
        const audioBuffer = await generateSpeech(geminiResponseText);
        console.log("Audio generated successfully.");
        res.set('Content-Type', 'audio/wav').send(audioBuffer);

    } catch (error) {
        console.error("Agent Error:", error);
        res.status(500).json({ message: "Processing failed", error: error.message });
    }
});

export { router as adminAgentRouter };
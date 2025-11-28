import express from 'express';
import { auth, db } from './firebaseAdmin.js';
import rateLimit from 'express-rate-limit';
import fetch from 'node-fetch';

const userRouter = express.Router();

// --- Rate limiter middleware for sensitive endpoints ---
const predictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, error: "Too many prediction requests, please try again later." }
});

const tipsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit tip generation to 10 per hour per IP (save API costs)
    message: { success: false, error: "Too many tip generation requests. Please try again later." }
});

// Rate limiter for profile update endpoint
const profileUpdateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit to 10 profile updates per hour per IP
    message: { success: false, error: "Too many profile updates from this IP, please try again later." }
});

// --- MIDDLEWARE ---
const verifyToken = async (req, res, next) => {
    // 1. Try to get token from Custom Header (Production Fix)
    let idToken = req.headers['x-auth-token'];

    // 2. Fallback to Standard Header (Localhost/Standard behavior)
    if (!idToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    }

    if (!idToken) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Token Verification Error:", error);
        return res.status(403).json({ success: false, error: 'Invalid token' });
    }
};

// --- ROUTES ---

// POST /api/user/predict
userRouter.post('/predict', predictLimiter, verifyToken, async (req, res) => {
    const { deviceId } = req.body;
    const uid = req.user.uid;

    if (!deviceId) return res.status(400).json({ error: 'Device ID required' });

    try {
        const AI_SERVICE_URL = process.env.FORECAST_URL || process.env.VITE_FORECAST_URL;

        if (!AI_SERVICE_URL) {
            throw new Error("AI Service URL not configured");
        }

        const response = await fetch(AI_SERVICE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            },
            body: JSON.stringify({ deviceId, uid })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`AI Service Error: ${errText}`);
        }

        const data = await response.json();
        res.json({ success: true, data });

    } catch (error) {
        console.error("Prediction Proxy Error:", error.message);
        res.status(500).json({ success: false, error: 'AI Service failed' });
    }
});

// 2. SMART TIPS GENERATOR
userRouter.post('/generate-tips', tipsLimiter, verifyToken, async (req, res) => {
    const { energyData } = req.body;

    if (!energyData) {
        return res.status(400).json({ success: false, error: "Missing energy data." });
    }

    try {
        let prompt = `Act as an energy efficiency expert. Generate three concise, practical energy-saving tips based on the user's daily energy data.\n\n`;

        if (energyData.topConsumerName === "No major appliances monitored") {
            prompt += `Note: The system currently has no smart plug data, so the readings represent the total household consumption — including possible phantom or standby loads.\n`;
        } else {
            prompt += `- Top Energy Consumer: ${energyData.topConsumerName} using ${energyData.topConsumerUsage.toFixed(2)} kWh\n`;
        }

        prompt += `- Energy Source Breakdown: ${energyData.solarPercentage.toFixed(0)}% Solar, ${energyData.gridPercentage.toFixed(0)}% Grid\n`;
        prompt += `- Total Energy Consumed Today: ${energyData.totalKwh.toFixed(2)} kWh\n\n`;
        prompt += `Each tip must be an object with a "description" field in valid JSON format (array of objects). Do not include greetings, explanations, or extra commentary.`;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Server missing GEMINI_API_KEY");

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: { type: "OBJECT", properties: { "description": { "type": "STRING" } } }
                }
            }
        };

        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            throw new Error(`Gemini API Error: ${errText}`);
        }

        const result = await geminiResponse.json();
        const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (jsonText) {
            const tips = JSON.parse(jsonText);
            return res.json({ success: true, tips });
        } else {
            throw new Error("Empty response from Gemini.");
        }

    } catch (error) {
        console.error("Generate Tips Error:", error.message);
        return res.status(500).json({ success: false, error: "Failed to generate smart tips." });
    }
});

// 3. SECURE PROFILE UPDATE 
userRouter.put('/update-profile', profileUpdateLimiter, verifyToken, async (req, res) => {
    const uid = req.user.uid;
    // Added photoURL to destructuring
    const { fullName, phoneNumber, address, electricityProvider, photoURL, appId } = req.body;

    const targetAppId = appId || 'default-app-id';

    // Validation: Ensure required fields exist
    if (!fullName || !phoneNumber || !address) {
        return res.status(400).json({ error: "Name, Phone, and Address are required." });
    }

    try {
        const userDocRef = db.doc(`artifacts/${targetAppId}/users/${uid}/userProfile/profile`);

        // Prepare the update object
        // We only add photoURL if it exists in the request to avoid overwriting it with null/undefined
        const updateData = {
            fullName,
            phoneNumber,
            address,
            electricityProvider,
            lastUpdated: new Date().toISOString()
        };

        if (photoURL) {
            updateData.photoURL = photoURL;
        }

        // We use merge: true to avoid overwriting the entire document (protecting role/deviceId)
        await userDocRef.set(updateData, { merge: true });

        return res.json({ success: true, message: "Profile updated successfully." });

    } catch (error) {
        console.error("Profile update error:", error);
        return res.status(500).json({ error: "Failed to update profile." });
    }
});

export { userRouter };
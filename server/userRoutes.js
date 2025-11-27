import express from 'express';
import { auth } from './firebaseAdmin.js';
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
// This proxies the request to your Python AI Cloud Run service
userRouter.post('/predict', predictLimiter, verifyToken, async (req, res) => {
    const { deviceId } = req.body;
    const uid = req.user.uid;

    // Validate Input
    if (!deviceId) return res.status(400).json({ error: 'Device ID required' });

    // SECURITY CHECK: Ideally, check if 'uid' actually owns 'deviceId' in Firestore here.
    // For now, we assume the token is enough proof of access.

    try {
        // Get the Python Service URL from environment variables
        // (Ensure this is set in your apphosting.yaml / .env)
        const AI_SERVICE_URL = process.env.FORECAST_URL || process.env.VITE_FORECAST_URL;

        if (!AI_SERVICE_URL) {
            throw new Error("AI Service URL not configured");
        }

        // Call the Python Service
        // We pass the Auth Header along so Python can verify it too (if configured)
        const response = await fetch(AI_SERVICE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization // Forward the token!
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

// 2. SMART TIPS GENERATOR (New!)
userRouter.post('/generate-tips', tipsLimiter, verifyToken, async (req, res) => {
    const { energyData } = req.body;

    if (!energyData) {
        return res.status(400).json({ success: false, error: "Missing energy data." });
    }

    try {
        // 1. Construct the Prompt (Moved from Frontend)
        let prompt = `Act as an energy efficiency expert. Generate three concise, practical energy-saving tips based on the user's daily energy data.\n\n`;

        if (energyData.topConsumerName === "No major appliances monitored") {
            prompt += `Note: The system currently has no smart plug data, so the readings represent the total household consumption — including possible phantom or standby loads.\n`;
        } else {
            prompt += `- Top Energy Consumer: ${energyData.topConsumerName} using ${energyData.topConsumerUsage.toFixed(2)} kWh\n`;
        }

        prompt += `- Energy Source Breakdown: ${energyData.solarPercentage.toFixed(0)}% Solar, ${energyData.gridPercentage.toFixed(0)}% Grid\n`;
        prompt += `- Total Energy Consumed Today: ${energyData.totalKwh.toFixed(2)} kWh\n\n`;
        prompt += `Each tip must be an object with a "description" field in valid JSON format (array of objects). Do not include greetings, explanations, or extra commentary.`;

        // 2. Call Gemini API
        // Use the secure server-side environment variable
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Server missing GEMINI_API_KEY");

        // UPDATED MODEL NAME
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
        // Return a generic error to the client, log the specific one
        return res.status(500).json({ success: false, error: "Failed to generate smart tips." });
    }
});

export { userRouter };
import express from 'express';
import { auth } from './firebaseAdmin.js';
import rateLimit from 'express-rate-limit';

const userRouter = express.Router();

// --- Rate limiter middleware for sensitive endpoints ---
const predictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, error: "Too many prediction requests, please try again later." }
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

export { userRouter };
// server/adminRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';
// ✅ IMPORT FROM YOUR NEW FILE
import { db, auth } from './firebaseAdmin.js';

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // Increased for safety
    standardHeaders: true,
    legacyHeaders: false,
});

const adminRouter = express.Router();

// Middleware: Verify Token
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Token Error:", error);
        return res.status(403).json({ success: false, error: 'Invalid token' });
    }
};

// Middleware: Require Admin
const requireAdmin = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        // Adjust path if needed: artifacts -> default-app-id -> users...
        const userDoc = await db.collection('artifacts').doc('default-app-id').collection('users').doc(uid).collection('userProfile').doc('profile').get();

        if (userDoc.exists && userDoc.data().role === 'admin') {
            next();
        } else {
            return res.status(403).json({ success: false, error: 'Admins only' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};


// Input Validation
const validateUid = (req, res, next) => {
    const { uid } = req.body;
    if (!uid || typeof uid !== 'string' || uid.length > 128) {
        return res.status(400).json({ success: false, error: 'Invalid User ID format' });
    }
    next();
};

// Routes
adminRouter.post('/suspend-user', adminLimiter, verifyToken, requireAdmin, validateUid, async (req, res) => {
    // Logic remains the same, but now we know 'uid' is safe
    try {
        await auth.updateUser(req.body.uid, { disabled: true });
        res.json({ success: true });
    } catch (e) {
        console.error(`Suspend failed for ${req.body.uid}:`, e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' }); // Don't send raw error to client
    }
});

adminRouter.post('/enable-user', adminLimiter, verifyToken, requireAdmin, validateUid, async (req, res) => {
    try {
        await auth.updateUser(req.body.uid, { disabled: false });
        res.json({ success: true });
    } catch (e) {
        console.error(`Enable failed for ${req.body.uid}:`, e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

adminRouter.post('/delete-user', adminLimiter, verifyToken, requireAdmin, validateUid, async (req, res) => {
    try {
        await auth.deleteUser(req.body.uid);
        res.json({ success: true });
    } catch (e) {
        console.error(`Delete failed for ${req.body.uid}:`, e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export { adminRouter };
import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { db, auth, bucket } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

// --- CONFIGURATION ---
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.originalname.endsWith('.bin')) {
            cb(null, true);
        } else {
            cb(new Error('Only .bin firmware files are allowed!'));
        }
    }
});

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
});

const adminRouter = express.Router();

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

const requireAdmin = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        // Note: Verify 'default-app-id' is correct for your project.
        const userDoc = await db.collection('artifacts').doc('default-app-id').collection('users').doc(uid).collection('userProfile').doc('profile').get();

        if (userDoc.exists && userDoc.data().role === 'admin') {
            next();
        } else {
            return res.status(403).json({ success: false, error: 'Admins only' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error checking permissions' });
    }
};

const validateUid = (req, res, next) => {
    const { uid } = req.body;
    if (!uid || typeof uid !== 'string' || uid.length > 128) {
        return res.status(400).json({ success: false, error: 'Invalid User ID format' });
    }
    next();
};

// --- ROUTES ---

// 1. FIRMWARE UPLOAD
adminRouter.post('/upload-firmware', adminLimiter, verifyToken, requireAdmin, upload.single('firmware'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });
        const { version, description } = req.body;
        if (!version) return res.status(400).json({ success: false, error: 'Version required.' });

        const filename = `firmware/${version}_${Date.now()}.bin`;
        const file = bucket.file(filename);

        await file.save(req.file.buffer, {
            metadata: {
                contentType: 'application/octet-stream',
                metadata: { uploadedBy: req.user.uid, version: version }
            }
        });

        const [downloadURL] = await file.getSignedUrl({ action: 'read', expires: '01-01-2100' });

        await db.collection('firmware_releases').add({
            version, description: description || '', downloadURL, filename,
            size: req.file.size, uploadedAt: FieldValue.serverTimestamp(),
            createdBy: req.user.uid, status: 'Active'
        });

        await db.collection('admin_audit_logs').add({
            action: 'UPLOAD_FIRMWARE', adminUid: req.user.uid,
            details: { version, filename }, timestamp: FieldValue.serverTimestamp()
        });

        res.json({ success: true, message: 'Firmware deployed successfully', url: downloadURL });
    } catch (error) {
        console.error('Firmware upload failed:', error);
        res.status(500).json({ success: false, error: 'Upload failed: ' + error.message });
    }
});

// 2. SUSPEND USER (Auth + Firestore Status)
adminRouter.post('/suspend-user', adminLimiter, verifyToken, requireAdmin, validateUid, async (req, res) => {
    try {
        const uid = req.body.uid;

        // A. Disable in Auth (Prevents Login)
        await auth.updateUser(uid, { disabled: true });

        // B. Update Firestore Status (Updates UI)
        await db.collection('artifacts').doc('default-app-id').collection('users').doc(uid)
            .collection('userProfile').doc('profile')
            .update({ status: 'inactive' });

        await db.collection('admin_audit_logs').add({
            action: 'SUSPEND_USER', adminUid: req.user.uid, targetUid: uid, timestamp: FieldValue.serverTimestamp()
        });

        res.json({ success: true });
    } catch (e) {
        console.error('Suspend failed:', e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 3. ENABLE USER (Auth + Firestore Status)
adminRouter.post('/enable-user', adminLimiter, verifyToken, requireAdmin, validateUid, async (req, res) => {
    try {
        const uid = req.body.uid;

        // A. Enable in Auth
        await auth.updateUser(uid, { disabled: false });

        // B. Update Firestore Status
        await db.collection('artifacts').doc('default-app-id').collection('users').doc(uid)
            .collection('userProfile').doc('profile')
            .update({ status: 'active' });

        await db.collection('admin_audit_logs').add({
            action: 'ENABLE_USER', adminUid: req.user.uid, targetUid: uid, timestamp: FieldValue.serverTimestamp()
        });

        res.json({ success: true });
    } catch (e) {
        console.error('Enable failed:', e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 4. DELETE USER (Auth + Firestore Status)
adminRouter.post('/delete-user', adminLimiter, verifyToken, requireAdmin, validateUid, async (req, res) => {
    try {
        const uid = req.body.uid;

        // A. Delete from Auth (Permanent)
        await auth.deleteUser(uid);

        // B. Update Firestore Status to 'Deleted' (Soft Delete)
        await db.collection('artifacts').doc('default-app-id').collection('users').doc(uid)
            .collection('userProfile').doc('profile')
            .update({ status: 'deleted', deviceId: null });

        await db.collection('admin_audit_logs').add({
            action: 'DELETE_USER', adminUid: req.user.uid, targetUid: uid, timestamp: FieldValue.serverTimestamp()
        });

        res.json({ success: true });
    } catch (e) {
        console.error('Delete failed:', e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 5. EDIT USER (Profile + Device Switching)
adminRouter.post('/edit-user', adminLimiter, verifyToken, requireAdmin, async (req, res) => {
    try {
        const { uid, updates } = req.body;
        if (!uid || !updates) return res.status(400).json({ error: "Missing uid or updates" });

        const userProfileRef = db.collection('artifacts').doc('default-app-id').collection('users').doc(uid).collection('userProfile').doc('profile');

        // Get current data to check if device changed
        const currentDoc = await userProfileRef.get();
        if (!currentDoc.exists) return res.status(404).json({ error: "User profile not found" });

        const currentData = currentDoc.data();
        const oldDeviceId = currentData.deviceId;
        const newDeviceId = updates.deviceId;

        // A. Update Profile
        await userProfileRef.update({
            fullName: updates.name,
            address: updates.location,
            role: updates.role,
            deviceId: newDeviceId
        });

        // B. Handle Device Switching
        if (newDeviceId && newDeviceId !== oldDeviceId) {
            // 1. Unassign old device
            if (oldDeviceId && oldDeviceId !== 'None') {
                await db.collection('devices').doc(oldDeviceId).update({ userId: null, ownerName: null });
            }
            // 2. Assign new device
            if (newDeviceId !== 'None') {
                await db.collection('devices').doc(newDeviceId).update({
                    userId: uid,
                    ownerName: updates.name,
                    location: updates.location
                });
            }
        } else if (newDeviceId === 'None' && oldDeviceId && oldDeviceId !== 'None') {
            // Just unassign
            await db.collection('devices').doc(oldDeviceId).update({ userId: null, ownerName: null });
        }

        // C. Update Auth Display Name
        if (updates.name) {
            try {
                await auth.updateUser(uid, { displayName: updates.name });
            } catch (authErr) {
                console.warn("Could not update Auth Display Name:", authErr);
            }
        }

        await db.collection('admin_audit_logs').add({
            action: 'EDIT_USER', adminUid: req.user.uid, targetUid: uid, details: updates, timestamp: FieldValue.serverTimestamp()
        });

        res.json({ success: true });
    } catch (e) {
        console.error('Edit failed:', e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error: ' + e.message });
    }
});

export { adminRouter };
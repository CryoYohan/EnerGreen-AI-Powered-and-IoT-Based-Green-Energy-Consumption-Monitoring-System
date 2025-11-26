import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { db, auth, bucket } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore'; // Import FieldValue for serverTimestamp

// --- MULTER CONFIGURATION ---
// This handles the multipart/form-data sent by the frontend
const upload = multer({
    storage: multer.memoryStorage(), // Store file in RAM temporarily
    limits: {
        fileSize: 10 * 1024 * 1024 // Limit: 10MB (Plenty for ESP32 firmware)
    },
    fileFilter: (req, file, cb) => {
        // Strict validation: Only allow .bin files
        if (file.originalname.endsWith('.bin')) {
            cb(null, true);
        } else {
            cb(new Error('Only .bin firmware files are allowed!'));
        }
    }
});

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
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

const requireAdmin = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        // Check the user's profile for the 'admin' role
        const userDoc = await db.collection('artifacts').doc('default-app-id').collection('users').doc(uid).collection('userProfile').doc('profile').get();

        if (userDoc.exists && userDoc.data().role === 'admin') {
            next();
        } else {
            return res.status(403).json({ success: false, error: 'Admins only' });
        }
    } catch (error) {
        console.error("Admin Check Error:", error);
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

// 1. FIRMWARE UPLOAD ROUTE
// Matches the request from Firmware.vue
adminRouter.post('/upload-firmware',
    adminLimiter,
    verifyToken,
    requireAdmin,
    upload.single('firmware'), // Processes the 'firmware' field from FormData
    async (req, res) => {
        try {
            // 1. Validate Request
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No .bin file uploaded.' });
            }

            const { version, description } = req.body; // Metadata from FormData
            if (!version) {
                return res.status(400).json({ success: false, error: 'Version tag is required.' });
            }

            // 2. Define Storage Path
            // Using a timestamp ensures unique filenames even if version is reused
            const filename = `firmware/${version}_${Date.now()}.bin`;
            const file = bucket.file(filename);

            // 3. Upload File Stream to Firebase Storage
            await file.save(req.file.buffer, {
                metadata: {
                    contentType: 'application/octet-stream', // Standard binary type
                    metadata: {
                        uploadedBy: req.user.uid,
                        version: version,
                        originalName: req.file.originalname
                    }
                }
            });

            // 4. Generate a Long-Lived Signed URL
            // This URL allows devices to download the file securely
            // Expires in ~100 years (effectively permanent for OTA needs)
            const [downloadURL] = await file.getSignedUrl({
                action: 'read',
                expires: '01-01-2100'
            });

            // 5. Security: Audit Log
            // Log who uploaded this firmware
            await db.collection('admin_audit_logs').add({
                action: 'UPLOAD_FIRMWARE',
                adminUid: req.user.uid,
                timestamp: FieldValue.serverTimestamp(),
                details: {
                    version: version,
                    filename: filename,
                    size: req.file.size,
                    description: description || ''
                },
                ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            });

            // 6. Create Firestore Record
            // This allows the Frontend list to update automatically via onSnapshot
            await db.collection('firmware_releases').add({
                version: version,
                description: description || '',
                downloadURL: downloadURL,
                filename: filename, // Stored so we can delete it later if needed
                size: req.file.size,
                uploadedAt: FieldValue.serverTimestamp(),
                createdBy: req.user.uid,
                status: 'Active'
            });

            res.json({
                success: true,
                message: 'Firmware deployed successfully',
                url: downloadURL
            });

        } catch (error) {
            console.error('Firmware upload failed:', error);
            res.status(500).json({ success: false, error: 'Upload failed: ' + error.message });
        }
    }
);

// 2. USER MANAGEMENT ROUTES

adminRouter.post('/suspend-user', adminLimiter, verifyToken, requireAdmin, validateUid, async (req, res) => {
    try {
        await auth.updateUser(req.body.uid, { disabled: true });

        // Optional: Log the action
        await db.collection('admin_audit_logs').add({
            action: 'SUSPEND_USER',
            adminUid: req.user.uid,
            targetUid: req.body.uid,
            timestamp: FieldValue.serverTimestamp()
        });

        res.json({ success: true });
    } catch (e) {
        console.error('Suspend failed for user:', req.body.uid, e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

adminRouter.post('/enable-user', adminLimiter, verifyToken, requireAdmin, validateUid, async (req, res) => {
    try {
        await auth.updateUser(req.body.uid, { disabled: false });

        await db.collection('admin_audit_logs').add({
            action: 'ENABLE_USER',
            adminUid: req.user.uid,
            targetUid: req.body.uid,
            timestamp: FieldValue.serverTimestamp()
        });

        res.json({ success: true });
    } catch (e) {
        console.error('Enable failed for user:', req.body.uid, e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

adminRouter.post('/delete-user', adminLimiter, verifyToken, requireAdmin, validateUid, async (req, res) => {
    try {
        await auth.deleteUser(req.body.uid);

        await db.collection('admin_audit_logs').add({
            action: 'DELETE_USER',
            adminUid: req.user.uid,
            targetUid: req.body.uid,
            timestamp: FieldValue.serverTimestamp()
        });

        res.json({ success: true });
    } catch (e) {
        console.error('Delete failed for user:', req.body.uid, e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export { adminRouter };
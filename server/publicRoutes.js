import express from 'express';
import { db } from './firebaseAdmin.js';

const publicRouter = express.Router();

// Public endpoint to check if a device ID is valid
publicRouter.post('/check-device', async (req, res) => {
    const { deviceId } = req.body;

    // Trim whitespace to ensure "energreen_esp32_003" matches exactly
    const cleanDeviceId = deviceId ? deviceId.trim() : null;

    if (!cleanDeviceId) return res.status(400).json({ error: "Missing Device ID" });

    try {
        // FIX: Use .doc() instead of .document()
        const docRef = db.collection('devices').doc(cleanDeviceId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            // Device ID doesn't exist in the database at all
            return res.json({ exists: false, message: "Device ID not found in our system." });
        }

        const data = docSnap.data();

        // Check if the device is already claimed
        // Based on your data, if 'userId' or 'ownerName' is set, it's taken.
        if (data.userId || (data.ownerName && data.ownerName !== "")) {
            return res.json({
                exists: true,
                isTaken: true,
                message: "This Device ID is already registered to another account."
            });
        }

        // If it exists but has no owner/userId, it is free to use
        return res.json({ exists: true, isTaken: false, message: "Device available." });

    } catch (e) {
        console.error("Device check error:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

// CLAIM ENDPOINT
// Call this AFTER registration is successful
publicRouter.post('/claim-device', async (req, res) => {
    const { deviceId, userId, fullName } = req.body;

    const cleanDeviceId = deviceId ? deviceId.trim() : null;

    if (!cleanDeviceId || !userId || !fullName) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const docRef = db.collection('devices').doc(cleanDeviceId);

        // Double check it hasn't been taken in the last few seconds
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            if (data.userId) {
                return res.status(409).json({ error: "Device was just claimed by someone else." });
            }
        }

        // Update the Device Document
        await docRef.update({
            userId: userId,
            ownerName: fullName,
        });

        return res.json({ success: true, message: "Device successfully linked to user." });

    } catch (e) {
        console.error("Claim device error:", e);
        res.status(500).json({ error: "Failed to link device." });
    }
});

export { publicRouter };
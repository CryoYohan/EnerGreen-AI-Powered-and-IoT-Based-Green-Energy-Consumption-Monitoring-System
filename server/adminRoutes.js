import express from 'express';

const adminRouter = express.Router();

// ----------------------------------------------------------------------
// *** IMPORTANT: You need a real function to check admin authorization ***
// This is a placeholder. You must implement actual Firebase Auth token 
// verification and check the user's role (e.g., looking up in Firestore).
const isAdminAuthorized = (adminUid) => {
    // Implement real authorization logic here!
    return !!adminUid; // Example: just checking if the UID exists
};
// ----------------------------------------------------------------------

// POST /api/admin/suspend-user
adminRouter.post('/suspend-user', async (req, res) => {
    const { uid, adminUid } = req.body;

    if (!isAdminAuthorized(adminUid)) {
        return res.status(403).json({ success: false, error: 'Forbidden: Admin not authorized' });
    }

    // Access the secure secret variable from the environment
    const BACKEND_URL = process.env.SUSPEND_USER_URL;

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, adminUid }),
        });

        const result = await response.json();
        res.status(response.status).json(result);
    } catch (error) {
        console.error("Error calling external SUSPEND API:", error);
        res.status(500).json({ success: false, error: 'Internal server error calling backend' });
    }
});


// POST /api/admin/delete-user 
adminRouter.post('/delete-user', async (req, res) => {
    const { uid, adminUid } = req.body;

    if (!isAdminAuthorized(adminUid)) {
        return res.status(403).json({ success: false, error: 'Forbidden: Admin not authorized' });
    }

    // Access the secure secret variable from the environment
    const BACKEND_URL = process.env.DELETE_USER_URL;

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, adminUid }),
        });

        const result = await response.json();
        res.status(response.status).json(result);
    } catch (error) {
        console.error("Error calling external DELETE API:", error);
        res.status(500).json({ success: false, error: 'Internal server error calling backend' });
    }
});


// POST /api/admin/enable-user
adminRouter.post('/enable-user', async (req, res) => {
    const { uid, adminUid } = req.body;

    if (!isAdminAuthorized(adminUid)) {
        return res.status(403).json({ success: false, error: 'Forbidden: Admin not authorized' });
    }

    // Access the secure secret variable from the environment
    const BACKEND_URL = process.env.ENABLE_USER_URL;

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, adminUid }),
        });

        const result = await response.json();
        res.status(response.status).json(result);
    } catch (error) {
        console.error("Error calling external ENABLE API:", error);
        res.status(500).json({ success: false, error: 'Internal server error calling backend' });
    }
});


export { adminRouter };
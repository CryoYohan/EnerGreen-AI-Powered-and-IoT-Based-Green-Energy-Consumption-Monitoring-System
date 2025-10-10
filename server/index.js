import express from 'express';
import cors from 'cors';

// Create the Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies from your Vue app

// ----------------------------------------------------------------------
// 1. IMPORT YOUR PROXY ROUTES HERE
// ----------------------------------------------------------------------
import { adminRouter } from './adminRoutes.js';

// Route all internal '/api/admin/*' calls to the adminRouter
// Note: The frontend calls /api/admin/suspend-user
app.use('/api/admin', adminRouter);

// Fallback: This is required for Firebase App Hosting to deploy properly
// It serves the built Vue client application for all other requests.
// If you are using your apphosting.yaml rewrites, this might be optional 
// but often safer to include in the Express app.
app.use((req, res) => {
    // For a simple setup, you would typically serve the static files from /dist
    // Firebase App Hosting handles the static serving, so this is mainly a 
    // placeholder for any other server-side logic you might add.
    res.status(404).send('API route not found or not handled.');
});

// CRITICAL: Export the app for Cloud Run to pick up
// This is the function that Firebase App Hosting/Cloud Run will look for.
export { app };

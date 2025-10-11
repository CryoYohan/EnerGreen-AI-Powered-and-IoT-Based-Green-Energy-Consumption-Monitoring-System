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

// Fallback: Handle unmatched routes
app.use((req, res) => {
    res.status(404).send('API route not found or not handled.');
});

// Start the server on the port specified by Cloud Run (default 8080)
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Export the app (optional, but harmless to keep for compatibility)
export { app };
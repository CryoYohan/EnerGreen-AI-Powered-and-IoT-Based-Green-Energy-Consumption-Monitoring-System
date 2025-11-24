// server/index.js
import express from 'express';
import cors from 'cors';
import { adminRouter } from './adminRoutes.js';

const app = express();

// ALLOW CORS FOR YOUR LIVE SITE
const allowedOrigins = [
    'http://localhost:5173',
    'https://energreen-ai-powered-iot-based.web.app',
    'https://energreen-ai-powered-iot-based.firebaseapp.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Temporarily allow all for debugging deployment
        }
    }
}));

app.use(express.json());
app.use('/api/admin', adminRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});

export { app };
import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; // 1. Import Helmet
import { adminRouter } from './adminRoutes.js';

const app = express();

// 2. ARMOR: Use Helmet immediately
app.use(helmet());
app.disable('x-powered-by'); // Hide that we use Express

// 3. STRICT CORS: Define exactly who can talk to us
const allowedOrigins = [
    'https://energreen-ai-powered-iot-based.web.app',
    'https://energreen-ai-powered-iot-based.firebaseapp.com'
    // Note: We REMOVED localhost. In Production, only Production talks to Backend.
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or server-to-server)
        // If you want to be SUPER STRICT, block no-origin too, but it might break redirects.
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`Blocked request from: ${origin}`);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: ['GET', 'POST'], // Only allow necessary methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Only allow these headers
}));

app.use(express.json());

// Mount Routes
app.use('/api/admin', adminRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});

export { app };
import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // If you use a .env file locally
import helmet from 'helmet'; // 1. Import Helmet
import { adminRouter } from './adminRoutes.js';
import { userRouter } from './userRoutes.js';
import { publicRouter } from './publicRoutes.js';
import { agentRouter } from './agentRoutes.js';
import { adminAgentRouter } from './adminAgentRoutes.js';

const app = express();

// This tells Express to trust the Load Balancer's headers (Cloud Run standard)
app.set('trust proxy', 1);


// 2. ARMOR: Use Helmet immediately
app.use(helmet());
app.disable('x-powered-by'); // Hide that we use Express

// 3. STRICT CORS: Define exactly who can talk to us
const allowedOrigins = [
    'https://energreen-ai-powered-iot-based.web.app',
    'https://energreen-ai-powered-iot-based.firebaseapp.com',
    'http://localhost:5173'
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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token'] // Only allow these headers
}));

app.use(express.json());

// Mount Routes
app.use('/api/admin', adminRouter);
app.use('/api/admin/agent', adminAgentRouter);
app.use('/api/user', userRouter);
app.use('/api/public', publicRouter);
app.use('/api/agent', agentRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});

export { app };
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyFilePath = path.join(__dirname, 'serviceAccountKey.json');

const projectId = process.env.GOOGLE_CLOUD_PROJECT || "energreen-ai-powered-iot-based";
const bucketName = `${projectId}.firebasestorage.app`;

// Initialize only once
if (!admin.apps.length) {
    const serviceAccountExists = fs.existsSync(keyFilePath);
    
    const options = {
        storageBucket: bucketName
    };

    if (serviceAccountExists) {
        console.log("✅ Initializing Firebase Admin with local Service Account Key.");
        const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
        options.credential = admin.credential.cert(serviceAccount);
    } else {
        console.log("✅ Initializing Firebase Admin with Application Default Credentials.");
    }

    admin.initializeApp(options);
}

const db = getFirestore();
const auth = getAuth();
const bucket = getStorage().bucket();

export { admin, db, auth, bucket };
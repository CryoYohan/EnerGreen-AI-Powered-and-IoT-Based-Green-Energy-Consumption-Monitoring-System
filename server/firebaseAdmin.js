import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// 1. Define your bucket name
// In production (Cloud Run), process.env.GOOGLE_CLOUD_PROJECT is usually set automatically.
// Fallback is your specific project ID + .firebasestorage.app
const projectId = process.env.GOOGLE_CLOUD_PROJECT || "energreen-ai-powered-iot-based";
const bucketName = `${projectId}.firebasestorage.app`;

// Initialize only once
if (!admin.apps.length) {
    admin.initializeApp({
        // 2. Pass the storageBucket option here
        storageBucket: bucketName
    });
}

const db = getFirestore();
const auth = getAuth();

// 3. Get the bucket defined above
const bucket = getStorage().bucket();

export { admin, db, auth, bucket };
// server/firebaseAdmin.js
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Initialize only once
if (!admin.apps.length) {
    // If you haven't set 'storageBucket' in your environment, 
    // you might need to pass it here: { credential: ..., storageBucket: '...' }
    // But usually, on Cloud Run/App Hosting, it finds the default one automatically.
    admin.initializeApp();
}

const db = getFirestore();
const auth = getAuth();
const bucket = getStorage().bucket(); // 2. Get the default Storage Bucket

export { admin, db, auth, bucket };
// server/firebaseAdmin.js
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize only once
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = getFirestore();
const auth = getAuth();

export { admin, db, auth };
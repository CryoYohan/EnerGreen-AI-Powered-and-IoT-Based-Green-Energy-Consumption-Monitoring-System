// This imports modules from the installed 'firebase' package.
import { initializeApp } from "firebase/app";

// Import all necessary Auth functions
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    setPersistence,
    browserSessionPersistence
} from "firebase/auth";

// Import all necessary Firestore functions
import {
    getFirestore,
    collection,
    onSnapshot,
    query,
    orderBy,
    limit,
    addDoc,
    doc,
    setDoc,
    getDocs,
    getDoc,
    where,
    startAfter,
    Timestamp,
    // NEW: Add collectionGroup here to import it from the SDK
    collectionGroup, 
} from "firebase/firestore";

// 1. IMPORT STORAGE (New)
import { getStorage } from "firebase/storage";

// Firebase configuration.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase with your config.
const app = initializeApp(firebaseConfig);

// Get a reference to the services.
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // 2. INITIALIZE STORAGE (New)

// Export the initialized services and functions
export {
    app,
    auth,
    db,
    storage, // 3. EXPORT STORAGE (New)

    // Auth Functions
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    setPersistence,
    browserSessionPersistence,

    // Firestore Functions
    collection,
    onSnapshot,
    query,
    orderBy,
    addDoc,
    doc,
    setDoc,
    getDocs,
    getDoc,
    where,
    startAfter,
    limit,
    Timestamp,
    // NEW: Export collectionGroup here
    collectionGroup,
};
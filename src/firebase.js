// This imports modules from the installed 'firebase' package.
import { initializeApp } from "firebase/app";

// Import all necessary Auth functions from the 'firebase/auth' module
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail // Added for password recovery
} from "firebase/auth";

// Import all necessary Firestore functions from the 'firebase/firestore' module
import {
    getFirestore,
    collection,
    onSnapshot,
    query,
    orderBy,
    limit,
    addDoc,
    doc,
    setDoc
} from "firebase/firestore";

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

// Get a reference to the Auth and Firestore services.
const auth = getAuth(app);
const db = getFirestore(app);

// Export the initialized services and all the specific functions
// that your components will need.
export {
    app,
    auth,
    db,
    // Auth Functions
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail, // Added for password recovery
    // Firestore Functions
    collection,
    onSnapshot,
    query,
    orderBy,
    limit,
    addDoc,
    doc,
    setDoc
};

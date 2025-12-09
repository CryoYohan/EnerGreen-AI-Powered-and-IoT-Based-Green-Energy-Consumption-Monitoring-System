// tests/__mocks__/firebase-auth.js
import { vi } from 'vitest';
import { _mockAuth } from '../firebase'; // Access the shared mockAuth

export const onAuthStateChanged = vi.fn((authInstance, callback) => {
    console.log('Mock onAuthStateChanged called!'); // Debug log
    _mockAuth.authCallback = callback; // Store the callback for test control
    return vi.fn(); // Return an unsubscribe function
});

// tests/__mocks__/firebase.js
import { vi } from 'vitest';

export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn(), // Will be implemented by firebase-auth mock
  authCallback: null, // For tests to set
};

export const mockFirestore = {
  db: {},
  doc: vi.fn(),
  onSnapshot: vi.fn(),
  snapshotCallback: null, // For tests to set
  snapshotErrorCallback: null, // For tests to set
};

// Original firebase.js exports
export const auth = mockAuth;
export const db = mockFirestore.db;
export const doc = mockFirestore.doc;
export const onSnapshot = mockFirestore.onSnapshot;

// Expose internal mocks for test manipulation
export const _mockAuth = mockAuth;
export const _mockFirestore = mockFirestore;

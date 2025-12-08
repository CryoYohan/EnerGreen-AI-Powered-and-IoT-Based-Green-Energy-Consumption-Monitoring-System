// tests/__mocks__/firebase-storage.js
import { vi } from 'vitest';

// Define the spy function once globally for this mock file
const getDownloadURLSpy = vi.fn(() => Promise.reject('Default storage fetch failed'));

export const mockStorage = {
  getStorage: vi.fn(() => ({ /* mock storage instance */ })),
  ref: vi.fn(() => ({ /* mock storage ref */ })),
  getDownloadURL: getDownloadURLSpy, // Use the singleton spy
};

export const getStorage = mockStorage.getStorage;
export const ref = mockStorage.ref; 
export const getDownloadURL = mockStorage.getDownloadURL; // This will be the spy that useAuth imports

// Expose internal mock for test manipulation
export const _mockStorage = mockStorage;

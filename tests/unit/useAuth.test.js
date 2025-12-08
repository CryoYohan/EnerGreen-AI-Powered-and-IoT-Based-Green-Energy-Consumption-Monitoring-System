import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 1. Mock setup must happen BEFORE imports
vi.mock('@/firebase.js', () => import('../__mocks__/firebase.js'));
vi.mock('firebase/auth', () => import('../__mocks__/firebase/auth.js'));
vi.mock('firebase/storage', () => import('../__mocks__/firebase-storage.js'));

// 2. Import the shared mock objects
// Because of the factory functions above, these imports should resolve to the SAME objects useAuth gets
import { _mockAuth, _mockFirestore } from '../__mocks__/firebase.js';
import { _mockStorage } from '../__mocks__/firebase-storage.js';

// 3. Import the composable under test
import { useAuth } from '@/composables/useAuth';

describe('useAuth', () => {
  const appId = 'test-app-id';
  let authComposable;

  beforeEach(async () => {
    // Reset state of the *shared* mock objects
    vi.clearAllMocks();
    _mockAuth.currentUser = null;
    _mockAuth.authCallback = null; // Crucial: Reset the callback slot
    _mockFirestore.snapshotCallback = null;
    _mockFirestore.snapshotErrorCallback = null;
    
    // Ensure default storage behavior is success for this suite
    _mockStorage.getDownloadURL.mockResolvedValue('http://mock.com/default-pfp-from-mock.png');

    // Initialize composable
    authComposable = useAuth(appId);
    
    // Wait for any pending promises (the IIFE in useAuth)
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  it('should initialize with no user and isLoading true', async () => {
    // Trigger auth state change to null (not logged in)
    // We must ensure _mockAuth.authCallback is populated. 
    // If useAuth mounted correctly, it called onAuthStateChanged, which populated this.
    if (_mockAuth.authCallback) {
        _mockAuth.authCallback(null);
    } else {
        // If this fails, it means useAuth didn't call onAuthStateChanged on the mock we are holding.
        console.warn('TEST WARNING: _mockAuth.authCallback is null. Mock mismatch?');
    }
    
    await authComposable.waitForAuthReady(); 

    const { user, userProfile, isLoading } = authComposable;
    expect(user.value).toBeNull();
    expect(userProfile.value).toBeNull();
    expect(isLoading.value).toBe(false); 
  });

  it('should set user and fetch profile when firebaseUser is present', async () => {
    const firebaseUser = { uid: 'test-uid', email: 'test@example.com', emailVerified: true };
    
    // 1. Trigger Auth Login
    if (_mockAuth.authCallback) _mockAuth.authCallback(firebaseUser);

    // 2. Trigger Firestore Profile Snapshot
    const mockProfileData = { role: 'user', subscriptionTier: 'Free', photoURL: 'http://mock.com/user-pfp.png' };
    if (_mockFirestore.snapshotCallback) {
        _mockFirestore.snapshotCallback({
            exists: () => true,
            id: 'profile',
            data: () => mockProfileData,
        });
    }

    await authComposable.waitForAuthReady();
    // Allow Vue reactivity to propagate
    await new Promise(resolve => setTimeout(resolve, 5)); 
    
    const { user, userProfile, isAdmin } = authComposable;
    expect(user.value.uid).toBe('test-uid');
    expect(userProfile.value.role).toBe('user');
    expect(isAdmin.value).toBe(false);
  });

  it('should correctly identify an admin user', async () => {
    const firebaseUser = { uid: 'admin-uid', email: 'admin@example.com' };
    if (_mockAuth.authCallback) _mockAuth.authCallback(firebaseUser);
    
    if (_mockFirestore.snapshotCallback) {
        _mockFirestore.snapshotCallback({
            exists: () => true,
            id: 'profile',
            data: () => ({ role: 'admin', subscriptionTier: 'Premium' }),
        });
    }
    await authComposable.waitForAuthReady();

    const { isAdmin } = authComposable;
    expect(isAdmin.value).toBe(true);
  });
  
  it('should handle Firestore snapshot errors', async () => {
    const firebaseUser = { uid: 'error-uid', email: 'error@example.com' };
    if (_mockAuth.authCallback) _mockAuth.authCallback(firebaseUser);
    
    const mockError = new Error('Permission denied');
    if (_mockFirestore.snapshotErrorCallback) {
        _mockFirestore.snapshotErrorCallback(mockError);
    }
    await authComposable.waitForAuthReady();

    const { error } = authComposable;
    expect(error.value).toBe(mockError.message);
  });

  it('should use default pfp if user has no photoURL', async () => {
    const firebaseUser = { uid: 'no-pfp-uid', email: 'test@example.com' };
    if (_mockAuth.authCallback) _mockAuth.authCallback(firebaseUser);
    
    if (_mockFirestore.snapshotCallback) {
        _mockFirestore.snapshotCallback({
            exists: () => true,
            id: 'profile',
            data: () => ({ role: 'user' }), // No photoURL
        });
    }
    await authComposable.waitForAuthReady();

    const { displayPhotoURL } = authComposable;
    // Should fall back to the successful mock value we set in beforeEach
    expect(displayPhotoURL.value).toBe('http://mock.com/default-pfp-from-mock.png');
  });
});

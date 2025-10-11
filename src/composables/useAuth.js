import { ref, onUnmounted } from 'vue';
import { auth, db, doc, getDoc } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

// Define a promise outside the function scope. This promise is shared across 
// all calls to useAuth and ensures that the initial load check only resolves once, 
// when the very first onAuthStateChanged fires and completes its profile fetch.
let isAuthReadyPromiseResolve;
const isAuthReadyPromise = new Promise(resolve => {
  // Check if resolve function is already defined (prevents re-defining if hot-reloaded)
  if (!isAuthReadyPromiseResolve) {
    isAuthReadyPromiseResolve = resolve;
  } else {
    // If it's already defined, resolve immediately for subsequent component mounting
    // to prevent components from hanging unnecessarily.
    resolve();
  }
});


export function useAuth(appId) {
  const user = ref(null);
  const userProfile = ref(null);
  const isLoading = ref(true);
  const error = ref(null);

  // Expose the function to allow router guards to await the initial state load.
  const waitForAuthReady = () => isAuthReadyPromise;

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    isLoading.value = true;
    error.value = null;

    if (firebaseUser) {
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
      };
      try {
        let attempts = 3;
        while (attempts > 0) {
          try {
            const userDocRef = doc(db, `artifacts/${appId}/users/${firebaseUser.uid}/userProfile/profile`);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              userProfile.value = { id: userDoc.id, ...userDoc.data() };
              console.log('useAuth: Profile fetched:', userProfile.value);
              break;
            } else {
              userProfile.value = null;
              error.value = 'User profile not found in Firestore';
              console.error('useAuth: Profile document does not exist for user:', firebaseUser.uid);
              break;
            }
          } catch (err) {
            console.error(`useAuth: Firestore fetch attempt ${4 - attempts}:`, err.message);
            attempts--;
            if (attempts === 0) {
              error.value = `Failed to fetch user profile: ${err.message}`;
              userProfile.value = null;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (err) {
        console.error('useAuth: Unexpected error in profile fetch:', err.message);
        error.value = err.message;
        userProfile.value = null;
      }
    } else {
      user.value = null;
      userProfile.value = null;
      console.log('useAuth: No user authenticated');
    }

    isLoading.value = false;

    // **NEW FIX:** Resolve the promise once the first full load (auth + profile) is done.
    if (isAuthReadyPromiseResolve) {
      isAuthReadyPromiseResolve();
    }

  }, (err) => {
    console.error('useAuth: Auth state error:', err.message);
    error.value = err.message;
    isLoading.value = false;

    // **NEW FIX:** Resolve the promise even if the auth state load resulted in an error.
    if (isAuthReadyPromiseResolve) {
      isAuthReadyPromiseResolve();
    }
  });

  onUnmounted(() => {
    unsubscribe();
  });

  // **EXPORT NEW FUNCTION**
  return { user, userProfile, isLoading, error, waitForAuthReady };
}
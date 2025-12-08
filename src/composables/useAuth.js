import { ref, computed, onUnmounted } from 'vue';
import { auth, db, doc, onSnapshot } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

const defaultStorageURL = ref(null);
const localFallbackURL = '/src/Images/profile/pfp.png';

// Fetch the default URL from Firebase Storage once.
(async () => {
  try {
    const storage = getStorage();
    const pathReference = storageRef(storage, 'gs://energreen-ai-powered-iot-based.firebasestorage.app/profile_pictures/Default/pfp.png');
    defaultStorageURL.value = await getDownloadURL(pathReference);
    console.log('useAuth: Fetched default profile picture from Storage.');
  } catch (error) {
    console.warn("useAuth: Could not fetch default profile pic from Storage, will use local fallback.", error.code);
  }
})();

let isAuthReadyPromiseResolve;
const isAuthReadyPromise = new Promise(resolve => {
  if (!isAuthReadyPromiseResolve) {
    isAuthReadyPromiseResolve = resolve;
  } else {
    resolve();
  }
});

export function useAuth(appId) {
  const user = ref(null);
  const userProfile = ref(null);
  const isLoading = ref(true);
  const error = ref(null);

  const waitForAuthReady = () => isAuthReadyPromise;

  const isPremium = computed(() => userProfile.value?.subscriptionTier === 'Premium');
  const isAdmin = computed(() => userProfile.value?.role === 'admin');
  const displayPhotoURL = computed(() => {
    return userProfile.value?.photoURL || defaultStorageURL.value || localFallbackURL;
  });

  let profileUnsubscribe = null;

  console.log('useAuth: onAuthStateChanged is:', onAuthStateChanged); // DEBUG LOG
  const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    // If there's an existing profile listener, unsubscribe first (e.g., user switch)
    if (profileUnsubscribe) {
      profileUnsubscribe();
      profileUnsubscribe = null;
    }

    if (firebaseUser) {
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
      };
      
      isLoading.value = true;
      error.value = null;

      try {
        const userDocRef = doc(db, `artifacts/${appId}/users/${firebaseUser.uid}/userProfile/profile`);
        
        // Use onSnapshot for real-time updates
        profileUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            userProfile.value = { id: docSnap.id, ...docSnap.data() };
            // console.log('useAuth: Profile updated:', userProfile.value);
          } else {
            userProfile.value = null;
            error.value = 'User profile not found in Firestore';
            console.error('useAuth: Profile document does not exist for user:', firebaseUser.uid);
          }
          isLoading.value = false;
          
          if (isAuthReadyPromiseResolve) isAuthReadyPromiseResolve();
        }, (err) => {
          console.error('useAuth: Profile snapshot error:', err.message);
          error.value = err.message;
          isLoading.value = false;
        });

      } catch (err) {
        console.error('useAuth: Unexpected error setting up profile listener:', err.message);
        error.value = err.message;
        userProfile.value = null;
        isLoading.value = false;
      }
    } else {
      user.value = null;
      userProfile.value = null;
      console.log('useAuth: No user authenticated');
      isLoading.value = false;

      if (isAuthReadyPromiseResolve) isAuthReadyPromiseResolve();
    }
  }, (err) => {
    console.error('useAuth: Auth state error:', err.message);
    error.value = err.message;
    isLoading.value = false;

    if (isAuthReadyPromiseResolve) {
      isAuthReadyPromiseResolve();
    }
  });

  onUnmounted(() => {
    authUnsubscribe();
    if (profileUnsubscribe) profileUnsubscribe();
  });

  return { user, userProfile, isLoading, error, isPremium, isAdmin, displayPhotoURL, waitForAuthReady };
}
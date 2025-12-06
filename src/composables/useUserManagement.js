import { ref, reactive, onMounted, onUnmounted } from "vue";
import { initializeApp } from "firebase/app"; 
import { getAuth, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collectionGroup, collection, query, onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase.js";
import { adminService } from "@/services/adminService";

/**
 * Composable for User Management Page.
 * Handles creating, editing, suspending, and deleting users.
 * Encapsulates the Secondary App Auth logic for creating users without logging out admin.
 */
export function useUserManagement() {
  // Config for secondary app
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  // Data
  const users = ref([]);
  const devices = ref([]);
  
  // Loading States
  const isAddingUser = ref(false);
  const isEditingUser = ref(false);

  // Listeners
  let unsubscribeUsers = null;
  let unsubscribeDevices = null;
  let unsubscribeAuth = null;

  const initUserManagement = () => {
    const mainAuth = getAuth();
    unsubscribeAuth = onAuthStateChanged(mainAuth, (user) => {
      if (user) {
        // 1. Users
        if (!unsubscribeUsers) {
          const qUsers = query(collectionGroup(db, 'userProfile'));
          unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            users.value = snapshot.docs.map(docSnap => {
              const data = docSnap.data();
              const uid = docSnap.ref.parent.parent ? docSnap.ref.parent.parent.id : docSnap.id; 
              return {
                userId: uid,
                docPath: docSnap.ref.path,
                name: data.fullName || data.name || "Unnamed",
                email: data.email || "No Email",
                location: data.address || data.location || "Unknown",
                smartMeterID: data.deviceId || "None",
                status: data.status || "Active",
                role: data.role || "user",
                photoURL: data.photoURL,
                electricityProvider: data.electricityProvider || 'veco',
                subscriptionTier: data.subscriptionTier || 'Free',
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
              };
            });
          });
        }

        // 2. Devices
        if (!unsubscribeDevices) {
          const qDevices = query(collection(db, "devices"));
          unsubscribeDevices = onSnapshot(qDevices, (snapshot) => {
            devices.value = snapshot.docs.map(doc => doc.data());
          });
        }
      } else {
        cleanupUserManagement();
      }
    });
  };

  const cleanupUserManagement = () => {
    if (unsubscribeUsers) unsubscribeUsers();
    if (unsubscribeDevices) unsubscribeDevices();
    if (unsubscribeAuth) unsubscribeAuth();
  };

  // --- Actions ---

  const createUser = async (formData) => {
    isAddingUser.value = true;
    let secondaryApp = null;

    try {
      // Create user in Auth using secondary app instance
      secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      const newUid = userCredential.user.uid;
      
      // Create Firestore Profile
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const userProfileRef = doc(db, `artifacts/${appId}/users/${newUid}/userProfile/profile`);
      
      await setDoc(userProfileRef, {
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        role: formData.role,
        deviceId: formData.deviceId === 'None' ? null : formData.deviceId,
        electricityProvider: formData.electricityProvider,
        subscriptionTier: formData.subscriptionTier,
        subscriptionStatus: 'Active',
        photoURL: null,
        status: 'Active',
        createdAt: serverTimestamp()
      });

      // Link Device if needed
      if (formData.deviceId !== 'None') {
        const { updateDoc } = await import("firebase/firestore"); 
        const deviceRef = doc(db, "devices", formData.deviceId);
        await updateDoc(deviceRef, {
          userId: newUid,
          ownerName: formData.fullName,
          location: formData.address 
        });
      }

      await signOut(secondaryAuth);
      return { success: true };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error: error.message };
    } finally {
      isAddingUser.value = false;
      // Cleanup secondary app if needed, though it's garbage collected usually
    }
  };

  const updateUserStatus = async (user, status) => {
    const action = status === 'Inactive' ? adminService.suspendUser : adminService.enableUser;
    try {
        const result = await action(user.userId);
        return { success: true, data: result.data };
    } catch (error) {
        const msg = error.response?.data?.error || error.message;
        return { success: false, error: msg };
    }
  };

  const removeUser = async (user) => {
    try {
        const result = await adminService.deleteUser(user.userId);
        return { success: true, data: result.data };
    } catch (error) {
        const msg = error.response?.data?.error || error.message;
        return { success: false, error: msg };
    }
  };

  const updateUserProfile = async (userId, updates) => {
    isEditingUser.value = true;
    try {
        const result = await adminService.editUser(userId, updates);
        return { success: true, data: result.data };
    } catch (error) {
        const msg = error.response?.data?.error || error.message;
        return { success: false, error: msg };
    } finally {
        isEditingUser.value = false;
    }
  };

  return {
    users,
    devices,
    isAddingUser,
    isEditingUser,
    
    initUserManagement,
    cleanupUserManagement,
    
    createUser,
    updateUserStatus,
    removeUser,
    updateUserProfile
  };
}

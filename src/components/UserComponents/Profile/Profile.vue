<template>
  <div class="w-full max-w-7xl mx-auto p-8 mt-5 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg font-poppins">
    <div v-if="authIsLoading" class="text-center py-10">
      <div class="flex justify-center items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
      <p class="mt-4 text-gray-500 dark:text-gray-400">Loading profile information...</p>
    </div>

    <div v-else-if="!userProfileData">
      <p class="text-center py-10 text-gray-500 dark:text-gray-400">No profile data available.</p>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profile Information</h1>
      </div>

      <div class="flex items-start flex-col sm:flex-row sm:items-center gap-6 mb-8">
        <div class="relative group">
          <img 
            :src="photoURL || defaultProfilePicUrl" 
            alt="Profile Picture"
            class="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
          >
          <div 
            class="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            @click="triggerFileInput"
          >
            <span class="text-white text-sm">Edit</span>
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            @change="handlePhotoUpload" 
            class="hidden" 
            accept="image/*"
          >
        </div>

        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ userProfileData.fullName || 'User' }}</h2>
          <p class="text-gray-600 dark:text-gray-400">{{ userProfileData.email || 'No email' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
          <input 
            type="text" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" 
            v-model="firstName"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
          <input 
            type="text" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" 
            v-model="lastName"
          >
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
          <input 
            type="email" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
            :value="userProfileData.email" 
            readonly
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <input 
            type="tel" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" 
            v-model="phoneNumber"
          >
        </div>
      </div>

      <div class="mb-8">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
        <input 
          type="text" 
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" 
          v-model="address"
        >
      </div>

      <!-- Subscription Status and Upgrade Section -->
      <div class="mb-8 border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Subscription Status</h2>
        <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <p class="text-lg text-gray-800 dark:text-gray-200">
            Tier: <span :class="{'text-green-600': isPremium, 'text-blue-500': !isPremium}" class="font-bold">{{ userProfileData.subscriptionTier || 'Free' }}</span>
          </p>
          <button v-if="!isPremium" @click="requestPremiumUpgrade" 
            :disabled="isUpgrading"
            class="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isUpgrading">Requesting...</span>
            <span v-else>Request Premium Upgrade</span>
          </button>
          <span v-else class="text-green-600 dark:text-green-400 font-semibold">✅ Premium Member</span>
        </div>
      </div>


      <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 class="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Change Password</h2>
        
        <div class="mb-5 relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
          <input 
            :type="showCurrentPassword ? 'text' : 'password'" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 pr-10"
            v-model="currentPassword"
          >
          <button type="button" @click="showCurrentPassword = !showCurrentPassword"
            class="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none">
            <svg v-if="!showCurrentPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.38-3.882m3.184-2.3A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.338 5.223M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
            </svg>
          </button>
        </div>

        <div class="mb-5 relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
          <input 
            :type="showNewPassword ? 'text' : 'password'" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 pr-10" 
            v-model="newPassword"
          >
          <button type="button" @click="showNewPassword = !showNewPassword"
            class="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none">
            <svg v-if="!showNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.38-3.882m3.184-2.3A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.338 5.223M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
            </svg>
          </button>
        </div>

        <div class="mb-6 relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
          <input 
            :type="showConfirmNewPassword ? 'text' : 'password'" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 pr-10"
            v-model="confirmNewPassword"
          >
          <button type="button" @click="showConfirmNewPassword = !showConfirmNewPassword"
            class="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none">
            <svg v-if="!showConfirmNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.38-3.882m3.184-2.3A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.338 5.223M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
            </svg>
          </button>
        </div>
        
        <div v-if="passwordError" class="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6" role="alert">
          <p>{{ passwordError }}</p>
        </div>
      </div>

      <div class="flex justify-end space-x-4 border-t border-gray-200 dark:border-gray-700 pt-8">
        <button 
          @click="cancelEdit"
          class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
        >
          Cancel
        </button>
        <button 
          @click="saveChanges"
          :disabled="isSaving"
          class="px-5 py-2.5 bg-[#059669] text-white rounded-md hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSaving">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore'; // Import setDoc for updating subscription
import { auth, db } from '@/firebase.js'; // Ensure correct path for Firebase initialization
import { useDarkMode } from '@/composables/useDarkMode.js';
import { useAuth } from '@/composables/useAuth.js'; // Import useAuth composable
import { useToast } from '@/composables/useToast.js'; // Import useToast composable

// --- Composables ---
const { isDarkMode } = useDarkMode();
const { user, userProfile: authUserProfile, isLoading: authIsLoading, isPremium } = useAuth('default-app-id');
const { showToast } = useToast();
const router = useRouter();

// --- Reactive State ---
const fileInput = ref(null);
const isLoading = ref(true); // Local loading state, managed by onSnapshot
const isSaving = ref(false);
const isUpgrading = ref(false); // New state for upgrade button

const userProfileData = ref({}); // Use this for local component state
const firstName = ref('');
const lastName = ref('');
const phoneNumber = ref('');
const address = ref('');
const photoFile = ref(null);
const photoURL = ref(''); // Reactive photoURL for display

const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const passwordError = ref('');

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmNewPassword = ref(false);

const defaultProfilePicUrl = ref('/src/Images/profile/pfp.png'); // Local fallback

let initialState = {}; // To store the initial state for comparison and cancellation

// --- Computed Properties ---
// FullName derived from firstName and lastName for display/payload
const fullName = computed(() => `${firstName.value} ${lastName.value}`.trim());


// --- Helper Functions ---
const fetchDefaultProfilePic = async () => {
  try {
    const storage = getStorage();
    const pathReference = storageRef(storage, 'gs://energreen-ai-powered-iot-based.firebasestorage.app/profile_pictures/Default/pfp.png');
    defaultProfilePicUrl.value = await getDownloadURL(pathReference);
  } catch (error) {
    console.warn("Could not fetch default profile pic from Storage, using local fallback.", error.code);
  }
};

const splitFullName = (fullNameStr) => {
  if (!fullNameStr) {
    return { first: '', last: '' };
  }
  const nameParts = fullNameStr.trim().split(/\s+/);
  const last = nameParts.length > 1 ? nameParts.pop() : '';
  const first = nameParts.join(' ');
  return { first, last };
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handlePhotoUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    photoFile.value = file;
    photoURL.value = URL.createObjectURL(file); // Display new picture immediately
  }
};

// --- Watchers ---
watch(authUserProfile, (newProfile) => {
    if (newProfile) {
        userProfileData.value = { ...newProfile }; // Deep copy
        const { first, last } = splitFullName(newProfile.fullName);
        firstName.value = first;
        lastName.value = last;
        phoneNumber.value = newProfile.phoneNumber || '';
        address.value = newProfile.address || '';
        photoURL.value = newProfile.photoURL || defaultProfilePicUrl.value;

        initialState = {
            fullName: newProfile.fullName,
            phoneNumber: newProfile.phoneNumber,
            address: newProfile.address,
            photoURL: newProfile.photoURL
        };
        isLoading.value = false;
        console.log("Profile data loaded successfully:", newProfile);
    } else {
        // Handle case where authUserProfile becomes null (e.g., user logs out)
        userProfileData.value = {};
        isLoading.value = authIsLoading.value; // Keep local loading in sync with auth loading
    }
});


// --- Methods ---
const saveChanges = async () => {
  isSaving.value = true;
  passwordError.value = '';
  const appId = 'default-app-id';
  const currentAuthUser = auth.currentUser;

  if (!currentAuthUser) {
    console.error("User not authenticated.");
    isSaving.value = false;
    showToast('User not authenticated.', 'error');
    return;
  }

  // --- 1. HANDLE PASSWORD UPDATE (Client Side Auth) ---
  if (currentPassword.value || newPassword.value || confirmNewPassword.value) {
    if (!currentPassword.value || !newPassword.value || !confirmNewPassword.value) {
      passwordError.value = "Please fill in all password fields to update your password.";
      isSaving.value = false;
      return;
    }

    if (newPassword.value !== confirmNewPassword.value) {
      passwordError.value = "New password and confirm password do not match.";
      isSaving.value = false;
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(currentAuthUser.email, currentPassword.value);
      await reauthenticateWithCredential(currentAuthUser, credential);
      await updatePassword(currentAuthUser, newPassword.value);
      showToast('Password updated successfully!', 'success');
      currentPassword.value = '';
      newPassword.value = '';
      confirmNewPassword.value = '';
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        passwordError.value = "The current password you entered is incorrect.";
      } else {
        passwordError.value = "Error updating password. Please try again.";
        console.error("Error updating password:", error);
      }
      isSaving.value = false;
      return;
    }
  }

  // --- 2. PREPARE DATA FOR API ---
  const payload = {
    appId: appId, // Required by backend
    fullName: fullName.value,
    phoneNumber: phoneNumber.value,
    address: address.value,
    electricityProvider: userProfileData.value.electricityProvider // Keep existing provider if not editable here
  };

  try {
    // --- 3. HANDLE PHOTO UPLOAD (Client Side Storage) ---
    if (photoFile.value) {
      const storage = getStorage();
      const sRef = storageRef(storage, `profile_pictures/${currentAuthUser.uid}/${photoFile.value.name}`);
      await uploadBytes(sRef, photoFile.value);
      const newPhotoURL = await getDownloadURL(sRef);
      payload.photoURL = newPhotoURL;
    }

    // --- 4. CALL SECURE API ---
    const token = await currentAuthUser.getIdToken();

    const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to update profile via server.");
    }

    showToast('Profile updated successfully!', 'success');
    // Local state will be updated by onSnapshot listener via authUserProfile watch
  } catch (error) {
    console.error("Error updating profile:", error);
    showToast(`Failed to update profile: ${error.message}`, 'error');
  } finally {
    isSaving.value = false;
  }
};

const cancelEdit = () => {
  const { first, last } = splitFullName(initialState.fullName);
  firstName.value = first;
  lastName.value = last;
  phoneNumber.value = initialState.phoneNumber;
  address.value = initialState.address;
  photoURL.value = initialState.photoURL || defaultProfilePicUrl.value;
  photoFile.value = null;
  currentPassword.value = '';
  newPassword.value = '';
  confirmNewPassword.value = '';
  passwordError.value = '';
  showCurrentPassword.value = false;
  showNewPassword.value = false;
  showConfirmNewPassword.value = false;
};

const requestPremiumUpgrade = async () => {
  isUpgrading.value = true;
  try {
    const currentAuthUser = auth.currentUser;
    if (!currentAuthUser) {
      showToast('User not authenticated.', 'error');
      isUpgrading.value = false;
      return;
    }
    
    // Mock API call to update subscription tier in Firestore
    const userProfileRef = doc(db, `artifacts/default-app-id/users/${currentAuthUser.uid}/userProfile/profile`);
    await setDoc(userProfileRef, {
      subscriptionTier: 'Premium',
      subscriptionStatus: 'Active'
    }, { merge: true });

    showToast('Premium upgrade requested! Please refresh the page to see changes.', 'success');
    // The onSnapshot listener will update userProfileData and isPremium reactively
  } catch (error) {
    console.error("Error requesting premium upgrade:", error);
    showToast(`Failed to request upgrade: ${error.message}`, 'error');
  } finally {
    isUpgrading.value = false;
  }
};

// --- Lifecycle Hooks ---
onMounted(async () => {
  // Fetch default profile pic first
  await fetchDefaultProfilePic();

  // Set up Firestore listener for user profile
  let unsubscribeProfile = () => {};
  if (user.value) { // Ensure user is available from useAuth
    const appId = 'default-app-id';
    const userProfileRef = doc(db, `artifacts/${appId}/users/${user.value.uid}/userProfile/profile`);
    
    unsubscribeProfile = onSnapshot(userProfileRef, (docSnap) => {
      isLoading.value = false; // Local loading done
      if (docSnap.exists()) {
        const data = docSnap.data();
        userProfileData.value = data;
        
        const { first, last } = splitFullName(data.fullName);
        firstName.value = first;
        lastName.value = last;
        phoneNumber.value = data.phoneNumber || '';
        address.value = data.address || '';
        photoURL.value = data.photoURL || defaultProfilePicUrl.value;

        initialState = {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          address: data.address,
          photoURL: data.photoURL
        };
        console.log("Profile data loaded successfully from onSnapshot:", data);
      } else {
        console.log("No profile data found for current user!");
        userProfileData.value = {
          fullName: 'User',
          email: user.value.email,
          photoURL: defaultProfilePicUrl.value
        };
        initialState = { ...userProfileData.value }; // Initialize initialState
      }
    }, (error) => {
      isLoading.value = false;
      console.error("Error fetching user profile with onSnapshot:", error);
    });
  } else {
    // If user is null from useAuth, still set local loading false
    isLoading.value = false;
    console.log("No authenticated user in onMounted for profile.");
  }

  onUnmounted(() => {
    unsubscribeProfile();
  });
});
</script>

<style scoped>
/* Custom focus styles for better accessibility */
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.2); /* Use a shade of green for consistency */
}
.dark input:focus {
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.5);
}
</style>
<template>
  <div class="w-full max-w-7xl mx-auto p-8 mt-5 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg font-poppins">
    <div v-if="isLoading" class="text-center py-10">
      <div class="flex justify-center items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
      <p class="mt-4 text-gray-500 dark:text-gray-400">Loading profile information...</p>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Profile Information</h1>
      </div>

      <div class="flex items-start flex-col sm:flex-row sm:items-center gap-6 mb-8">
        <div class="relative group">
          <img 
            :src="adminProfile.photoURL || '/src/Images/profile/pfp.png'" 
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
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ adminProfile.fullName || 'Admin' }}</h2>
          <p class="text-gray-600 dark:text-gray-400">{{ adminProfile.email || 'No email' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
          <input 
            v-model="firstName" 
            type="text" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
          <input 
            v-model="lastName" 
            type="text" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          >
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
          <input 
            :value="adminProfile.email" 
            readonly 
            type="email" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <input 
            v-model="phoneNumber" 
            type="tel" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          >
        </div>
      </div>

      <div class="mb-8">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
        <input 
          v-model="address" 
          type="text" 
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        >
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 class="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Change Password</h2>

        <div class="mb-5 relative">
          <label class="block text-sm dark:text-gray-300 font-medium mb-2">Current Password</label>
          <input 
            v-model="currentPassword" 
            :type="showCurrentPassword ? 'text' : 'password'" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 pr-10"
          >
          <button type="button" @click="showCurrentPassword = !showCurrentPassword"
            class="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none">
            <svg v-if="!showCurrentPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 
                  8.268 2.943 9.542 7-1.274 4.057-5.064 
                  7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 
                  0-8.268-2.943-9.542-7a9.956 9.956 
                  0 012.38-3.882m3.184-2.3A9.956 9.956 
                  0 0112 5c4.478 0 8.268 2.943 
                  9.542 7a9.956 9.956 0 01-4.338 
                  5.223M15 12a3 3 0 11-6 0 3 3 
                  0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
            </svg>
          </button>
        </div>

        <div class="mb-5 relative">
          <label class="block text-sm dark:text-gray-300 font-medium mb-2">New Password</label>
          <input 
            v-model="newPassword" 
            :type="showNewPassword ? 'text' : 'password'" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 pr-10"
          >
          <button type="button" @click="showNewPassword = !showNewPassword"
            class="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none">
            <svg v-if="!showNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 
                  8.268 2.943 9.542 7-1.274 4.057-5.064 
                  7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 
                  0-8.268-2.943-9.542-7a9.956 9.956 
                  0 012.38-3.882m3.184-2.3A9.956 9.956 
                  0 0112 5c4.478 0 8.268 2.943 
                  9.542 7a9.956 9.956 0 01-4.338 
                  5.223M15 12a3 3 0 11-6 0 3 3 
                  0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
            </svg>
          </button>
        </div>

        <div class="mb-6 relative">
          <label class="block text-sm dark:text-gray-300 font-medium mb-2">Confirm New Password</label>
          <input 
            v-model="confirmNewPassword" 
            :type="showConfirmNewPassword ? 'text' : 'password'" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#059669] focus:border-[#059669] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 pr-10"
          >
          <button type="button" @click="showConfirmNewPassword = !showConfirmNewPassword"
            class="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none">
            <svg v-if="!showConfirmNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 
                  8.268 2.943 9.542 7-1.274 4.057-5.064 
                  7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 
                  0-8.268-2.943-9.542-7a9.956 9.956 
                  0 012.38-3.882m3.184-2.3A9.956 9.956 
                  0 0112 5c4.478 0 8.268 2.943 
                  9.542 7a9.956 9.956 0 01-4.338 
                  5.223M15 12a3 3 0 11-6 0 3 3 
                  0 016 0z" />
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
          class="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <span v-if="isSaving">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from "../../../firebase.js";

export default {
  name: "AdminProfile",
  data() {
    return {
      isLoading: true,
      isSaving: false,
      adminProfile: {},
      firstName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      photoFile: null,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      passwordError: "",
      initialState: {},
      // Added Password visibility states
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmNewPassword: false
    };
  },
  methods: {
    splitFullName(fullName) {
      if (!fullName) return { firstName: "", lastName: "" };
      const parts = fullName.trim().split(/\s+/);
      return { firstName: parts.slice(0, -1).join(" "), lastName: parts.slice(-1)[0] || "" };
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handlePhotoUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.photoFile = file;
        this.adminProfile.photoURL = URL.createObjectURL(file);
      }
    },
    async saveChanges() {
      this.isSaving = true;
      this.passwordError = "";
      const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
      const adminId = auth.currentUser?.uid;
      if (!adminId) return;

      // 🔐 Handle password update
      if (this.currentPassword || this.newPassword || this.confirmNewPassword) {
        if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
          this.passwordError = "Fill in all password fields.";
          this.isSaving = false;
          return;
        }
        if (this.newPassword !== this.confirmNewPassword) {
          this.passwordError = "Passwords do not match.";
          this.isSaving = false;
          return;
        }
        try {
          const cred = EmailAuthProvider.credential(auth.currentUser.email, this.currentPassword);
          await reauthenticateWithCredential(auth.currentUser, cred);
          await updatePassword(auth.currentUser, this.newPassword);
          this.currentPassword = this.newPassword = this.confirmNewPassword = "";
        } catch (err) {
          this.passwordError = "Error updating password.";
          this.isSaving = false;
          return;
        }
      }

      const updatedFullName = `${this.firstName} ${this.lastName}`.trim();
      const updatedData = {
        fullName: updatedFullName,
        phoneNumber: this.phoneNumber,
        address: this.address
      };

      try {
        if (this.photoFile) {
          const storage = getStorage();
          const storageRef = ref(storage, `profile_pictures/${adminId}/${this.photoFile.name}`);
          await uploadBytes(storageRef, this.photoFile);
          updatedData.photoURL = await getDownloadURL(storageRef);
        }

        const adminRef = doc(db, `artifacts/${appId}/users/${adminId}/userProfile/profile`);
        await updateDoc(adminRef, updatedData);

        this.adminProfile = { ...this.adminProfile, ...updatedData };
        this.initialState = { ...updatedData, photoURL: updatedData.photoURL || this.adminProfile.photoURL };
      } catch (err) {
        console.error("Error saving admin profile:", err);
      } finally {
        this.isSaving = false;
      }
    },
    cancelEdit() {
      const { firstName, lastName } = this.splitFullName(this.initialState.fullName);
      this.firstName = firstName;
      this.lastName = lastName;
      this.phoneNumber = this.initialState.phoneNumber;
      this.address = this.initialState.address;
      this.adminProfile.photoURL = this.initialState.photoURL;
      this.currentPassword = this.newPassword = this.confirmNewPassword = "";
      this.passwordError = "";
      // 👁️ Reset password visibility states
      this.showCurrentPassword = false;
      this.showNewPassword = false;
      this.showConfirmNewPassword = false;
    }
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
        const adminRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile/profile`);

        onSnapshot(adminRef, (snap) => {
          this.isLoading = false;
          if (snap.exists()) {
            const data = snap.data();
            this.adminProfile = data;
            const { firstName, lastName } = this.splitFullName(data.fullName);
            this.firstName = firstName;
            this.lastName = lastName;
            this.phoneNumber = data.phoneNumber || "";
            this.address = data.address || "";
            this.adminProfile.photoURL = data.photoURL || "/src/Images/profile/pfp.png";
            this.initialState = { ...data, photoURL: this.adminProfile.photoURL };
          } else {
            this.adminProfile = { fullName: "Admin", email: user.email, photoURL: "/src/Images/profile/pfp.png" };
          }
        });
      } else {
        this.isLoading = false;
      }
    });
  }
};
</script>

<style scoped>
/* Custom focus styles for better accessibility, taken from the first file */
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.2); /* Use a shade of green for consistency */
}
.dark input:focus {
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.5);
}
</style>
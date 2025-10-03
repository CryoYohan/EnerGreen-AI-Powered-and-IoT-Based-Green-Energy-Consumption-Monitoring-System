<template>
  <div class="w-full max-w-7xl mx-auto p-8 mt-5 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg font-poppins">
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-10">
      <div class="flex justify-center items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
      <p class="mt-4 text-gray-500 dark:text-gray-400">Loading profile information...</p>
    </div>

    <!-- Profile form -->
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

      <!-- Name fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
          <input v-model="firstName" type="text" class="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
          <input v-model="lastName" type="text" class="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
        </div>
      </div>

      <!-- Email + Phone -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
          <input :value="adminProfile.email" readonly type="email" class="w-full px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <input v-model="phoneNumber" type="tel" class="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
        </div>
      </div>

      <!-- Address -->
      <div class="mb-8">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
        <input v-model="address" type="text" class="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
      </div>

      <!-- Password section -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 class="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Change Password</h2>

        <div class="mb-5">
          <label class="block text-sm font-medium">Current Password</label>
          <input v-model="currentPassword" type="password" class="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700">
        </div>

        <div class="mb-5">
          <label class="block text-sm font-medium">New Password</label>
          <input v-model="newPassword" type="password" class="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700">
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium">Confirm New Password</label>
          <input v-model="confirmNewPassword" type="password" class="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700">
        </div>

        <div v-if="passwordError" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{{ passwordError }}</p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex justify-end space-x-4 border-t border-gray-200 dark:border-gray-700 pt-8">
        <button @click="cancelEdit" class="px-5 py-2.5 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="saveChanges" :disabled="isSaving" class="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
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
      initialState: {}
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

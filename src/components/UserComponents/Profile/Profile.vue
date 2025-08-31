<template>
  <div class="w-full max-w-7xl mx-auto p-8 mt-5 bg-white rounded-lg shadow-md font-poppins">
    <div v-if="isLoading" class="text-center py-10">
      <div class="flex justify-center items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
      <p class="mt-4 text-gray-500">Loading profile information...</p>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">Profile Information</h1>
      </div>

      <div class="flex items-start flex-col sm:flex-row sm:items-center gap-6 mb-8">
        <!-- Profile Picture -->
        <div class="relative group">
          <img 
            :src="userProfile.photoURL || '/src/Images/profile/pfp.png'" 
            alt="Profile Picture"
            class="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
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

        <!-- Profile Header -->
        <div>
          <h2 class="text-xl font-semibold">{{ userProfile.fullName || 'User' }}</h2>
          <p class="text-gray-600">{{ userProfile.email || 'No email' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input 
            type="text" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#059669] focus:border-[#059669]" 
            v-model="firstName"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input 
            type="text" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#059669] focus:border-[#059669]" 
            v-model="lastName"
          >
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input 
            type="email" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#059669] focus:border-[#059669]" 
            :value="userProfile.email" 
            readonly
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input 
            type="tel" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#059669] focus:border-[#059669]" 
            v-model="phoneNumber"
          >
        </div>
      </div>

      <div class="mb-8">
        <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <input 
          type="text" 
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#059669] focus:border-[#059669]" 
          v-model="address"
        >
      </div>

      <div class="border-t pt-8">
        <h2 class="text-xl font-semibold mb-6">Change Password</h2>
        
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input 
            type="password" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#059669] focus:border-[#059669]"
          >
        </div>

        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input 
            type="password" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#059669] focus:border-[#059669]"
          >
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input 
            type="password" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#059669] focus:border-[#059669]"
          >
        </div>
      </div>

      <div class="flex justify-end space-x-4 border-t pt-8">
        <button 
          @click="cancelEdit"
          class="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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

<script>
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from '../../../firebase.js';

export default {
  name: 'ProfileInformation',
  data() {
    return {
      isLoading: true,
      isSaving: false,
      userProfile: {},
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      photoFile: null,
      initialState: {} // To store the initial state for comparison and cancellation
    };
  },
  methods: {
    // Splits the full name into first and last name based on spaces
    splitFullName(fullName) {
      if (!fullName) {
        return { firstName: '', lastName: '' };
      }
      const nameParts = fullName.trim().split(/\s+/);
      const lastName = nameParts.length > 1 ? nameParts.pop() : '';
      const firstName = nameParts.join(' ');
      return { firstName, lastName };
    },
    // Triggers the hidden file input
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    // Handles the file selected by the user
    handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.photoFile = file;
        // Create a temporary URL to display the new picture
        const tempURL = URL.createObjectURL(file);
        this.userProfile.photoURL = tempURL;
      }
    },
    // Saves the changes to Firestore and Firebase Storage
    async saveChanges() {
      this.isSaving = true;
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error("User not authenticated.");
        this.isSaving = false;
        return;
      }

      // Merge first and last name back into a single fullName for the database
      const updatedFullName = `${this.firstName} ${this.lastName}`.trim();
      
      const updatedData = {
        fullName: updatedFullName,
        phoneNumber: this.phoneNumber,
        address: this.address
      };

      try {
        // Upload photo to Firebase Storage if a new one was selected
        if (this.photoFile) {
          // NOTE: If you are seeing a CORS error (Access-Control-Allow-Origin), you need to configure your Firebase Storage bucket.
          // This is a one-time setup on your Firebase project, not a code issue.
          // To fix this, create a cors.json file:
          // [
          //   {
          //     "origin": ["*"],
          //     "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
          //     "responseHeader": ["Content-Type"],
          //     "maxAgeSeconds": 3600
          //   }
          // ]
          // And run the following command in your terminal, replacing your-bucket-name:
          // gsutil cors set cors.json gs://your-bucket-name
          const storage = getStorage();
          const storageRef = ref(storage, `profile_pictures/${userId}/${this.photoFile.name}`);
          await uploadBytes(storageRef, this.photoFile);
          const photoURL = await getDownloadURL(storageRef);
          updatedData.photoURL = photoURL;
        }

        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`);
        await updateDoc(userProfileRef, updatedData);
        console.log("Profile updated successfully!");

        // Update the local state to reflect the saved changes
        this.userProfile.fullName = updatedFullName;
        this.userProfile.phoneNumber = this.phoneNumber;
        this.userProfile.address = this.address;
        
        // Reset initial state for future comparisons
        this.initialState = {
          fullName: updatedFullName,
          phoneNumber: this.phoneNumber,
          address: this.address,
          photoURL: updatedData.photoURL || this.userProfile.photoURL // Ensure photoURL is updated in initial state
        };

      } catch (error) {
        console.error("Error updating profile:", error);
      } finally {
        this.isSaving = false;
      }
    },
    // Resets the form to the initial state fetched from the database
    cancelEdit() {
      const { firstName, lastName } = this.splitFullName(this.initialState.fullName);
      this.firstName = firstName;
      this.lastName = lastName;
      this.phoneNumber = this.initialState.phoneNumber;
      this.address = this.initialState.address;
      this.userProfile.photoURL = this.initialState.photoURL; // Reset temp photo URL
      this.photoFile = null; // Clear the selected file
    }
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile/profile`);
        
        onSnapshot(userProfileRef, (docSnap) => {
          this.isLoading = false;
          if (docSnap.exists()) {
            const data = docSnap.data();
            this.userProfile = data;
            
            const { firstName, lastName } = this.splitFullName(data.fullName);
            this.firstName = firstName;
            this.lastName = lastName;
            this.phoneNumber = data.phoneNumber || '';
            this.address = data.address || '';
            this.userProfile.photoURL = data.photoURL || '/src/Images/profile/pfp.png';

            // Store the initial state for cancellation
            this.initialState = {
              fullName: data.fullName,
              phoneNumber: data.phoneNumber,
              address: data.address,
              photoURL: data.photoURL || '/src/Images/profile/pfp.png'
            };
            
            console.log("Profile data loaded successfully:", data);
          } else {
            console.log("No profile data found!");
            // Set default values if no profile exists
            this.userProfile = {
              fullName: 'User',
              email: user.email,
              photoURL: '/src/Images/profile/pfp.png'
            };
          }
        }, (error) => {
          this.isLoading = false;
          console.error("Error fetching user profile:", error);
        });
      } else {
        this.isLoading = false;
        // Handle no user signed in state
      }
    });
  }
};
</script>

<style scoped>
/* Custom focus styles for better accessibility */
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.2); /* Use a shade of green for consistency */
}
</style>

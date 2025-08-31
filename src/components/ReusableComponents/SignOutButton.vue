<template>
  <button
    @click="signOut"
    class="flex items-center w-full gap-2 px-3 py-2 text-left text-sm font-poppins text-[#DB2626] hover:bg-gray-100 rounded transition-colors duration-200"
  >
    <img src="/src/Images/icons/redlog.svg" class="w-4 h-4" alt="Sign Out Icon">
    Sign Out
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { getAuth, signOut as firebaseSignOut } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();

/**
 * Handles the user sign-out process.
 * Calls Firebase's signOut method and redirects the user.
 */
const signOut = async () => {
  try {
    // Call the Firebase signOut function to log the user out
    await firebaseSignOut(auth);
    console.log('User signed out successfully.');
    
    // Redirect the user to the Landing page after successful sign out
    router.push({ name: 'Landing' });
    
  } catch (error) {
    // Log any errors that occur during the sign-out process
    console.error('Error signing out:', error);
  }
};
</script>

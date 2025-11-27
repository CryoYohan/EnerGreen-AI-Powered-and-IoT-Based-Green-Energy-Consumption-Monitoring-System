<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 font-poppins text-center px-4">
    <div class="max-w-md w-full">
      <!-- Icon -->
      <div class="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
        <svg class="w-12 h-12 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4.293-13.293a1 1 0 00-1.414 0L10 8.586 4.293 2.879a1 1 0 00-1.414 1.414L8.586 10l-5.707 5.707a1 1 0 001.414 1.414L10 11.414l5.707 5.707a1 1 0 001.414-1.414L11.414 10l5.707-5.707a1 1 0 00-1.414-1.414z" />
        </svg>
      </div>

      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">401 Unauthorized</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        Stop! You don't have permission to access this area.
      </p>

      <div class="space-y-3">
        <button 
          @click="goBack" 
          class="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          Go Back
        </button>
        
        <button 
          @click="goToHome" 
          class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { auth, db } from '@/firebase.js';
import { doc, getDoc } from 'firebase/firestore';

const router = useRouter();

const goBack = () => router.go(-1);

const goToHome = async () => {
  const user = auth.currentUser;
  if (!user) {
    router.push('/'); // Landing page
    return;
  }

  // Check role to send them to the correct dashboard
  try {
    // Note: Ensure 'default-app-id' logic matches your firebase setup
    const docRef = doc(db, `artifacts/default-app-id/users/${user.uid}/userProfile/profile`);
    const snap = await getDoc(docRef);
    
    if (snap.exists() && snap.data().role === 'admin') {
      router.push('/adminhome');
    } else {
      router.push('/home');
    }
  } catch (e) {
    console.error(e);
    router.push('/');
  }
};
</script>

<style scoped>
.animate-bounce-slow {
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(-5%); }
  50% { transform: translateY(5%); }
}
</style>
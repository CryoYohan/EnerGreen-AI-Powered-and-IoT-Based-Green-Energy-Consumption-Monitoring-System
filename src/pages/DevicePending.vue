<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
    <UserHeader />
    
    <div class="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
        <svg class="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 1.657-1.343 3-3 3s-3-1.343-3-3V7m9 4c0 1.657-1.343 3-3 3s-3-1.343-3-3m-4 0h12m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Device Not Linked</h3>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          EnerGreen Device ID is not yet configured for your account. Please contact your administrator to link your smart meter and start tracking your energy.
        </p>
        <button @click="$router.push('/profile')" 
          class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Go to Profile
        </button>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
</script>

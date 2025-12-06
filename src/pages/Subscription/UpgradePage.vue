<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center px-4 font-poppins">
    <div class="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div class="mb-6">
        <svg class="mx-auto h-20 w-20 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" clip-path="url(#clip0)"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
           <defs>
            <clipPath id="clip0">
                <path d="M0 0h24v24H0z"/>
            </clipPath>
           </defs>
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        Upgrade to Premium
      </h1>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        This feature is exclusively available for our Premium users. Unlock advanced appliance management, AI-powered insights, and more by upgrading your plan.
      </p>
      <div class="flex flex-col space-y-4">
         <router-link
          to="/profile"
          class="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105"
        >
          Go to Profile to Upgrade
        </router-link>
        <router-link
          to="/home"
          class="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
        >
          Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// This component is for display purposes. No complex logic is needed here.
</script>

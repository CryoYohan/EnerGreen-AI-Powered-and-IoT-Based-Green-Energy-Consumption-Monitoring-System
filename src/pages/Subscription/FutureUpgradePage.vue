<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center px-4 font-poppins">
    <div class="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div class="mb-6">
        <svg class="mx-auto h-20 w-20 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        Exciting Premium Features Coming Soon!
      </h1>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        We're working hard to bring you even more powerful tools and exclusive benefits. Our premium upgrade options, including advanced analytics and personalized AI insights, are currently under development.
      </p>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Stay tuned for official announcements and get ready to elevate your EnerGreen experience!
      </p>
      <router-link
        to="/profile"
        class="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105"
      >
        Back to Profile
      </router-link>
    </div>
  </div>
</template>

<script setup>
// No script logic needed for this simple display page
</script>

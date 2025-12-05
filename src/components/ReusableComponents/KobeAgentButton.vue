<template>
  <!-- 
    Kobe Trigger Button 
    - Simpler interaction: Click to start the onboarding tour.
  -->
  <button 
    @click="$emit('start-tour')"
    class="fixed bottom-6 right-28 z-50 group w-14 h-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-white dark:border-gray-800"
    title="Start Onboarding Tour">
    
    <!-- Icon: Academic Cap (Learning/Guide) -->
    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
    </svg>

    <!-- Pulse Effect -->
    <span class="absolute top-0 right-0 flex h-3 w-3">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
    </span>
  </button>
</template>

<script setup>
// No logic needed, just a dumb trigger component
</script>
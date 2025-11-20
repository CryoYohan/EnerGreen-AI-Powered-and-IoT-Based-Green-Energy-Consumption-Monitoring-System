<template>
  <div class=" font-poppins m-5 lg:m-10 bg-white dark:bg-gray-900">
    <!-- Header -->
    <div class="flex justify-between items-center rounded-xl p-6 mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Firmware Management</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage device software updates</p>
      </div>
      <button class="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
        Deploy Update
      </button>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Devices -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-3 h-8 bg-emerald-500 rounded-full"></div>
          <p class="text-base text-gray-600 dark:text-gray-400">Total Devices</p>
        </div>
        <p class="text-4xl font-bold text-gray-900 dark:text-gray-100">1,140</p>
        <p class="text-sm text-emerald-600 dark:text-emerald-400 mt-2">All systems operational</p>
      </div>

      <!-- Pending Updates -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-3 h-8 bg-blue-500 rounded-full"></div>
          <p class="text-base text-gray-600 dark:text-gray-400">Pending Updates</p>
        </div>
        <p class="text-4xl font-bold text-gray-900 dark:text-gray-100">125</p>
        <p class="text-sm text-blue-600 dark:text-blue-400 mt-2">Ready for deployment</p>
      </div>

      <!-- Failed Updates -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-3 h-8 bg-rose-500 rounded-full"></div>
          <p class="text-base text-gray-600 dark:text-gray-400">Failed Updates</p>
        </div>
        <p class="text-4xl font-bold text-gray-900 dark:text-gray-100">5</p>
        <p class="text-sm text-rose-600 dark:text-rose-400 mt-2">Requires attention</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // Component logic can be added here if needed
}
</script>
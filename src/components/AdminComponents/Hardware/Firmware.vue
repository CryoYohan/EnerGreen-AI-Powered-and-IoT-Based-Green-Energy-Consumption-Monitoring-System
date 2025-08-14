<template>
  <div class="p-6 font-poppins m-5 lg:m-10 bg-white">
    <!-- Header Section -->
    <div class=" flex justify-between items-center rounded-xl  p-6 mb-8">
      <h1 class="text-xl font-semibold text-gray-900">Firmware Management</h1>
      <button class="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">

        Deploy Update
      </button>
    </div>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Devices -->
      <div class="bg-green-100 flex flex-col items-center justify-center rounded-xl shadow p-10">
        <p class="text-4xl font-bold text-gray-900">1,140</p>
        <p class="text-base text-gray-500 mt-1">Total Devices</p>
      </div>

      <!-- Pending Updates -->
      <div class="bg-blue-100 flex flex-col items-center justify-center rounded-xl shadow p-10">
        <p class="text-4xl font-bold text-gray-900">125</p>
        <p class="text-base text-gray-500 mt-1">Pending Updates</p>
      </div>

      <!-- Failed Updates -->
      <div class="bg-red-100 flex flex-col items-center justify-center rounded-xl shadow p-10">
        <p class="text-4xl font-bold text-gray-900">5</p>
        <p class="text-base text-gray-500 mt-1">Failed Updates</p>
      </div>
    </div>
    
  </div>
</template>

<script>
export default {
  // Component logic can be added here if needed
}
</script>
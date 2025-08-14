<template>
  <div class="grid m-4 h-full sm:m-5 lg:m-10 grid-cols-1 gap-6 font-poppins">

    <!-- Quick Filters Card with Usage Stats inside -->
    <div class="bg-white lg:h-[86.7%] rounded-lg shadow p-6 space-y-6">
      <!-- Filters Section -->
      <div>
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Filters</h3>
        <div class="space-y-4">
          <!-- Households Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Households</label>
            <select
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>All Households</option>
              <option>Household 1</option>
              <option>Household 2</option>
            </select>
          </div>

          <!-- Device Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
            <select
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>All Devices</option>
              <option>Lights</option>
              <option>Appliances</option>
              <option>HVAC</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Usage Stats Section -->
      <div class="bg-gray-50 rounded-md border p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-md font-semibold text-gray-800">Usage Stats</h3>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Peak Usage</span>
            <span class="font-medium">Sunday</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-600">Low Usage</span>
            <span class="font-medium">Tuesday</span>
          </div>

          <div class="flex justify-between pt-3 border-t border-gray-200">
            <span class="text-gray-600 font-medium">Total</span>
            <span class="text-blue-600 font-bold">1,890 kWh</span>
          </div>
        </div>

        <div class="mt-4  text-right">
          <button
            class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Export
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// no logic
</script>

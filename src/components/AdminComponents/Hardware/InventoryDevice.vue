<template>
  <div class="grid m-4 sm:m-5 lg:m-10 grid-cols-1 md:grid-cols-2 gap-6 font-poppins">
    <!-- Inventory Overview -->
    <div class="p-6 bg-white rounded-xl shadow">
      <div class="flex flex-row gap-2 items-center mb-4">
        <img src="/src/Images/icons/inventory.svg" alt="">
        <h2 class="text-lg font-semibold text-gray-800 mb-1">Inventory Overview</h2>
      </div>

      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between p-3 rounded-lg bg-green-50">
          <span class="text-gray-800 font-medium">Smart Plugs</span>
          <span class="font-semibold text-gray-700">1,180</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg">
          <span class="text-gray-800 font-medium">Solar Panels</span>
          <span class="font-semibold text-gray-700">45</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg bg-green-50">
          <span class="text-gray-800 font-medium">Smart Meters</span>
          <span class="font-semibold text-gray-700">22</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg">
          <span class="text-gray-800 font-medium">Sensors</span>
          <span class="font-semibold text-gray-700">12</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg bg-green-50">
          <span class="text-gray-800 font-medium">Batteries</span>
          <span class="font-semibold text-gray-700">10</span>
        </div>
      </div>
    </div>

    <!-- Device Registration -->
    <div class="p-6 bg-white rounded-xl shadow">
      <div class="flex flex-row items-center gap-2 mb-4">
        <img src="/src/Images/icons/plusdevice.svg" alt="">
        <h2 class="text-lg font-semibold text-gray-800 mb-1">Device Registration</h2>
      </div> 
      <div class="space-y-3 text-sm">
        <input
          type="text"
          placeholder="Device ID (e.g., SM-001)"
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option disabled selected>Select Device Type</option>
          <option>Smart Plug</option>
          <option>Solar Panel</option>
          <option>Smart Meter</option>
          <option>Sensor</option>
          <option>Battery</option>
        </select>
        <input
          type="text"
          placeholder="Location"
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option disabled selected>Initial Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Maintenance</option>
        </select>
      </div>
    </div>
  </div>
</template>

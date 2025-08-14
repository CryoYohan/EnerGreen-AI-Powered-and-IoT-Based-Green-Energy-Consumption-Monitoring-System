<template>
  <div
    v-if="device"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="$emit('close')"
  >
    <div
      class="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto font-poppins"
    >
      <button
        @click="$emit('close')"
        class="absolute text-2xl text-gray-500 top-4 right-4 hover:text-gray-700"
      >
        &times;
      </button>

      <h2 class="mb-4 text-xl font-bold">Appliance Configuration</h2>

      <!-- Basic Info -->
      <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700">Appliance Type</label>
          <p class="px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md">
            {{ device.name }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Location</label>
          <p class="px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md">
            {{ device.location }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Device Model</label>
          <p class="px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md">
            {{ device.model || 'No model specified' }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Device Status</label>
          <p class="px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md">
            {{ device.status }}
          </p>
        </div>
      </div>

      <!-- Energy Usage -->
      <h3 class="mb-2 text-lg font-semibold text-gray-800">Energy Usage Details</h3>
      <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700">Power Rating (Watts)</label>
          <p class="px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md">{{ device.usage}}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Usage Duration (in hours/per day)</label>
          <p class="px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md">24</p>
        </div>
      </div>

      <!-- Estimated Energy -->
      <h3 class="mb-2 text-lg font-semibold text-gray-800">Estimated Energy Consumed</h3>
      <div class="grid grid-cols-1 gap-4 p-4 text-center rounded-lg bg-green-50 sm:grid-cols-3">
        <div>
          <p class="text-sm text-gray-600">Daily Average</p>
          <p class="text-xl font-bold text-green-700">24 kWh</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Monthly Average</p>
          <p class="text-xl font-bold text-green-700">650 kWh</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Annual Projection</p>
          <p class="text-xl font-bold text-green-700">7,924 kWh</p>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    device: Object // Receive device data from parent
  },
  emits: ['close'] // Explicitly declare emitted events
}
</script>

<style scoped>
/* Modal-specific styles */
</style>
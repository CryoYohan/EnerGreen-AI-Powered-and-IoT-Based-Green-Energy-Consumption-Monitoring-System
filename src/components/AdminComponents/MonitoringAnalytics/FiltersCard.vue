<template>
  <div class="grid m-4 h-full sm:m-5 lg:m-10 grid-cols-1 gap-6 font-poppins dark:bg-gray-900">

    <div class="bg-white dark:bg-gray-800 lg:h-[86.7%] rounded-lg shadow dark:shadow-gray-700 p-6 space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Filters</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Household</label>
            <select
              v-model="selectedHousehold"
              @change="emitSelection"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-gray-100">
              <option value="all">All Households (Global)</option>
              <option v-for="household in households" :key="household.deviceId" :value="household.deviceId">
                {{ household.ownerName }} ({{ household.deviceId }})
              </option>
            </select>
          </div>
           <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Type</label>
            <select class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-gray-100">
              <option>All Devices</option>
              <option>Smart Plugs</option>
              <option>Smart Meters</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-md font-semibold text-gray-800 dark:text-gray-100">Usage Stats</h3>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-300">View Mode</span>
            <span class="font-medium dark:text-gray-100">
              {{ selectedHousehold === 'all' ? 'Global Aggregate' : 'Individual' }}
            </span>
          </div>

          <div class="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
            <span class="text-gray-600 dark:text-gray-300 font-medium">Total Consumption</span>
            <span class="text-blue-600 dark:text-blue-400 font-bold">{{ totalKwh.toFixed(2) }} kWh</span>
          </div>
        </div>

        <div class="mt-4 flex flex-col gap-2">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Export Report As:</span>
          <div class="grid grid-cols-3 gap-2">
            <button @click="$emit('export', 'csv')" class="px-2 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
              CSV
            </button>
            <button @click="$emit('export', 'pdf')" class="px-2 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
              PDF
            </button>
            <button @click="$emit('export', 'word')" class="px-2 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
              Word
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  households: { type: Array, default: () => [] },
  totalKwh: { type: Number, default: 0 }
});

const emit = defineEmits(['update:household', 'export']);

const selectedHousehold = ref('all');

const emitSelection = () => {
  emit('update:household', selectedHousehold.value);
};
</script>
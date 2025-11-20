<template>
  <div class="grid m-4 sm:m-5 lg:m-10 grid-cols-1 md:grid-cols-2 gap-6 font-poppins dark:bg-gray-900">
    
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 flex flex-col items-center">
      <div class="w-full text-left">
        <h2 class="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">Inventory Overview</h2>
      </div>
      <div class="flex flex-col items-center md:flex-row">
        <div class="w-40 h-40 md:w-60 md:h-60">
          <DoughnutChart
            v-if="inventoryData && inventoryData.datasets"
            :chartData="inventoryData"
            :chartOptions="doughnutOptions"
          />
        </div>
        <div class="mt-4 md:ml-6 lg:ml-20 space-y-3 text-sm text-gray-700 dark:text-gray-300">
           <div v-for="(label, index) in inventoryData.labels" :key="index" class="flex items-center text-lg">
            <div class="w-3 h-3 mr-2 rounded-full" :style="{ backgroundColor: inventoryData.datasets[0].backgroundColor[index] }"></div>
             {{ label }}: {{ inventoryData.datasets[0].data[index] }}
          </div>
        </div>
      </div>
    </div>

    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">Device Status</h2>
      <p class="text-sm text-gray-500 dark:text-gray-300 mb-4">Live Fleet Status</p>
      
      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
          <span class="text-gray-800 dark:text-gray-100 font-medium">Active</span>
          <span class="font-semibold text-green-700 dark:text-green-400">{{ statusCounts.active }}</span>
        </div>
        
        <div class="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
          <span class="text-gray-800 dark:text-gray-100 font-medium">Offline/Inactive</span>
          <span class="font-semibold text-gray-700 dark:text-gray-300">{{ statusCounts.offline }}</span>
        </div>
        
        <div class="flex items-center justify-between p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
          <span class="text-gray-800 dark:text-gray-100 font-medium">Maintenance</span>
          <span class="font-semibold text-red-700 dark:text-red-400">{{ statusCounts.maintenance }}</span>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import DoughnutChart from '@/components/ReusableComponents/DoughnutChart.vue';
import { useDarkMode } from '@/composables/useDarkMode.js';
import { computed } from 'vue';

const props = defineProps({
  inventoryData: Object,
  statusCounts: Object,
  lastUpdate: String
});

const { isDarkMode } = useDarkMode();

const doughnutOptions = computed(() => {
  const textColor = isDarkMode.value ? '#F3F4F6' : '#1F2937';
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    color: textColor,
  };
});
</script>
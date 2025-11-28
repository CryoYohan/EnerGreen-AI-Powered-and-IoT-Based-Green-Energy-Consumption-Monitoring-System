<template>
  <div class="grid m-4 sm:m-5 lg:m-8 grid-cols-1 md:grid-cols-2 gap-6 font-poppins bg-[#F9FAFB] dark:bg-gray-900">
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 flex flex-col items-center">
      <div class="w-full text-left" >
        <h2 class="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">Firmware Distribution</h2>
      </div>
      <div class="flex flex-col items-center md:flex-row">
        <div class="w-40 h-40 md:w-60 md:h-60">
          <DoughnutChart
            v-if="chartData && chartData.datasets"
            :chartData="chartData"
            :chartOptions="doughnutOptions"
          />
        </div>
        <div class="mt-4 md:ml-6 lg:ml-20 space-y-3 text-sm text-gray-700 dark:text-gray-100">
          <div v-for="(label, index) in chartData.labels" :key="index" class="flex items-center text-xl">
            <div class="w-3 h-3 mr-2 rounded-full" :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"></div>
            {{ label }}
          </div>
          
          <p class="mt-4 text-lg">
            Last update: <span class="font-semibold">{{ lastUpdate }}</span>
          </p>
        </div>
      </div>
    </div>
     <div class="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div class="space-y-3">
          <button @click="$router.push('/hardware')" class="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left group">
            <div class="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full text-emerald-600 dark:text-emerald-300 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">Register Device</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Add unit to inventory</p>
            </div>
          </button>

          <button @click="$router.push('/usermanagement')" class="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left group">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">Add User</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Create customer profile</p>
            </div>
          </button>
          
          <button @click="$router.push('/monitoring')" class="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left group">
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">View Analytics</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Check system performance</p>
            </div>
          </button>
        </div>
      </div>
  </div>
</template>

<script setup>
import DoughnutChart from '@/components/ReusableComponents/DoughnutChart.vue';
import SystemHealth from '@/components/ReusableComponents/SystemHealth.vue';
import { useDarkMode } from '@/composables/useDarkMode.js';
import { computed } from 'vue';

const props = defineProps({
  firmwareData: Object,
  lastUpdate: String,
  heroes: Array
});

const { isDarkMode } = useDarkMode();

// Use props directly
const chartData = computed(() => props.firmwareData);

const doughnutOptions = computed(() => {
  const textColor = isDarkMode.value ? '#F3F4F6' : '#1F2937';
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (context) => `${context.label}: ${context.raw}%` },
      },
    },
    color: textColor,
  };
});
</script>
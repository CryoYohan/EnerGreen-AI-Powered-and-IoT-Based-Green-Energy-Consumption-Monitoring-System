<template>
  <div class="grid m-4 sm:m-5 lg:m-10 grid-cols-1 md:grid-cols-2 gap-6 font-poppins bg-[#F9FAFB] dark:bg-gray-900">
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

    <Rankings
      title="Top Eco-Heroes"
      subtitle="Monthly Rankings"
      :heroes="heroes"
    />
  </div>
</template>

<script setup>
import DoughnutChart from '@/components/ReusableComponents/DoughnutChart.vue';
import Rankings from '@/components/ReusableComponents/Rankings.vue';
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
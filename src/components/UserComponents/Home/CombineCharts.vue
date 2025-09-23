<template>
  <div class="flex-col flex w-[96%] self-center p-5 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300 my-8">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6">
      <div class="mb-4 sm:mb-0">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">{{ chartTitle }}</h2>
        <p class="text-sm md:text-base text-gray-500 dark:text-gray-400">Total kWh per {{ activePeriod }}</p>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
        <select 
          :value="activePeriod" 
          @change="$emit('update:activePeriod', $event.target.value)"
          class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        >
          <option v-for="period in periods" :key="period" :value="period">{{ period }}</option>
        </select>
        <select 
          v-model="chartType"
          class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        >
          <option value="bar">Bar Chart</option>
          <option value="combined">Combined Chart</option>
        </select>
      </div>
    </div>
    <div class="h-64 sm:h-80 md:h-96">
      <canvas ref="chartCanvasRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import Chart from 'chart.js/auto';
import { useDarkMode } from "@/composables/useDarkMode.js";

const props = defineProps({
  chartTitle: {
    type: String,
    default: "Electricity Usage"
  },
  activePeriod: {
    type: String,
    required: true
  },
  periods: {
    type: Array,
    required: true
  },
  dailyData: {
    type: Array,
    required: true
  },
  weeklyData: {
    type: Array,
    required: true
  },
  monthlyData: {
    type: Array,
    required: true
  },
  yearlyData: {
    type: Array,
    required: true
  },
  xAxisLabel: {
    type: String,
    default: "Time"
  },
  tooltipUnit: {
    type: String,
    default: "kWh"
  },
});

const emit = defineEmits(['update:activePeriod']);

const chartCanvasRef = ref(null);
let energyChart = null;

const chartType = ref('bar');
const { isDarkMode } = useDarkMode();

// A computed property that selects the correct data array based on the active period
const currentData = computed(() => {
  switch (props.activePeriod) {
    case 'Daily':
      return props.dailyData;
    case 'Weekly':
      return props.weeklyData;
    case 'Monthly':
      return props.monthlyData;
    case 'Yearly':
      return props.yearlyData;
    default:
      return [];
  }
});

const createChart = () => {
  if (!chartCanvasRef.value) {
    return;
  }

  if (energyChart) {
    energyChart.destroy();
  }

  const labels = currentData.value.map(item => item.label);
  const kwhValues = currentData.value.map(item => item.value);

  const baseColors = {
    grid: isDarkMode.value ? '#4A5568' : '#E2E8F0',
    ticks: isDarkMode.value ? '#CBD5E0' : '#4A5568',
    bar: 'rgba(76, 175, 80, 0.8)',
    line: isDarkMode.value ? '#E5E7EB' : '#1F2937',
    point: isDarkMode.value ? '#E5E7EB' : '#1F2937',
  };

  const datasets = [
    {
      type: 'bar',
      label: `Total ${props.tooltipUnit}`,
      data: kwhValues,
      backgroundColor: baseColors.bar,
      borderColor: 'transparent',
      borderWidth: 1,
    },
  ];

  if (chartType.value === 'combined') {
    datasets.push({
      type: 'line',
      label: 'Trend',
      data: kwhValues,
      borderColor: baseColors.line,
      backgroundColor: 'transparent',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: baseColors.point,
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDarkMode.value ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode.value ? '#F9FAFB' : '#1F2937',
        bodyColor: isDarkMode.value ? '#F9FAFB' : '#1F2937',
        borderColor: isDarkMode.value ? '#4A5568' : '#E2E8F0',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: props.xAxisLabel,
          color: baseColors.ticks,
        },
        ticks: { color: baseColors.ticks },
        grid: { color: baseColors.grid },
      },
      y: {
        title: {
          display: true,
          text: `Total ${props.tooltipUnit}`,
          color: baseColors.ticks,
        },
        beginAtZero: true,
        ticks: { color: baseColors.ticks },
        grid: { color: baseColors.grid },
      },
    },
  };

  energyChart = new Chart(chartCanvasRef.value, {
    type: chartType.value === 'combined' ? 'bar' : 'bar',
    data: { labels, datasets },
    options,
  });
};

onMounted(() => {
  createChart();
});

watch(currentData, () => {
  createChart();
}, { deep: true });

watch(chartType, () => {
  createChart();
});

watch(isDarkMode, () => {
  createChart();
});
</script>
<style scoped>
/* You can add any additional scoped styles here if needed */
</style>

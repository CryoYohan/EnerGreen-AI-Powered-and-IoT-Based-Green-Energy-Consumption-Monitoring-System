<template>
  <div class="flex-col flex w-[96%] self-center p-5 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300 my-8">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6">
      <div class="mb-4 sm:mb-0">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent dark:from-green-400 dark:to-blue-400">{{ chartTitle }}</h2>
        <p class="text-sm md:text-base text-gray-500 dark:text-gray-400">Total kWh per {{ activePeriod }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:space-x-2">
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
        <button 
          @click="$emit('refresh')"
          class="flex items-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowPathIcon class="w-4 h-4" />
          <span class="ml-1">Refresh</span>
        </button>
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
import { ArrowPathIcon } from '@heroicons/vue/24/outline';

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
  dailyCostData: Array,
  weeklyCostData: Array,
  monthlyCostData: Array,
  yearlyCostData: Array,

  dailySavingsData: Array,
  weeklySavingsData: Array,
  monthlySavingsData: Array,
  yearlySavingsData: Array,
});

const emit = defineEmits(['update:activePeriod', 'refresh']);

const chartCanvasRef = ref(null);
let energyChart = null;

const chartType = ref('bar');
const { isDarkMode } = useDarkMode();

// Helper Functions
const currentCostData = computed(() => {
  switch (props.activePeriod) {
    case 'Daily': return props.dailyCostData;
    case 'Weekly': return props.weeklyCostData;
    case 'Monthly': return props.monthlyCostData;
    case 'Yearly': return props.yearlyCostData;
    default: return [];
  }
});

const currentSavingsData = computed(() => {
  switch (props.activePeriod) {
    case 'Daily': return props.dailySavingsData;
    case 'Weekly': return props.weeklySavingsData;
    case 'Monthly': return props.monthlySavingsData;
    case 'Yearly': return props.yearlySavingsData;
    default: return [];
  }
});

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
  if (!chartCanvasRef.value) return;
  if (energyChart) energyChart.destroy();

  const labels = currentData.value.map(item => item.label);
  const gridKwhValues = currentData.value.map(item => item.grid || 0);
  const solarKwhValues = currentData.value.map(item => item.solar || 0);
  const costValues = currentCostData.value.map(item => item.value);
  const savingsValues = currentSavingsData.value.map(item => item.value);

  const baseColors = {
    grid: isDarkMode.value ? '#4A5568' : '#E2E8F0',
    ticks: isDarkMode.value ? '#CBD5E0' : '#4A5568',
    barGrid: 'rgba(76, 175, 80, 0.8)', // green-500 (reverted)
    barSolar: 'rgba(245, 158, 11, 0.8)', // amber-500
    line: isDarkMode.value ? '#E5E7EB' : '#1F2937',
    cost: '#2563eb',     // blue
    savings: '#f59e0b',  // amber
    point: isDarkMode.value ? '#E5E7EB' : '#1F2937',
  };

  const datasets = [
    {
      type: 'bar',
      label: `Grid ${props.tooltipUnit}`,
      data: gridKwhValues,
      backgroundColor: baseColors.barGrid,
      yAxisID: 'y',
    },
    {
      type: 'bar',
      label: `Solar ${props.tooltipUnit}`,
      data: solarKwhValues,
      backgroundColor: baseColors.barSolar,
      yAxisID: 'y',
    },
  ];

  if (chartType.value === 'combined') {
    datasets.push(
      {
        type: 'line',
        label: 'Cost (₱)',
        data: costValues,
        borderColor: baseColors.cost,
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 3,
        yAxisID: 'y1', // second axis for pesos
      },
      {
        type: 'line',
        label: 'Savings (₱)',
        data: savingsValues,
        borderColor: baseColors.savings,
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 3,
        yAxisID: 'y1',
      }
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }, // ✅ show legend now
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
        stacked: true,
        title: {
          display: true,
          text: props.xAxisLabel,
          color: baseColors.ticks,
        },
        ticks: { color: baseColors.ticks },
        grid: { color: baseColors.grid },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: `Total ${props.tooltipUnit}`,
          color: baseColors.ticks,
        },
        beginAtZero: true,
        ticks: { color: baseColors.ticks },
        grid: { color: baseColors.grid },
        position: 'left',
      },
      y1: {
        title: {
          display: true,
          text: '₱ Cost / Savings',
          color: baseColors.ticks,
        },
        beginAtZero: true,
        ticks: { color: baseColors.ticks },
        grid: { drawOnChartArea: false },
        position: 'right',
      },
    },
  };

  energyChart = new Chart(chartCanvasRef.value, {
    type: 'bar',
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
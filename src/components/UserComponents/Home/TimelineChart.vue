<template>
  <div class="p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300 mx-4 lg:mx-auto lg:w-4/5 my-8">
    <div class="flex items-center justify-between mb-4 md:mb-6">
      <div class="flex items-center">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mr-2">Energy Usage Timeline</h2>
        <p class="text-sm md:text-base text-gray-500 dark:text-gray-400">Today</p>
      </div>
    </div>
    <div class="h-64 sm:h-80 md:h-96">
      <canvas ref="chartCanvasRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { useDarkMode } from "@/composables/useDarkMode.js";

const props = defineProps({
  readings: {
    type: Array,
    required: true,
  },
});

const chartCanvasRef = ref(null);
let timelineChart = null;

const { isDarkMode } = useDarkMode();

// A function to create or update the chart
const createChart = (readings) => {
  // Add the critical check to ensure the canvas element exists
  if (!chartCanvasRef.value) {
    return;
  }

  // Destroy the old chart instance if it exists
  if (timelineChart) {
    timelineChart.destroy();
  }

  // Process data for Chart.js
  const timestamps = readings.map(reading => {
    const date = new Date(reading.timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const kwhValues = readings.map(reading => reading.kwhConsumed);

  const chartData = {
    labels: timestamps,
    datasets: [{
      label: 'Energy Consumption (kWh)',
      data: kwhValues,
      borderColor: isDarkMode.value ? '#4CAF50' : '#4CAF50', // Tailwind's `green-500` or `green-600`
      backgroundColor: isDarkMode.value ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.2)', // Same color with alpha
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 5,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: isDarkMode.value ? '#CBD5E0' : '#4A5568',
        },
        grid: {
          color: isDarkMode.value ? '#4A5568' : '#E2E8F0',
          borderColor: isDarkMode.value ? '#4A5568' : '#E2E8F0',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: isDarkMode.value ? '#CBD5E0' : '#4A5568',
        },
        grid: {
          color: isDarkMode.value ? '#4A5568' : '#E2E8F0',
          borderColor: isDarkMode.value ? '#4A5568' : '#E2E8F0',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDarkMode.value ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode.value ? '#F9FAFB' : '#1F2937',
        bodyColor: isDarkMode.value ? '#F9FAFB' : '#1F2937',
        borderColor: isDarkMode.value ? '#4A5568' : '#E2E8F0',
        borderWidth: 1,
      },
    }
  };

  timelineChart = new Chart(chartCanvasRef.value, {
    type: 'line',
    data: chartData,
    options: chartOptions,
  });
};

onMounted(() => {
  // Create chart with initial data
  createChart(props.readings);
});

watch(() => props.readings, (newReadings) => {
  createChart(newReadings);
}, { deep: true });

watch(isDarkMode, () => {
  if (timelineChart) {
    // Update chart colors based on dark mode state
    timelineChart.data.datasets[0].borderColor = isDarkMode.value ? '#4CAF50' : '#4CAF50';
    timelineChart.data.datasets[0].backgroundColor = isDarkMode.value ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.2)';
    timelineChart.options.scales.x.ticks.color = isDarkMode.value ? '#CBD5E0' : '#4A5568';
    timelineChart.options.scales.x.grid.color = isDarkMode.value ? '#4A5568' : '#E2E8F0';
    timelineChart.options.scales.y.ticks.color = isDarkMode.value ? '#CBD5E0' : '#4A5568';
    timelineChart.options.scales.y.grid.color = isDarkMode.value ? '#4A5568' : '#E2E8F0';
    timelineChart.options.plugins.tooltip.backgroundColor = isDarkMode.value ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    timelineChart.options.plugins.tooltip.titleColor = isDarkMode.value ? '#F9FAFB' : '#1F2937';
    timelineChart.options.plugins.tooltip.bodyColor = isDarkMode.value ? '#F9FAFB' : '#1F2937';
    timelineChart.options.plugins.tooltip.borderColor = isDarkMode.value ? '#4A5568' : '#E2E8F0';
    timelineChart.update();
  }
});
</script>

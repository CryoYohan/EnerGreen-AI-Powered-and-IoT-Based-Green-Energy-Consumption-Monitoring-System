<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full">
    <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Cost Distribution</h3>
    <p class="text-xs text-gray-500 dark:text-gray-400 mb-6">Grid Cost vs. Solar Savings (This Month)</p>

    <div class="relative h-64 w-full flex justify-center items-center">
      <Doughnut :data="chartData" :options="chartOptions" />
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-xs text-gray-400">Total Value</span>
        <span class="text-xl font-bold text-gray-800 dark:text-white">₱{{ totalValue.toFixed(0) }}</span>
      </div>
    </div>

    <div class="mt-6 space-y-3">
      <div class="flex justify-between items-center text-sm">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-gray-600 dark:text-gray-300">Grid Bill</span>
        </div>
        <span class="font-bold text-gray-900 dark:text-white">₱{{ gridCost.toFixed(2) }}</span>
      </div>
      <div class="flex justify-between items-center text-sm">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span class="text-gray-600 dark:text-gray-300">Solar Savings</span>
        </div>
        <span class="font-bold text-emerald-600 dark:text-emerald-400">₱{{ solarSavings.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  gridCost: { type: Number, default: 0 },
  solarSavings: { type: Number, default: 0 }
});

const totalValue = computed(() => props.gridCost + props.solarSavings);

const chartData = computed(() => ({
  labels: ['Grid Bill', 'Solar Savings'],
  datasets: [{
    data: [props.gridCost, props.solarSavings],
    backgroundColor: ['#3B82F6', '#10B981'], // Blue, Emerald
    borderWidth: 0,
    hoverOffset: 4
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%', // Thinner ring
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ₱${ctx.raw.toFixed(2)}`
      }
    }
  }
};
</script>
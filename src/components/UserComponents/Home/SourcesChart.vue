<template>
  <div class="container max-w-full p-4 mx-auto lg:pr-12 lg:pl-12 font-poppins">
    <div class="grid gap-6 grid-cols-v1 lg:grid-cols-2">
      <div class="p-6 bg-white rounded-lg shadow dark:bg-gray-800 dark:shadow-gray-700">
        <h2 class="mb-4 text-xl font-bold text-gray-800 dark:text-gray-100">
          Energy Source Breakdown
        </h2>
        <div class="flex flex-col items-center md:flex-row">
          <div class="w-64 h-64 mx-auto md:mr-8 lg:w-72 lg:h-72">
            <DoughnutChart 
              :chartData="energySourceData" 
              :chartOptions="doughnutOptions" 
            />
          </div>
          <div class="flex-1 mt-6 md:mt-0">
            <div class="space-y-3">
              <div class="flex items-center">
                <div class="w-4 h-4 mr-3 bg-green-500 rounded-full"></div>
                <span class="text-gray-700 dark:text-gray-300">Solar ({{ solarPercentage.toFixed(0) }}%)</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 mr-3 bg-blue-500 rounded-full"></div>
                <span class="text-gray-700 dark:text-gray-300">Grid ({{ gridPercentage.toFixed(0) }}%)</span>
              </div>
            </div>

            <div class="p-4 mt-6 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-600 dark:text-gray-400">Energy consumed today:</span>
                <span class="font-semibold text-gray-800 dark:text-gray-100">{{ totalKwh.toFixed(4) }} kWh</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Estimated Savings:</span>
                <span class="font-semibold text-gray-800 dark:text-gray-100">₱ {{ estimatedSavings.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white rounded-lg shadow dark:bg-gray-800 dark:shadow-gray-700">
        <h2 class="mb-4 text-xl font-bold text-gray-800 dark:text-gray-100">
          Top Energy Consumers
        </h2>
        <div v-if="loadingConsumers" class="pr-2 overflow-y-auto h-80 flex items-center justify-center">
            <p class="text-gray-500 dark:text-gray-400">Loading appliances...</p>
        </div>
        <div v-else-if="topConsumers.length > 0" class="pr-2 overflow-y-auto h-80">
          <div
            v-for="(consumer, index) in topConsumers"
            :key="index"
            class="flex items-center justify-between px-3 py-4 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div class="flex items-center space-x-4">
              <div
                class="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full shrink-0 dark:bg-gray-700"
              >
                <span class="text-gray-500 dark:text-gray-300">{{ index + 1 }}</span>
              </div>
              <span class="text-gray-800 dark:text-gray-200">{{ consumer.name }}</span>
            </div>
            <span class="font-semibold text-gray-700 dark:text-gray-200"
              >{{ consumer.usage.toFixed(2) }} kWh</span
            >
          </div>
        </div>
        <div v-else class="pr-2 overflow-y-auto h-80 flex flex-col items-center justify-center text-center">
            <p class="text-gray-500 mb-4 dark:text-gray-400">You don't have individual appliances being monitored.</p>
            <p class="text-gray-700 font-semibold dark:text-gray-300">Consider buying a smart plug to get a more detailed breakdown.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import DoughnutChart from '@/components/ReusableComponents/DoughnutChart.vue';
import { computed } from 'vue';

// Define the props that this component will receive from its parent
const props = defineProps({
  gridKwh: {
    type: Number,
    required: true,
  },
  solarKwh: {
    type: Number,
    required: true,
  },
  topConsumers: {
    type: Array,
    required: true,
  },
  loadingConsumers: {
    type: Boolean,
    required: true,
  }
});

const energySourceData = computed(() => {
  const total = props.gridKwh + props.solarKwh;
  const gridPercentage = total > 0 ? (props.gridKwh / total) * 100 : 0;
  const solarPercentage = total > 0 ? (props.solarKwh / total) * 100 : 0;
  
  return {
    labels: ["Solar", "Grid"],
    datasets: [
      {
        data: [solarPercentage, gridPercentage],
        backgroundColor: ["#10B981", "#3B82F6"],
        borderWidth: 0,
        cutout: "60%",
      },
    ],
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.label}: ${context.raw.toFixed(2)}%`,
      },
    },
  },
};

const totalKwh = computed(() => props.gridKwh + props.solarKwh);
const solarPercentage = computed(() => totalKwh.value > 0 ? (props.solarKwh / totalKwh.value) * 100 : 0);
const gridPercentage = computed(() => totalKwh.value > 0 ? (props.gridKwh / totalKwh.value) * 100 : 0);
const estimatedSavings = computed(() => {
  // Assuming a rough rate of ₱10 per kWh for the grid
  const gridRate = 10;
  return props.solarKwh * gridRate;
});
</script>

<style scoped>
/* You can add component-specific styles here if needed */
</style>

<template>
  <div class="p-6 bg-white rounded-lg shadow lg:m-12 font-poppins dark:bg-gray-800 dark:shadow-gray-700">
    <div class="flex items-center justify-center mb-6 sm:justify-between">
      <h2 class="hidden font-bold text-gray-800 sm:text-sm sm:block lg:text-lg dark:text-gray-100">
        {{ title }} <span v-if="activePeriod">- {{ activePeriod }}</span>
      </h2>
      <div class="flex space-x-2 sm:ml-4">
        <button
          v-for="period in periods"
          :key="period"
          @click="$emit('update:activePeriod', period)"
          :class="{
            'bg-green-200 text-green-800 font-semibold dark:bg-green-700 dark:text-gray-100': activePeriod === period,
            'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700': activePeriod !== period,
          }"
          class="px-3 py-1 text-sm transition-colors rounded-md"
        >
          {{ period }}
        </button>
      </div>
    </div>

    <div class="relative h-[50vh] w-full bg-[#E7F8EE] dark:bg-gray-900 rounded-lg p-2">
      <Bar v-if="chartData.length > 0" :data="computedData" :options="chartOptions" />
      <div v-else class="h-full flex items-center justify-center text-gray-400">
        No data available for {{ activePeriod }}
      </div>
    </div>
  </div>
</template>

<script>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale,
} from "chart.js";
import { useDarkMode } from "@/composables/useDarkMode.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  components: { Bar },
  props: {
    title: String,
    activePeriod: { type: String, required: true },
    periods: { type: Array, default: () => ['Daily', 'Weekly', 'Monthly', 'Yearly'] },
    // Ensure default arrays to prevent crashes
    dailyData: { type: Array, default: () => [] },
    weeklyData: { type: Array, default: () => [] },
    monthlyData: { type: Array, default: () => [] },
    yearlyData: { type: Array, default: () => [] },
    xAxisLabel: String,
    tooltipUnit: String,
  },
  setup() {
    const { isDarkMode } = useDarkMode();
    return { isDarkMode };
  },
  computed: {
    chartData() {
      switch (this.activePeriod) {
        case "Daily": return this.dailyData || [];
        case "Weekly": return this.weeklyData || [];
        case "Monthly": return this.monthlyData || [];
        case "Yearly": return this.yearlyData || [];
        default: return [];
      }
    },
    computedData() {
      if (!this.chartData || this.chartData.length === 0) {
        return { labels: [], datasets: [] };
      }

      // Logic for default ranking colors (Fallback)
      const sorted = [...this.chartData].sort((a, b) => b.value - a.value);
      const highest = sorted[0]?.value;
      const secondHighest = sorted[1]?.value;
      const thirdHighest = sorted[2]?.value;

      return {
        labels: this.chartData.map((item) => item.label),
        datasets: [
          {
            label: this.title,
            data: this.chartData.map((item) => item.value),
            backgroundColor: this.chartData.map((item) => {
              // --- NEW LOGIC: Check for custom item color first ---
              if (item.color) return item.color;
              
              // Fallback to default ranking colors
              if (item.value === highest) return this.isDarkMode ? '#10B981' : '#047857'; 
              if (item.value === secondHighest) return this.isDarkMode ? '#065F46' : '#065F46'; 
              if (item.value === thirdHighest) return this.isDarkMode ? '#064E3B' : '#2C993A'; 
              return this.isDarkMode ? '#065F46' : '#A7F3D0'; 
            }),
            borderRadius: 6,
            barThickness: "flex",
            maxBarThickness: 80,
          },
        ],
      };
    },
    chartOptions() {
      const axisColor = this.isDarkMode ? '#4B5563' : '#9CA3AF';
      const fontColor = this.isDarkMode ? '#9CA3AF' : '#4B5563';

      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                // Show "Prevented" vs "Emitted" in tooltip based on logic
                // We can check the raw data index to see if it was Solar or Grid
                const rawItem = this.chartData[context.dataIndex];
                const typeLabel = rawItem.source === 'Solar' ? 'Prevented' : 'Emitted';
                return `${typeLabel}: ${context.formattedValue} ${this.tooltipUnit || ''}`;
              }
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: !!this.tooltipUnit, text: this.tooltipUnit, color: fontColor },
            ticks: { color: fontColor },
            grid: { color: axisColor },
          },
          x: {
            title: { display: !!this.xAxisLabel, text: this.xAxisLabel, color: fontColor },
            ticks: { color: fontColor },
            grid: { display: false },
          },
        },
      };
    },
  },
};
</script>
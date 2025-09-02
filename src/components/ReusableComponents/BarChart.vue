<template>
  <div class="p-6 bg-white rounded-lg shadow lg:m-12 font-poppins dark:bg-gray-800 dark:shadow-gray-700">
    <div class="flex items-center justify-center mb-6 sm:justify-between">
      <h2 class="hidden font-bold text-gray-800 sm:text-sm sm:block lg:text-lg dark:text-gray-100">
        {{ title }} - {{ activePeriod }}
      </h2>
      <div class="flex space-x-2 sm:ml-4">
        <button
          v-for="period in periods"
          :key="period"
          @click="$emit('update:activePeriod', period)"
          :class="{
            'bg-green-200 text-green-800 font-semibold dark:bg-green-700 dark:text-gray-100':
              activePeriod === period,
            'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700': activePeriod !== period,
          }"
          class="px-3 py-1 text-sm transition-colors rounded-md"
        >
          {{ period }}
        </button>
      </div>
    </div>

    <div class="relative h-[50vh] w-full bg-[#E7F8EE] dark:bg-gray-900">
      <Bar :data="computedData" :options="chartOptions" />
    </div>
  </div>
</template>

<script>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

// 1. Import the composable
import { useDarkMode } from "@/composables/useDarkMode.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default {
  components: { Bar },
  props: {
    title: String,
    activePeriod: {
      type: String,
      required: true,
    },
    periods: Array,
    dailyData: Array,
    weeklyData: Array,
    monthlyData: Array,
    yearlyData: Array,
    xAxisLabel: String,
    tooltipUnit: String,
    // 2. Remove the isDarkMode prop
    // isDarkMode: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  setup() {
    // 3. Use the composable to get the reactive state.
    const { isDarkMode } = useDarkMode();

    // 4. Return it so it can be used in computed properties.
    return { isDarkMode };
  },
  computed: {
    chartData() {
      switch (this.activePeriod) {
        case "Daily":
          return this.dailyData;
        case "Weekly":
          return this.weeklyData;
        case "Monthly":
          return this.monthlyData;
        case "Yearly":
          return this.yearlyData;
        default:
          return this.weeklyData;
      }
    },
    computedData() {
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
              if (item.value === highest) return this.isDarkMode ? '#10B981' : '#047857'; // green-500 or green-700
              if (item.value === secondHighest) return this.isDarkMode ? '#065F46' : '#065F46'; // green-800
              if (item.value === thirdHighest) return this.isDarkMode ? '#064E3B' : '#2C993A'; // green-900
              return this.isDarkMode ? '#065F46' : '#A7F3D0'; // green-800 or green-200 as default
            }),
            borderRadius: 6,
            barThickness: "flex",
            maxBarThickness: 80,
          },
        ],
      };
    },
    chartOptions() {
      // 5. Use the isDarkMode value directly from the setup function.
      const axisColor = this.isDarkMode ? '#4B5563' : '#4B5563'; // gray-600 or gray-200
      const fontColor = this.isDarkMode ? '#4B5563' : '#4B5563'; // gray-300 or gray-500

      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.formattedValue} ${this.tooltipUnit}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.tooltipUnit,
              color: fontColor,
            },
            ticks: { color: fontColor },
            grid: { color: axisColor },
          },
          x: {
            title: {
              display: true,
              text: this.xAxisLabel,
              color: fontColor,
            },
            ticks: { color: fontColor },
            grid: { color: axisColor },
          },
        },
      };
    },
  },
};
</script>
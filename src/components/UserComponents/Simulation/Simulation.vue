<template>
  <div
    class="container justify-between flex flex-col lg:flex-row items-start max-w-full p-4 lg:p-10 mx-auto font-poppins bg-[#F9FAFB] dark:bg-gray-900"
  >
    <div
      class="w-full rounded-lg shadow-md lg:w-1/2 lg:min-w-[1000px] lg:max-w-[600px] p-4 bg-white dark:bg-gray-800 flex flex-col"
    >
      <div class="flex flex-col gap-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Simulate Your Solar Savings</h1>

        <div class="w-full mt-4 space-y-2">
          <div class="flex gap-1 items-center">
            <img class="w-5 h-4 dark:invert" src="/src/Images/icons/location.svg" alt="" />
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >Location</label
            >
          </div>
          <input
            type="text"
            class="w-full px-3 py-2 mt-1 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            placeholder="Enter your location"
          />
        </div>

        <div class="w-full mt-4 space-y-2">
          <div class="flex gap-1 items-center">
            <img class="w-5 h-4 dark:invert" src="/src/Images/icons/size.svg" alt="" />
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >Home Size</label
            >
          </div>
          <input
            type="text"
            class="w-full px-3 py-2 mt-1 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            placeholder="Enter your home size"
          />
        </div>

        <div class="w-full mt-4 space-y-2">
          <div class="flex gap-1 items-center">
            <img class="w-5 h-4 dark:invert" src="/src/Images/icons/monthly.svg" alt="" />
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >Monthly Electricity Usage</label
            >
          </div>
          <input
            type="text"
            class="w-full px-3 py-2 mt-1 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            placeholder="Enter monthly usage"
          />
        </div>

        <div class="w-full mt-4 space-y-2">
          <div class="flex gap-1 items-center">
            <img class="w-5 h-4 dark:invert" src="/src/Images/icons/value.svg" alt="" />
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >Average Monthly Usage (kWh)</label
            >
          </div>
          <input
            type="text"
            class="w-full px-3 py-2 mt-1 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            placeholder="Enter average usage"
          />
        </div>

        <div class="w-full mt-4">
          <div class="flex gap-1 items-center">
            <img class="w-5 h-4 dark:invert" src="/src/Images/icons/solarsys.svg" alt="" />
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >Solar System Size</label
            >
          </div>
          <input
            type="text"
            class="w-full px-3 py-2 mt-1 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            placeholder="Enter system size"
          />
        </div>

        <div class="w-full mt-4">
          <div class="flex gap-1 items-center">
            <img class="w-5 h-4 dark:invert" src="/src/Images/icons/value.svg" alt="" />
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >Budget</label
            >
          </div>
          <input
            type="text"
            class="w-full px-3 py-2 mt-1 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            placeholder="Enter your budget"
          />
        </div>

        <button
          class="w-full py-3 bg-[#059669] rounded-md mt-10 text-white text-lg hover:bg-[#047857] transition-colors"
        >
          Run Simulation
        </button>
      </div>
    </div>

    <div class="w-full lg:w-1/2 mt-4 lg:mt-0 lg:ml-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
        <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Simulation Results</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            class="h-[120px] p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col justify-between"
          >
            <p class="text-sm text-gray-600 dark:text-gray-300">Monthly Generation</p>
            <p class="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-white">
              202.5 kWh
            </p>
          </div>
          <div
            class="h-[120px] p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col justify-between"
          >
            <p class="text-sm text-gray-600 dark:text-gray-300">Monthly Savings</p>
            <p class="text-xl sm:text-2xl font-bold text-green-600">P2,400</p>
          </div>
          <div
            class="h-[120px] p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col justify-between"
          >
            <p class="text-sm text-gray-600 dark:text-gray-300">Solar Offset</p>
            <p class="text-xl sm:text-2xl font-bold text-[#2563EB] dark:text-blue-400">100%</p>
          </div>
          <div
            class="h-[120px] p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col justify-between"
          >
            <p class="text-sm text-gray-600 dark:text-gray-300">Payback Period</p>
            <p class="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-white">
              5.2 years
            </p>
          </div>
          <div
            class="h-[120px] p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col justify-between"
          >
            <p class="text-sm text-gray-600 dark:text-gray-300">Lifetime Savings</p>
            <p class="text-xl sm:text-2xl font-bold text-green-600">P570,000</p>
          </div>
          <div
            class="h-[120px] p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col justify-between"
          >
            <p class="text-sm text-gray-600 dark:text-gray-300">CO₂ Offset</p>
            <div>
              <p class="text-xl sm:text-2xl font-bold text-green-600">
                1.44 tons/year
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">≈ 72 trees planted</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Energy Cost Consumption</h2>
        <div class="flex justify-between mb-2">
          <div class="flex space-x-4">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span class="text-sm text-gray-600 dark:text-gray-300">Solar Generation</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span class="text-sm text-gray-600 dark:text-gray-300">Electricity Usage</span>
            </div>
          </div>
        </div>

        <div class="relative" :style="{ height: chartHeight + 'px' }">
          <Line
            :data="chartData"
            :options="chartOptions"
            :height="chartHeight"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// NOTE: You need to import the useDarkMode composable here to make the dark mode work on this page.
import { useDarkMode } from "@/composables/useDarkMode.js";

import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
);

export default {
  components: { Line },
  // Add the setup method to use the composable and get the reactive state.
  setup() {
    const { isDarkMode } = useDarkMode();
    return { isDarkMode };
  },
  data() {
    return {
      chartHeight: 285,
      chartData: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: "Solar Generation",
            data: [50, 80, 120, 160, 200, 240, 220, 180, 140, 100, 60, 30],
            borderColor: "#10B981", // Tailwind green-500 equivalent
            backgroundColor: "transparent",
            tension: 0.4,
            borderWidth: 2,
          },
          {
            label: "Electricity Usage",
            data: [220, 200, 180, 150, 120, 100, 110, 130, 160, 190, 210, 230],
            borderColor: "#3B82F6", // Tailwind blue-500 equivalent
            backgroundColor: "transparent",
            tension: 0.4,
            borderWidth: 2,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 300,
            ticks: {
              stepSize: 75,
              color: "#6B7280" // Default y-axis text color
            },
            grid: {
              drawBorder: false,
              color: "#374151" // Default grid color
            },
          },
          x: {
            ticks: {
              color: "#6B7280" // Default x-axis text color
            },
            grid: {
              display: false,
            },
          },
        },
      },
    };
  },
  watch: {
    // Watch for dark mode changes to update chart colors
    isDarkMode(newValue) {
      if (newValue) {
        this.chartOptions.scales.y.ticks.color = "#D1D5DB"; // Gray-300
        this.chartOptions.scales.y.grid.color = "#4B5563"; // Gray-600
        this.chartOptions.scales.x.ticks.color = "#D1D5DB"; // Gray-300
      } else {
        this.chartOptions.scales.y.ticks.color = "#6B7280"; // Gray-500
        this.chartOptions.scales.y.grid.color = "#E5E7EB"; // Gray-200
        this.chartOptions.scales.x.ticks.color = "#6B7280"; // Gray-500
      }
    }
  },
  mounted() {
    // Call the watcher immediately on mount to set initial chart colors
    this.isDarkMode; 
  }
};
</script>
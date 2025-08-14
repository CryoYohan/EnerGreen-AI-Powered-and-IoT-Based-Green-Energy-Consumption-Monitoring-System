<!-- FILE NOTE USED -->

<template>
  <div class="p-6 bg-white rounded-lg shadow lg:m-12 font-poppins">
    <div class="flex items-center justify-center mb-6 sm:justify-between">
        <h2 class="hidden font-bold text-gray-800 sm:text-sm sm:block lg:text-lg">
        Electricity Usage - {{ activePeriod }}
      </h2>
      <div class="flex space-x-2 sm:ml-4">
        <button
          v-for="period in periods"
          :key="period"
          @click="activePeriod = period"
          :class="{
            'bg-green-200 text-green-800 font-semibold':
              activePeriod === period,
            'text-gray-500 hover:bg-gray-100': activePeriod !== period,
          }"
          class="px-3 py-1 text-sm transition-colors rounded-md"
        >
          {{ period }}
        </button>
      </div>
    </div>

    <div class="relative bg-[#] h-[50vh] w-full"> 
     <Bar
        id="electricity-usage-bar"
        :options="chartOptions"
        :data="chartDataForChartJS"
      />
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default {
  name: "ElectricityUsageChart",
  components: { Bar },
  data() {
    return {
      activePeriod: "Weekly",
      periods: ["Daily", "Weekly", "Monthly", "Yearly"],
      dailyData: [
        { label: "12AM", value: 5 },
        { label: "2AM", value: 3 },
        { label: "4AM", value: 2 },
        { label: "6AM", value: 8 },
        { label: "8AM", value: 15 },
        { label: "10AM", value: 20 },
        { label: "12PM", value: 25 },
        { label: "2PM", value: 28 },
        { label: "4PM", value: 30 },
        { label: "6PM", value: 35 },
        { label: "8PM", value: 25 },
        { label: "10PM", value: 15 },
      ],
      weeklyData: [
        { label: "Monday", value: 41 },
        { label: "Tuesday", value: 48 },
        { label: "Wednesday", value: 54 },
        { label: "Thursday", value: 32 },
        { label: "Friday", value: 38 },
        { label: "Saturday", value: 24 },
        { label: "Sunday", value: 39 },
      ],
      monthlyData: [
        { label: "Jan", value: 420 },
        { label: "Feb", value: 380 },
        { label: "Mar", value: 410 },
        { label: "Apr", value: 350 },
        { label: "May", value: 480 },
        { label: "Jun", value: 520 },
        { label: "Jul", value: 600 },
        { label: "Aug", value: 580 },
        { label: "Sep", value: 450 },
        { label: "Oct", value: 400 },
        { label: "Nov", value: 370 },
        { label: "Dec", value: 430 },
      ],
      yearlyData: [
        { label: "2019", value: 4800 },
        { label: "2020", value: 5200 },
        { label: "2021", value: 5500 },
        { label: "2022", value: 5800 },
        { label: "2023", value: 5400 },
      ],
    };
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
    maxValue() {
      const values = this.chartData.map((item) => item.value);
      // Ensure there's a reasonable max for empty or very low data sets
      const calculatedMax = Math.max(...values, 10);
      // Round up to the nearest 10 for cleaner Y-axis ticks, then add headroom
      return Math.ceil(calculatedMax / 10) * 10 + 10; // Round up to nearest 10, then add 10 for headroom
    },
    chartDataForChartJS() {
      return {
        labels: this.chartData.map((item) => item.label),
        datasets: [
          {
            label: "Electricity Usage",
            data: this.chartData.map((item) => item.value),
            backgroundColor: this.chartData.map((item, index) =>
              this.getBarColorHex(item, index)
            ),
            borderRadius: 6,
            // barPercentage: 0.8, // Controls the width of bars relative to the category width
            // categoryPercentage: 0.7, // Controls the width of the category (space for bars)
            barThickness: 'flex', // Allow Chart.js to manage thickness dynamically
            maxBarThickness: 80, // Set a max bar width for larger screens
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false, // Essential for custom height
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false, // Title is already in the HTML above the chart
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.formattedValue} kWh`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: this.maxValue,
            title: {
              display: true,
              text: "Usage (kWh)", // As seen in image_cf1c26.png
              font: {
                size: 12, // Smaller font for mobile
              },
            },
            ticks: {
              stepSize: Math.ceil(this.maxValue / 5 / 10) * 10,
              font: {
                size: 10, // Smaller font for mobile
              }
            },
          },
          x: {
            title: {
              display: true,
              text: // Dynamic X-axis title
                this.activePeriod === "Daily"
                  ? "Time of Day"
                  : this.activePeriod === "Weekly"
                  ? "Day of the Week"
                  : this.activePeriod === "Monthly"
                  ? "Month"
                  : "Year",
              font: {
                size: 12, // Smaller font for mobile
              },
            },
            ticks: {
              autoSkip: false, // Disable auto-skipping to apply rotation
              maxRotation: 45, // Rotate labels by 45 degrees
              minRotation: 45, // Keep rotation consistent
              font: {
                size: 10, // Smaller font for mobile
              }
            },
          },
        },
        // Add layout padding to ensure labels don't get cut off
        layout: {
          padding: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
          }
        }
      };
    },
  },
  methods: {
    getBarColorHex(item, index) {
      if (this.activePeriod === "Daily") {
        return index < 4
          ? "#9CA3AF" // gray-400
          : index < 8
          ? "#4ADE80" // green-400
          : "#16A34A"; // green-600
      } else if (this.activePeriod === "Weekly") {
        return item.label === "Monday"
          ? "#1F2937" // gray-800
          : ["Tuesday", "Wednesday"].includes(item.label)
          ? "#065F46" // green-800 (Darker green)
          : ["Thursday", "Friday"].includes(item.label)
          ? "#047857" // green-700 (Medium green)
          : "#4ADE80"; // green-400 (Lighter green)
      } else if (this.activePeriod === "Monthly") {
        return index < 4
          ? "#4ADE80" // green-400
          : index < 8
          ? "#047857" // green-700
          : "#065F46"; // green-800
      } else {
        // Yearly
        return index % 3 === 0
          ? "#4ADE80"
          : index % 3 === 1
          ? "#047857"
          : "#065F46";
      }
    },
  },
};
</script>

<style scoped>
/* No specific styles needed here, as Chart.js handles rendering */
/* The h-[50vh] and w-full in the template handle container sizing via Tailwind */
</style>
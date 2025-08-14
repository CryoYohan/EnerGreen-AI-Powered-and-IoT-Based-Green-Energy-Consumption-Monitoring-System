<template>
<div class="grid m-4 sm:m-5 lg:m-10 grid-cols-1 md:grid-cols-2 gap-6 font-poppins">
  
     <div class="p-6 bg-white rounded-xl shadow flex flex-col items-center">
        <div class="w-full text-left" >
            <h2 class="mb-4 text-lg font-semibold text-gray-800">Inventory Overview</h2>
      </div>
      <div class="flex flex-col items-center md:flex-row">
        <div class="w-40 h-40 md:w-60 md:h-60">
          <DoughnutChart
            :chartData="firmwareData"
            :chartOptions="doughnutOptions"
          />
        </div>
        <div class="mt-4 md:ml-6 lg:ml-20 space-y-3 text-sm text-gray-700">
          <div class="flex items-center text-xl">
            <div class="w-3 h-3 mr-2 rounded-full bg-[#22C55E]"></div>
            Smart Plugs (51%)
          </div>
          <div class="flex items-center text-xl">
            <div class="w-3 h-3 mr-2 rounded-full bg-[#60A5FA]"></div>
            Solar Panels (35%)
          </div>
          <div class="flex items-center text-xl">
            <div class="w-3 h-3 mr-2 rounded-full bg-[#EAA552]"></div>
            Smart Meters (12%)
          </div>
        <div class="flex items-center text-xl">
            <div class="w-3 h-3 mr-2 rounded-full bg-[#EA52C4]"></div>
            Others (10%)
          </div>
          <p class="mt-4 text-xl">
            Last firmware update: <span class="font-semibold">May 30, 2025</span>
          </p>
        </div>
      </div>
    </div>

    <!--  -->
    <div class="p-6 bg-white rounded-xl shadow">
      <h2 class="text-lg font-semibold text-gray-800 mb-1">Device Status</h2>
      <p class="text-sm text-gray-500 mb-4">Monthly Rankings</p>
      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between p-3 rounded-lg bg-yellow-100">
          <div class="flex items-center space-x-3">
            <span class="text-gray-800 font-medium">Active</span>
          </div>
          <span class="font-semibold text-gray-700">1,180</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg bg-gray-100">
          <div class="flex items-center space-x-3">
            <span class="text-gray-800 font-medium">Offline </span>
          </div>
          <span class="font-semibold text-gray-700">22</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg bg-red-100">
          <div class="flex items-center space-x-3">
            <span class="text-gray-800 font-medium">Maintenance</span>
          </div>
          <span class="font-semibold text-gray-700">48</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DoughnutChart from '@/components/ReusableComponents/DoughnutChart.vue';

export default {
  components: {
    DoughnutChart,
  },
  data() {
    return {
      firmwareData: {
        labels: ["Energreen v1.2", "Energreen v1.1"],
        datasets: [
          {
            data: [55, 30, 15 ,5],
            backgroundColor: ["#22C55E", "#60A5FA", "#EAA552", "#EA52C4"],
            borderWidth: 0,
            cutout: "30%",
          },
        ],
      },
      doughnutOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw}%`,
            },
          },
        },
      },
    };
  },
};
</script>

<style scoped>
/* Optional scoped styles */
</style>

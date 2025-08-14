<template>
  <div class="container max-w-full p-4 mx-auto lg:pr-12 lg:pl-12 font-poppins">
    <div class="grid gap-6 grid-cols-v1 lg:grid-cols-2">
      <div class="p-6 bg-white rounded-lg shadow">
        <h2 class="mb-4 text-xl font-bold text-gray-800">
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
                <span class="text-gray-700">Solar (65%)</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 mr-3 bg-blue-500 rounded-full"></div>
                <span class="text-gray-700">Grid (35%)</span>
              </div>
            </div>

            <div class="p-4 mt-6 rounded-lg bg-gray-50">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-600">Energy exported today:</span>
                <span class="font-semibold">2.3 kWh</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Estimated Savings:</span>
                <span class="font-semibold">₱ 45.60</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white rounded-lg shadow">
        <h2 class="mb-4 text-xl font-bold text-gray-800">
          Top Energy Consumers
        </h2>
        <div class="pr-2 overflow-y-auto h-80">
          <div
            v-for="(consumer, index) in topConsumers"
            :key="index"
            class="flex items-center justify-between px-3 py-4 transition-colors rounded-lg hover:bg-gray-50"
          >
            <div class="flex items-center space-x-4">
              <div
                class="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full shrink-0"
              >
                <span class="text-gray-500">{{ index + 1 }}</span>
              </div>
              <span class="text-gray-800">{{ consumer.name }}</span>
            </div>
            <span class="font-semibold text-gray-700"
              >{{ consumer.usage }} kWh</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DoughnutChart from '@/components/ReusableComponents/DoughnutChart.vue';

export default {
  components: {
    DoughnutChart
  },
  data() {
    return {
      energySourceData: {
        labels: ["Solar", "Grid"],
        datasets: [
          {
            data: [65, 35],
            backgroundColor: ["#10B981", "#3B82F6"],
            borderWidth: 0,
            cutout: "60%",
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
      topConsumers: [
        { name: "Air Conditioner", usage: 1.2 },
        { name: "Refrigerator", usage: 0.8 },
        { name: "Television", usage: 0.4 },
        { name: "Living Room Lights", usage: 1.2 },
        { name: "Washing Machine", usage: 0.6 },
        { name: "Microwave", usage: 0.3 },
        { name: "Desktop Computer", usage: 0.5 },
        { name: "Water Heater", usage: 0.7 },
        { name: "Dishwasher", usage: 0.4 },
      ],
    };
  },
};
</script>

<style scoped>
/* You can add component-specific styles here if needed */
</style>
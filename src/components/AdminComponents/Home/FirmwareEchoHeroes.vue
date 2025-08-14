<template>
<div class="grid m-4 sm:m-5 lg:m-10 grid-cols-1 md:grid-cols-2 gap-6 font-poppins">
    <!-- Firmware Update -->
    <div class="p-6 bg-white rounded-xl shadow flex flex-col items-center">
        <div class="w-full text-left" >
            <h2 class="mb-4 text-lg font-semibold text-gray-800">Firmware Update</h2>
      </div>
      <div class="flex flex-col items-center md:flex-row">
        <div class="w-40 h-40 md:w-60 md:h-60">
          <DoughnutChart
            :chartData="firmwareData"
            :chartOptions="doughnutOptions"
          />
        </div>
        <div class="mt-4 md:ml-6 lg:ml-20 space-y-3 text-sm text-gray-700">
          <div class="flex items-center text-2xl">
            <div class="w-3 h-3 mr-2 rounded-full bg-[#22C55E]"></div>
            Energreen v1.2 (90%)
          </div>
          <div class="flex items-center text-2xl">
            <div class="w-3 h-3 mr-2 rounded-full bg-[#60A5FA]"></div>
            Energreen v1.1 (10%)
          </div>
          <p class="mt-4 text-2xl">
            Last firmware update: <span class="font-semibold">May 30, 2025</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Top Eco-Heroes -->
   <Rankings
      title="Top Eco-Heroes"
      subtitle="Monthly Rankings"
      :heroes="ecoHeroes"
    />
  </div>
</template>

<script>
import DoughnutChart from '@/components/ReusableComponents/DoughnutChart.vue';
import Rankings from '@/components/ReusableComponents/Rankings.vue';
export default {
  components: {
    DoughnutChart, Rankings
  },
  data() {
    return {
      firmwareData: {
        labels: ["Energreen v1.2", "Energreen v1.1"],
        datasets: [
          {
            data: [90, 10],
            backgroundColor: ["#22C55E", "#60A5FA"],
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
      ecoHeroes: [
        { name: "John Bake", co2: "29.4 kg", img: "/src/Images/profile/pfp.png" },
        { name: "Kate Lim", co2: "18 kg", img: "/src/Images/profile/pfp.png" },
        { name: "Marc Homes", co2: "13 kg", img: "/src/Images/profile/pfp.png" },
      ],
    };
  },
};
</script>

<style scoped>
/* Optional scoped styles */
</style>

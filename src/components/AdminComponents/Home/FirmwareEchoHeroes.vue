<template>
  <div class="grid m-4 sm:m-5 lg:m-10 grid-cols-1 md:grid-cols-2 gap-6 font-poppins bg-[#F9FAFB] dark:bg-gray-900">
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 flex flex-col items-center">
      <div class="w-full text-left" >
        <h2 class="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">Firmware Update</h2>
      </div>
      <div class="flex flex-col items-center md:flex-row">
        <div class="w-40 h-40 md:w-60 md:h-60">
          <DoughnutChart
            :chartData="firmwareData"
            :chartOptions="doughnutOptions"
          />
        </div>
        <div class="mt-4 md:ml-6 lg:ml-20 space-y-3 text-sm text-gray-700 dark:text-gray-100">
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
import { useDarkMode } from '@/composables/useDarkMode.js';
import { computed } from 'vue';

export default {
  components: {
    DoughnutChart,
    Rankings
  },
  setup() {
    const { isDarkMode } = useDarkMode();

    const firmwareData = {
      labels: ["Energreen v1.2", "Energreen v1.1"],
      datasets: [
        {
          data: [90, 10],
          backgroundColor: ["#22C55E", "#60A5FA"],
          borderWidth: 0,
          cutout: "60%",
        },
      ],
    };

    // Use a computed property to make the chart options reactive
    const doughnutOptions = computed(() => {
      const textColor = isDarkMode.value ? '#F3F4F6' : '#1F2937';

      return {
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
        // This color property is a common way to pass text styling to chart.js
        color: textColor,
      };
    });

    const ecoHeroes = [
      { name: "John Bake", co2: "29.4 kg", img: "/src/Images/profile/pfp.png" },
      { name: "Kate Lim", co2: "18 kg", img: "/src/Images/profile/pfp.png" },
      { name: "Marc Homes", co2: "13 kg", img: "/src/Images/profile/pfp.png" },
    ];
    
    return {
      isDarkMode,
      firmwareData,
      doughnutOptions,
      ecoHeroes
    };
  }
};
</script>
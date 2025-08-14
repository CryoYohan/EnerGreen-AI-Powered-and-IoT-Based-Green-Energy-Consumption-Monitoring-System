<template>
  <div class="w-full h-full">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default {
  name: "DoughnutChart",
  components: {
    Doughnut,
  },
  props: {
    chartData: Object,
    chartOptions: Object,
  },
};
</script>

<style scoped>
/* Add optional scoped styles */
</style>

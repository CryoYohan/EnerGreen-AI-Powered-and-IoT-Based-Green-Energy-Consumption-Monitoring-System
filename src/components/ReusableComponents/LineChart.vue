<!-- THIS FILE IS NOT USED --IGNORE-- -->
<template>
  <div>
    <Line
      :chart-options="chartOptions"
      :chart-data="chartData"
      :height="height"
    />
  </div>
</template>

<script>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
)

export default {
  name: 'LineChart',
  components: { Line },
  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartOptions: {
      type: Object,
      default: () => ({})
    },
    height: {
      type: Number,
      default: 300
    }
  }
}
</script>
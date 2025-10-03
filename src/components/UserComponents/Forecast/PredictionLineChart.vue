<template>
  <div class="h-64 md:h-80 w-full relative" ref="chartDiv"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import Plotly from 'plotly.js-dist-min';

const props = defineProps({
  chartData: {
    type: Array,
    required: true,
  },
  activeModel: {
    type: String,
    required: true,
  },
  forecasts: {
    type: Array,
    required: false,
    default: () => []
  }
});

const chartDiv = ref(null);

const createPlot = () => {
  if (!chartDiv.value) return;

  const xValues = props.chartData.map(d => d.timestamp);
  const yValues = props.chartData.map(d => d.yhat);

  // Define hoverText BEFORE using it in traces
  const hoverText = props.chartData.map((d, i) => {
    const forecast = props.forecasts?.[i];
    if (!forecast) return `Predicted: ${d.yhat?.toFixed(3)} W`;
    return (
      `Interval: ${forecast.interval || 'N/A'}<br>` +
      `Predicted: ${d.yhat?.toFixed(3)} W<br>` +
      `Cost: ₱${forecast.predicted_cost?.toFixed(2) || 'N/A'}<br>` +
      `CO₂: ${forecast.predicted_carbon_kg?.toFixed(2) || 'N/A'} kg` +
      (d.yhat_lower !== undefined && d.yhat_upper !== undefined
        ? `<br>Confidence: [${d.yhat_lower?.toFixed(2)}, ${d.yhat_upper?.toFixed(2)}] W`
        : '')
    );
  });

  const traces = [
    {
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: props.activeModel === 'prophet' ? 'Prophet (with Confidence)' : 'LightGBM',
      line: {
        color: props.activeModel === 'prophet' ? 'rgb(59, 130, 246)' : 'rgb(147, 51, 234)',
        shape: 'spline'
      },
      marker: { size: 6 },
      hoverinfo: 'text',
      hovertext: hoverText
    }
  ];

  // Add Prophet confidence interval if available
  if (props.activeModel === 'prophet' && props.chartData.every(d => d.yhat_lower !== undefined)) {
    traces.push({
      x: [...xValues, ...xValues.slice().reverse()],
      y: [
        ...props.chartData.map(d => d.yhat_upper),
        ...props.chartData.map(d => d.yhat_lower).reverse()
      ],
      fill: 'toself',
      fillcolor: 'rgba(59, 130, 246, 0.2)',
      line: { color: 'transparent' },
      name: 'Confidence Interval (95%)',
      type: 'scatter',
      showlegend: true
    });
  }

  const layout = {
    margin: { t: 20, r: 20, l: 40, b: 40 },
    xaxis: {
      title: 'Time',
      type: 'date',
    },
    yaxis: {
      title: 'Power (Watt)',
      rangemode: 'tozero'
    },
    legend: { orientation: 'h', y: -0.2 },
    hovermode: 'x unified',
    autosize: true
  };

  Plotly.react(chartDiv.value, traces, layout, { responsive: true });
};

onMounted(() => createPlot());

watch(() => props.chartData, () => createPlot(), { deep: true });
watch(() => props.activeModel, () => createPlot());
</script>

<style scoped>
</style>

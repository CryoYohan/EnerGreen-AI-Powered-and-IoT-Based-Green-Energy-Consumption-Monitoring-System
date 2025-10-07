<template>
  <div class="h-64 md:h-80 w-full relative" ref="chartDiv"></div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
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
const isDarkMode = ref(false);
let themeObserver = null;

// --- Theme Logic ---
const checkDarkMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark');
};

const getThemeLayout = computed(() => {
  if (isDarkMode.value) {
    return {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font_color: '#d1d5db', // light gray for text
      grid_color: '#374151', // darker gray for grid lines
      axis_color: '#9ca3af', // gray for axis lines and ticks
      hover_bgcolor: '#1f2937', // dark background for hover
      hover_bordercolor: '#4b5563' // border color for hover
    };
  } else {
    return {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font_color: '#1f2937', // dark gray for text
      grid_color: '#e5e7eb', // very light gray for grid lines
      axis_color: '#6b7280', // gray for axis lines and ticks
      hover_bgcolor: '#ffffff', // white background for hover
      hover_bordercolor: '#d1d5db' // border color for hover
    };
  }
});

const setupThemeObserver = () => {
  checkDarkMode(); // Initial check
  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        checkDarkMode();
        // Redraw chart when theme changes
        createPlot();
      }
    });
  });

  // Observe the <html> element for class attribute changes
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
};

onMounted(() => {
  setupThemeObserver();
  createPlot();
});

onBeforeUnmount(() => {
  if (themeObserver) {
    themeObserver.disconnect();
  }
  // Optional: Purge the plot on unmount to free resources
  if (chartDiv.value) {
     Plotly.purge(chartDiv.value);
  }
});

// --- Plotly Logic ---
const createPlot = () => {
  if (!chartDiv.value) return;

  const { font_color, grid_color, axis_color, paper_bgcolor, plot_bgcolor, hover_bgcolor, hover_bordercolor } = getThemeLayout.value;

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
    paper_bgcolor: paper_bgcolor,
    plot_bgcolor: plot_bgcolor,
    font: { color: font_color },
    xaxis: {
      title: 'Time',
      type: 'date',
      color: axis_color,
      gridcolor: grid_color,
      linecolor: grid_color,
      zerolinecolor: grid_color,
      tickfont: { color: font_color }
    },
    yaxis: {
      title: 'Power (Watt)',
      rangemode: 'tozero',
      color: axis_color,
      gridcolor: grid_color,
      linecolor: grid_color,
      zerolinecolor: grid_color,
      tickfont: { color: font_color }
    },
    legend: { 
      orientation: 'h', 
      y: -0.2,
      font: { color: font_color }
    },
    hovermode: 'x unified',
    autosize: true,
    // Add hover label styling
    hoverlabel: {
      bgcolor: hover_bgcolor,
      bordercolor: hover_bordercolor,
      font: {
        color: font_color,
        size: 12
      }
    }
  };

  Plotly.react(chartDiv.value, traces, layout, { responsive: true });
};

watch(() => props.chartData, () => createPlot(), { deep: true });
watch(() => props.activeModel, () => createPlot());
</script>

<style scoped>
</style>
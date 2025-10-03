<template>
  <div class="flex-col flex w-[96%] self-center p-5 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300 my-8">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6">
      <div class="mb-4 sm:mb-0">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">{{ chartTitle }}</h2>
        <p class="text-sm md:text-base text-gray-500 dark:text-gray-400">Total kWh per {{ activePeriod }}</p>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
        <select 
          :value="activePeriod" 
          @change="$emit('update:activePeriod', $event.target.value)"
          class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        >
          <option v-for="period in periods" :key="period" :value="period">{{ period }}</option>
        </select>
        <select 
          v-model="chartType"
          class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        >
          <option value="bar">Bar Chart</option>
          <option value="combined">Combined Chart</option>
        </select>
      </div>
    </div>
    <div class="h-64 sm:h-80 md:h-96 bg-transparent rounded-lg">
      <div ref="chartContainer" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted, nextTick } from 'vue';
import { useDarkMode } from "@/composables/useDarkMode.js";

// Load Plotly.js
const plotlyPromise = new Promise((resolve, reject) => {
  if (window.Plotly) {
    resolve(window.Plotly);
    return;
  }
  
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.26.0/plotly.min.js';
  script.onload = () => resolve(window.Plotly);
  script.onerror = () => reject(new Error('Failed to load Plotly.js'));
  document.head.appendChild(script);
});

const props = defineProps({
  chartTitle: {
    type: String,
    default: "Electricity Usage"
  },
  activePeriod: {
    type: String,
    required: true
  },
  periods: {
    type: Array,
    required: true
  },
  dailyData: {
    type: Array,
    required: true
  },
  weeklyData: {
    type: Array,
    required: true
  },
  monthlyData: {
    type: Array,
    required: true
  },
  yearlyData: {
    type: Array,
    required: true
  },
  xAxisLabel: {
    type: String,
    default: "Time"
  },
  tooltipUnit: {
    type: String,
    default: "kWh"
  },
  dailyCostData: Array,
  weeklyCostData: Array,
  monthlyCostData: Array,
  yearlyCostData: Array,
  dailySavingsData: Array,
  weeklySavingsData: Array,
  monthlySavingsData: Array,
  yearlySavingsData: Array,
});

const emit = defineEmits(['update:activePeriod']);

const chartContainer = ref(null);
const chartType = ref('bar');
const { isDarkMode } = useDarkMode();

let plotlyInstance = null;
let themeObserver = null;

// Computed properties for data
const currentCostData = computed(() => {
  switch (props.activePeriod) {
    case 'Daily': return props.dailyCostData || [];
    case 'Weekly': return props.weeklyCostData || [];
    case 'Monthly': return props.monthlyCostData || [];
    case 'Yearly': return props.yearlyCostData || [];
    default: return [];
  }
});

const currentSavingsData = computed(() => {
  switch (props.activePeriod) {
    case 'Daily': return props.dailySavingsData || [];
    case 'Weekly': return props.weeklySavingsData || [];
    case 'Monthly': return props.monthlySavingsData || [];
    case 'Yearly': return props.yearlySavingsData || [];
    default: return [];
  }
});

const currentData = computed(() => {
  switch (props.activePeriod) {
    case 'Daily': return props.dailyData;
    case 'Weekly': return props.weeklyData;
    case 'Monthly': return props.monthlyData;
    case 'Yearly': return props.yearlyData;
    default: return [];
  }
});

// Theme configuration
const getTheme = () => {
  const isDark = isDarkMode.value;
  return {
    isDark,
    bgColor: 'transparent',
    textColor: '#6b7280', // gray-500 for all text/axis elements
    gridColor: '#374151', // gray-500 for grid lines
    axisColor: '#374151', // gray-500 for axis lines
    barColor: 'rgba(76, 175, 80, 0.8)',
    lineColor: isDark ? '#e5e7eb' : '#1f2937',
    costColor: '#2563eb',
    savingsColor: '#f59e0b'
  };
};

// Custom tick formatting function
const customFormatTicks = () => {
  if (!chartContainer.value) return;
  
  // Find all y-axis tick labels and format them
  const yAxisTicks = chartContainer.value.querySelectorAll('.ytick text');
  yAxisTicks.forEach(tick => {
    const value = parseFloat(tick.textContent);
    if (value === 0) {
      tick.textContent = '0';
    } else {
      tick.textContent = value.toFixed(4);
    }
  });
};

// Watchers removed theme switching complexity since axis colors are now static

// Create chart
const createChart = async () => {
  if (!plotlyInstance || !chartContainer.value || !currentData.value.length) return;

  const theme = getTheme();
  const labels = currentData.value.map(item => item.label);
  const kwhValues = currentData.value.map(item => item.value);
  const costValues = currentCostData.value.map(item => item.value);
  const savingsValues = currentSavingsData.value.map(item => item.value);

  const traces = [
    {
      type: 'bar',
      name: `Total ${props.tooltipUnit}`,
      x: labels,
      y: kwhValues,
      marker: {
        color: theme.barColor,
        line: {
          color: 'transparent',
          width: 1
        }
      },
      yaxis: 'y',
      hovertemplate: `<b>%{x}</b><br>${props.tooltipUnit}: %{y:.4f}<extra></extra>`
    }
  ];

  if (chartType.value === 'combined') {
    // Add trend line
    traces.push({
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Trend',
      x: labels,
      y: kwhValues,
      line: {
        color: theme.lineColor,
        width: 2,
        shape: 'spline'
      },
      marker: {
        size: 4,
        color: theme.lineColor
      },
      yaxis: 'y',
      hovertemplate: `<b>%{x}</b><br>Trend: %{y:.4f} ${props.tooltipUnit}<extra></extra>`
    });

    // Add cost line if data exists
    if (costValues.length && costValues.some(v => v !== null && v !== undefined)) {
      traces.push({
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Cost (₱)',
        x: labels,
        y: costValues,
        line: {
          color: theme.costColor,
          width: 2,
          shape: 'spline'
        },
        marker: {
          size: 4,
          color: theme.costColor
        },
        yaxis: 'y2',
        hovertemplate: `<b>%{x}</b><br>Cost: ₱%{y:.2f}<extra></extra>`
      });
    }

    // Add savings line if data exists
    if (savingsValues.length && savingsValues.some(v => v !== null && v !== undefined)) {
      traces.push({
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Savings (₱)',
        x: labels,
        y: savingsValues,
        line: {
          color: theme.savingsColor,
          width: 2,
          shape: 'spline'
        },
        marker: {
          size: 4,
          color: theme.savingsColor
        },
        yaxis: 'y2',
        hovertemplate: `<b>%{x}</b><br>Savings: ₱%{y:.2f}<extra></extra>`
      });
    }
  }

  const layout = {
    margin: { l: 80, r: 60, t: 40, b: 80 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { 
      color: theme.textColor,
      size: 12
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      y: 1.08,
      x: 0,
      font: { color: theme.textColor }
    },
    xaxis: {
      title: {
        text: props.xAxisLabel,
        font: { color: theme.textColor }
      },
      showgrid: true,
      gridcolor: theme.gridColor,
      gridwidth: 1,
      color: theme.axisColor,
      linecolor: theme.gridColor,
      zerolinecolor: theme.gridColor,
      tickfont: { color: theme.textColor }
    },
    yaxis: {
      title: {
        text: `Total ${props.tooltipUnit}`,
        font: { color: theme.textColor },
        standoff: 20 // 1. Defines the space (in px) between the title and the tick labels
      },
      automargin: true, // 2. Tells Plotly to automatically push the left margin ('margin.l')
                        // to accommodate the title and its standoff distance.
      showgrid: true,
      Rangemode: 'tozero',
      gridcolor: theme.gridColor,
      gridwidth: 1,
      color: theme.axisColor,
      linecolor: theme.gridColor,
      zerolinecolor: theme.gridColor,
      tickfont: { color: theme.textColor },
      tickmode: 'auto',
      tickformat: '',
      ticklabelposition: 'outside',
      exponentformat: 'none',
      side: 'left'
    }
  };

// Add second y-axis for combined chart
  if (chartType.value === 'combined') {
    // Calculate max value for y2 axis from actual data points
    const allY2Values = [...costValues, ...savingsValues].filter(v => v !== null && v !== undefined && !isNaN(v));
    const maxY2 = allY2Values.length ? Math.max(...allY2Values) : 1;

    // Always start at 0, add 15% padding above max
    const rangeMin = 0;
    const rangeMax = maxY2 * 1.1;

    layout.yaxis2 = {
      title: {
        text: '₱ Cost / Savings',
        font: { color: theme.textColor },
      },
      showgrid: false,
      range: [rangeMin, rangeMax],
      color: theme.axisColor,
      linecolor: theme.gridColor,
      zerolinecolor: theme.gridColor,
      tickfont: { color: theme.textColor },
      overlaying: 'y',
      side: 'right',
      automargin: true,
      fixedrange: false
    };
  }

  const config = {
    displayModeBar: false,
    responsive: true
  };

  try {
    await plotlyInstance.newPlot(chartContainer.value, traces, layout, config);
    // Apply custom formatting after plot is created
    setTimeout(customFormatTicks, 100);
  } catch (error) {
    console.error('Error creating Plotly chart:', error);
  }
};

// Initialize component
onMounted(async () => {
  try {
    plotlyInstance = await plotlyPromise;
    await nextTick();
    await createChart();
  } catch (error) {
    console.error('Failed to initialize Plotly chart:', error);
  }
});

// Cleanup
onUnmounted(() => {
  if (plotlyInstance && chartContainer.value) {
    try {
      plotlyInstance.purge(chartContainer.value);
    } catch (error) {
      console.error('Error cleaning up chart:', error);
    }
  }
});

// Real-time update methods
const updateChartRealtime = async () => {
  if (!plotlyInstance || !chartContainer.value || !currentData.value.length) return;

  const labels = currentData.value.map(item => item.label);
  const kwhValues = currentData.value.map(item => item.value);
  const costValues = currentCostData.value.map(item => item.value);
  const savingsValues = currentSavingsData.value.map(item => item.value);

  // Use Plotly's restyle for smooth updates
  const update = {
    x: [labels],
    y: [kwhValues]
  };

  let traceIndex = 1;
  
  if (chartType.value === 'combined') {
    // Update trend line
    update.x.push(labels);
    update.y.push(kwhValues);
    traceIndex = 2;

    // Update cost line if data exists
    if (costValues.length && costValues.some(v => v !== null && v !== undefined)) {
      update.x.push(labels);
      update.y.push(costValues);
      traceIndex++;
    }

    // Update savings line if data exists
    if (savingsValues.length && savingsValues.some(v => v !== null && v !== undefined)) {
      update.x.push(labels);
      update.y.push(savingsValues);
    }
  }

  try {
    await plotlyInstance.restyle(chartContainer.value, update);
  } catch (error) {
    console.error('Error updating chart:', error);
    // Fallback to recreating chart if restyle fails
    await createChart();
  }
};

// Smart watcher that detects if it's a real-time update vs full recreation
let lastDataLength = 0;
let isInitialized = false;

watch(currentData, async (newData) => {
  await nextTick();
  
  if (!isInitialized) {
    // First load - create chart
    await createChart();
    lastDataLength = newData.length;
    isInitialized = true;
  } else {
    // Check if this is a real-time update (length change) or period change
    if (newData.length !== lastDataLength && Math.abs(newData.length - lastDataLength) <= 2) {
      // Likely a real-time update - use smooth update
      await updateChartRealtime();
      lastDataLength = newData.length;
    } else {
      // Significant change - recreate chart (period change, etc.)
      await createChart();
      lastDataLength = newData.length;
    }
  }
}, { deep: true });

watch(chartType, async () => {
  await nextTick();
  await createChart();
  isInitialized = true;
});

// Removed isDarkMode watcher since axis colors are now static gray-500
</script>

<style scoped>
/* Additional scoped styles if needed */
</style>
<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
    <!-- Minimal Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            User Insights
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Weekly performance metrics
          </p>
        </div>
      </div>
      
      <!-- Minimal Top Hero -->
      <div class="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
        <div class="w-2 h-2 bg-amber-500 rounded-full"></div>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Top: {{ insights.topHero }}</span>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="relative">
      <div ref="lineChart" class="chart-container"></div>
    </div>

    <!-- Minimal Metrics Legend -->
    <div class="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <div class="w-3 h-0.5 bg-emerald-500"></div>
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Growth</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-0.5 bg-rose-500"></div>
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Churn</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-0.5 bg-blue-500"></div>
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Online</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import Plotly from "plotly.js-dist-min";

// ✅ Mock data
const insights = {
  growthRate: [10, 12, 14, 15],
  churnRate: [4, 5, 6, 5],
  onlineUsers: [25, 28, 32, 37],
  topHero: "Eco42",
  labels: ["W1", "W2", "W3", "W4"]
};

const lineChart = ref(null);

const renderChart = () => {
  if (!lineChart.value) return;

  // Detect dark mode
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#9CA3AF' : '#6B7280';
  const gridColor = isDark ? '#374151' : '#E5E7EB';
  const bgColor = isDark ? '#111827' : '#FFFFFF';

  const data = [
    {
      x: insights.labels,
      y: insights.growthRate,
      type: "scatter",
      mode: "lines",
      name: "Growth Rate",
      line: { 
        color: "#10B981", // emerald-500
        width: 3,
        shape: 'linear'
      },
      hoverinfo: "y+name"
    },
    {
      x: insights.labels,
      y: insights.churnRate,
      type: "scatter",
      mode: "lines",
      name: "Churn Rate",
      line: { 
        color: "#F43F5E", // rose-500
        width: 3,
        shape: 'linear'
      },
      hoverinfo: "y+name"
    },
    {
      x: insights.labels,
      y: insights.onlineUsers,
      type: "scatter",
      mode: "lines",
      name: "Online Users",
      line: { 
        color: "#3B82F6", // blue-500
        width: 3,
        shape: 'linear'
      },
      hoverinfo: "y+name"
    }
  ];

  const layout = {
    margin: { t: 10, b: 40, l: 50, r: 20 },
    height: 300,
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: {
      family: 'Inter, system-ui, sans-serif',
      color: textColor,
      size: 12
    },
    xaxis: { 
      showgrid: true, 
      gridcolor: gridColor,
      gridwidth: 1,
      zeroline: false,
      showline: false,
      tickfont: { size: 11 }
    },
    yaxis: { 
      showgrid: true, 
      gridcolor: gridColor,
      gridwidth: 1,
      zeroline: false,
      showline: false,
      tickfont: { size: 11 }
    },
    showlegend: false,
    hovermode: 'x unified',
    hoverlabel: {
      bgcolor: bgColor,
      bordercolor: gridColor,
      font: { 
        color: textColor,
        size: 11
      }
    }
  };

  const config = {
    responsive: true,
    displayModeBar: false,
    staticPlot: false
  };

  Plotly.newPlot(lineChart.value, data, layout, config);
};

// Watch for dark mode changes
watch(() => document.documentElement.classList.contains('dark'), () => {
  setTimeout(renderChart, 100);
});

onMounted(() => {
  renderChart();
  
  // Add resize observer
  const resizeObserver = new ResizeObserver(() => {
    if (lineChart.value) {
      Plotly.Plots.resize(lineChart.value);
    }
  });
  
  if (lineChart.value) {
    resizeObserver.observe(lineChart.value);
  }
});
</script>

<style scoped>
.chart-container {
  height: 300px !important;
  width: 100% !important;
}

/* Remove all transitions for true minimalism */
* {
  transition: none;
}
</style>
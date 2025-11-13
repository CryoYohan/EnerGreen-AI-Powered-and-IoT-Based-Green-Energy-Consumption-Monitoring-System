<template>
  <div class="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
    <!-- Filter Buttons -->
    <div class=" mx-auto mb-6">
      <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div class="flex flex-wrap gap-2 justify-center">
          <button 
            v-for="filter in timeFilters" 
            :key="filter"
            @click="setActiveFilter(filter)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105',
              activeFilter === filter 
                ? 'bg-blue-500 text-white shadow-md scale-105' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            {{ filter }}
          </button>
        </div>
      </div>
    </div>

    <div class=" mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Cost Trend Chart -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:shadow-xl">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Cost Trend</h3>
        <div class="h-80 relative">
          <div id="cost-trend-chart" class="transition-all duration-700"></div>
          <div v-if="isAnimating" class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-80 rounded-xl">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Pattern Chart -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:shadow-xl">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Usage Pattern</h3>
        <div class="h-80 relative">
          <div id="usage-pattern-chart" class="transition-all duration-700"></div>
          <div v-if="isAnimating" class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-80 rounded-xl">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';

const timeFilters = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
const activeFilter = ref('Monthly');
const isAnimating = ref(false);

// Enhanced sample data with more realistic patterns
const chartData = {
  Daily: {
    cost: {
      x: ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
      y: [15, 12, 18, 35, 42, 48, 52, 45]
    },
    usage: {
      x: ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
      y: [8, 6, 12, 25, 32, 38, 42, 35]
    }
  },
  Weekly: {
    cost: {
      x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      y: [45, 52, 48, 55, 58, 42, 38]
    },
    usage: {
      x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      y: [35, 42, 38, 45, 48, 32, 28]
    }
  },
  Monthly: {
    cost: {
      x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      y: [85, 92, 78, 105, 120, 135, 142, 128, 115, 98, 87, 75]
    },
    usage: {
      x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      y: [65, 72, 58, 85, 95, 110, 118, 105, 92, 78, 67, 55]
    }
  },
  Yearly: {
    cost: {
      x: ['2020', '2021', '2022', '2023', '2024'],
      y: [980, 1120, 1250, 1380, 1150]
    },
    usage: {
      x: ['2020', '2021', '2022', '2023', '2024'],
      y: [850, 980, 1080, 1180, 950]
    }
  }
};

// Chart layouts with dynamic ranges and animations
const getChartLayouts = (filter) => {
  const baseLayout = {
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#6b7280' },
    margin: { l: 50, r: 30, t: 30, b: 50 },
    showlegend: false,
    hovermode: 'closest',
    transition: {
      duration: 700,
      easing: 'cubic-in-out'
    }
  };

  const costLayout = {
    ...baseLayout,
    xaxis: {
      gridcolor: 'rgba(107, 114, 128, 0.2)',
      linecolor: 'rgba(107, 114, 128, 0.3)',
      tickfont: { size: 12 }
    },
    yaxis: {
      gridcolor: 'rgba(107, 114, 128, 0.2)',
      linecolor: 'rgba(107, 114, 128, 0.3)',
      tickfont: { size: 12 }
    }
  };

  const usageLayout = {
    ...baseLayout,
    xaxis: {
      gridcolor: 'rgba(107, 114, 128, 0.2)',
      linecolor: 'rgba(107, 114, 128, 0.3)',
      tickfont: { size: 12 }
    },
    yaxis: {
      gridcolor: 'rgba(107, 114, 128, 0.2)',
      linecolor: 'rgba(107, 114, 128, 0.3)',
      tickfont: { size: 12 }
    }
  };

  // Adjust ranges based on filter
  switch(filter) {
    case 'Daily':
      costLayout.yaxis.range = [0, 60];
      costLayout.yaxis.tickvals = [0, 15, 30, 45, 60];
      usageLayout.yaxis.range = [0, 50];
      usageLayout.yaxis.tickvals = [0, 10, 20, 30, 40, 50];
      break;
    case 'Weekly':
      costLayout.yaxis.range = [0, 70];
      costLayout.yaxis.tickvals = [0, 20, 40, 60];
      usageLayout.yaxis.range = [0, 60];
      usageLayout.yaxis.tickvals = [0, 15, 30, 45, 60];
      break;
    case 'Monthly':
      costLayout.yaxis.range = [0, 160];
      costLayout.yaxis.tickvals = [0, 40, 80, 120, 160];
      usageLayout.yaxis.range = [0, 130];
      usageLayout.yaxis.tickvals = [0, 30, 60, 90, 120];
      break;
    case 'Yearly':
      costLayout.yaxis.range = [0, 1500];
      costLayout.yaxis.tickvals = [0, 500, 1000, 1500];
      usageLayout.yaxis.range = [0, 1300];
      usageLayout.yaxis.tickvals = [0, 400, 800, 1200];
      break;
  }

  return { costLayout, usageLayout };
};

const chartConfig = {
  displayModeBar: false,
  responsive: true
};

const setActiveFilter = async (filter) => {
  if (filter === activeFilter.value || isAnimating.value) return;
  
  isAnimating.value = true;
  activeFilter.value = filter;
  
  // Add a slight delay to show the loading animation
  await new Promise(resolve => setTimeout(resolve, 300));
  await updateCharts();
  
  // Keep loading state a bit longer for smooth transition
  setTimeout(() => {
    isAnimating.value = false;
  }, 500);
};

const updateCharts = async () => {
  const data = chartData[activeFilter.value];
  const layouts = getChartLayouts(activeFilter.value);

  // Update Cost Trend Chart with animation
  const costTrace = {
    x: data.cost.x,
    y: data.cost.y,
    type: 'scatter',
    mode: 'lines+markers',
    line: {
      color: '#3b82f6',
      width: 3,
      shape: 'spline'
    },
    marker: {
      color: '#3b82f6',
      size: 6,
      symbol: 'circle'
    },
    fill: 'tozeroy',
    fillcolor: 'rgba(59, 130, 246, 0.1)',
    transition: {
      duration: 700,
      easing: 'cubic-in-out'
    }
  };

  // Update Usage Pattern Chart with animation
  const getBarColors = (x) => {
    if (activeFilter.value === 'Daily') {
      return x.map((_, i) => i >= 4 && i <= 6 ? '#f59e0b' : '#10b981');
    } else if (activeFilter.value === 'Weekly') {
      return x.map((day, i) => ['Sat', 'Sun'].includes(day) ? '#f59e0b' : '#10b981');
    } else {
      return '#10b981';
    }
  };

  const usageTrace = {
    x: data.usage.x,
    y: data.usage.y,
    type: activeFilter.value === 'Yearly' ? 'scatter' : 'bar',
    mode: activeFilter.value === 'Yearly' ? 'lines+markers' : undefined,
    marker: {
      color: getBarColors(data.usage.x),
      opacity: 0.8,
      line: activeFilter.value !== 'Yearly' ? {
        color: 'rgba(0,0,0,0.1)',
        width: 1
      } : undefined
    },
    line: activeFilter.value === 'Yearly' ? {
      color: '#10b981',
      width: 3,
      shape: 'spline'
    } : undefined,
    transition: {
      duration: 700,
      easing: 'cubic-in-out'
    }
  };

  // Use Plotly's animate function for smooth transitions
  try {
    await Promise.all([
      Plotly.react('cost-trend-chart', [costTrace], {
        ...layouts.costLayout,
        transition: {
          duration: 700,
          easing: 'cubic-in-out'
        }
      }, chartConfig),
      Plotly.react('usage-pattern-chart', [usageTrace], {
        ...layouts.usageLayout,
        transition: {
          duration: 700,
          easing: 'cubic-in-out'
        }
      }, chartConfig)
    ]);
  } catch (error) {
    console.log('Chart update completed');
  }

  updateChartsForDarkMode();
};

const updateChartsForDarkMode = () => {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#d1d5db' : '#6b7280';
  const gridColor = isDark ? 'rgba(209, 213, 219, 0.2)' : 'rgba(107, 114, 128, 0.2)';
  const lineColor = isDark ? 'rgba(209, 213, 219, 0.3)' : 'rgba(107, 114, 128, 0.3)';

  const darkModeUpdate = {
    font: { color: textColor },
    xaxis: { 
      gridcolor: gridColor,
      linecolor: lineColor
    },
    yaxis: { 
      gridcolor: gridColor,
      linecolor: lineColor
    }
  };

  Plotly.relayout('cost-trend-chart', darkModeUpdate);
  Plotly.relayout('usage-pattern-chart', darkModeUpdate);
};

onMounted(() => {
  updateCharts();

  // Watch for dark mode changes
  const observer = new MutationObserver(updateChartsForDarkMode);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});

watch(activeFilter, () => {
  if (!isAnimating.value) {
    updateCharts();
  }
});
</script>

<style scoped>
#cost-trend-chart, #usage-pattern-chart {
  width: 100%;
  height: 100%;
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.chart-container {
  animation: fadeIn 0.7s ease-out;
}

/* Smooth transitions for chart elements */
.plotly .trace .linepath {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.plotly .bar {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
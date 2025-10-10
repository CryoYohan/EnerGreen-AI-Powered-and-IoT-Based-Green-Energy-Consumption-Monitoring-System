<template>
  <div class="p-5 lg:p-10 bg-transparent dark:bg-transparent">
    <h2 
      class="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent 
            from-green-600 to-blue-600 
            dark:from-green-400 dark:to-blue-400"
    >
      Real Time Readings
    </h2>
    <div v-if="loading" class="text-center text-gray-500 my-8 dark:text-gray-400">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto mb-4"></div>
      <p class="text-lg">Loading real-time data...</p>
    </div>

    <div v-else-if="deviceId" class="grid sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4">
      
      <div v-for="(chartData, key) in chartConfigurations" :key="key"
        class="p-6 bg-white shadow-lg rounded-xl dark:bg-gray-800 flex flex-col relative">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center space-x-3">
            <component 
              :is="chartData.iconComponent" 
              class="w-8 h-8 text-green-500"
            />
            <div>
              <h3 class="text-xl font-semibold text-gray-800 dark:text-white">{{ chartData.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 truncate w-full">{{ deviceId }}</p>
            </div>
          </div>
          <button @click="expandChart(key)"
            class="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>

        <p class="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">{{ latestValues[key] || 'N/A' }} <span
            class="text-xl font-normal text-gray-500 dark:text-gray-400">{{ chartData.unit }}</span></p>

        <div class="flex-grow min-h-[200px] bg-white dark:bg-gray-900 rounded-lg">
          <div :id="key + 'Chart'" class="w-full h-full bg-transparent"></div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 space-y-4 my-8 dark:text-gray-400">
      <p class="text-lg font-semibold text-gray-800 dark:text-white">No device linked yet.</p>
      <p>Please enter your device ID to start seeing real-time data.</p>
      <button @click="handleSetDeviceId"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
        Set Device ID
      </button>
    </div>

    <div v-if="expandedChart" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4"
      @click.self="closeExpandedChart">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-2xl font-bold text-gray-800 dark:text-white">{{ chartConfigurations[expandedChart].title }}</h3>
          <button @click="closeExpandedChart"
            class="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 flex-grow">
          <div id="expandedChartCanvas" class="w-full h-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db, doc, onAuthStateChanged, collection, onSnapshot, query, orderBy, limit } from '../../firebase';
import { Timestamp } from 'firebase/firestore';
import {
  BoltIcon,
  ArrowsRightLeftIcon,
  SunIcon,
  FireIcon,
  CircleStackIcon
} from '@heroicons/vue/24/outline'

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

export default {
  name: 'EnergreenDashboard',
  components: {
    BoltIcon,
    ArrowsRightLeftIcon,
    SunIcon,
    FireIcon,
    CircleStackIcon
  },
  data() {
    return {
      deviceId: null,
      readings: [],
      latestValues: {},
      loading: true,
      error: null,
      charts: {},
      expandedChart: null,
      maxDataPoints: 50, // Increased for better real-time visualization
      plotlyInstance: null,
      themeObserver: null, // For watching theme changes
      chartConfigurations: {
        voltage: { 
          title: 'Voltage', 
          unit: 'V', 
          dataKey: 'voltageVolt', 
          color: '#34D399', 
          thresholds: [
            { value: 230, color: '#facc15', name: 'Target' },
            { value: 253, color: '#dc2626', name: 'Upper Limit' },
            { value: 207, color: '#dc2626', name: 'Lower Limit' }
          ],
          iconComponent: 'BoltIcon'
        },
        current: { 
          title: 'Current', 
          unit: 'A', 
          dataKey: 'currentAmp', 
          color: '#60A5FA', 
          iconComponent: 'ArrowsRightLeftIcon'
        },
        power: { 
          title: 'Power', 
          unit: 'W', 
          dataKey: 'powerWatt', 
          color: '#F87171', 
          iconComponent: 'SunIcon'
        },
        energyConsumed: { 
          title: 'Energy Consumed', 
          unit: 'kWh', 
          dataKey: 'kwhConsumed', 
          color: '#A78BFA', 
          iconComponent: 'FireIcon'
        },
        powerFactor: { 
          title: 'Power Factor', 
          unit: '', 
          dataKey: 'powerFactor', 
          color: '#9CA3AF',
          thresholds: [
            { value: 0.9, color: '#dc2626', name: 'Minimum Threshold' }
          ],
          iconComponent: 'CircleStackIcon'
        },
      },
    };
  },
  
  async mounted() {
    try {
      this.plotlyInstance = await plotlyPromise;
      this.setupThemeObserver(); // Watch for theme changes
      this.setupListeners();
    } catch (error) {
      console.error('Failed to load Plotly:', error);
      this.error = "Error loading charts. Please try again.";
      this.loading = false;
    }
  },

  methods: {
    setupThemeObserver() {
      // Watch for changes to the 'dark' class on the html element
      this.themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            // Theme changed, update all chart colors
            this.$nextTick(() => {
              this.updateAllChartThemes();
            });
          }
        });
      });

      // Start observing
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    },

    updateAllChartThemes() {
      if (!this.plotlyInstance) return;

      const theme = this.getTheme();

      // Update all main charts
      for (const key in this.chartConfigurations) {
        const element = document.getElementById(key + 'Chart');
        if (element && element.data) {
          this.updateChartTheme(key + 'Chart', theme);
        }
      }

      // Update expanded chart if it exists
      if (this.expandedChart) {
        const expandedElement = document.getElementById('expandedChartCanvas');
        if (expandedElement && expandedElement.data) {
          this.updateChartTheme('expandedChartCanvas', theme);
        }
      }
    },

    updateChartTheme(chartId, theme) {
      const layoutUpdate = {
        'font.color': theme.textColor,
        'xaxis.gridcolor': theme.gridColor,
        'xaxis.color': theme.axisColor,
        'xaxis.linecolor': theme.gridColor,
        'xaxis.zerolinecolor': theme.gridColor,
        'xaxis.tickfont.color': theme.textColor,
        'yaxis.gridcolor': theme.gridColor,
        'yaxis.color': theme.axisColor,
        'yaxis.linecolor': theme.gridColor,
        'yaxis.zerolinecolor': theme.gridColor,
        'yaxis.tickfont.color': theme.textColor,
        'title.font.color': theme.textColor,
        'legend.font.color': theme.textColor
      };

      this.plotlyInstance.relayout(chartId, layoutUpdate);
    },

    getTheme() {
      const isDarkMode = document.documentElement.classList.contains('dark');
      return {
        isDark: isDarkMode,
        bgColor: isDarkMode ? '#1f2937' : '#ffffff',
        textColor: isDarkMode ? '#6b7280' : '#374151', // Much darker gray for dark mode
        gridColor: isDarkMode ? '#374151' : '#d1d5db', // Darker grid in dark mode, lighter in light mode
        axisColor: isDarkMode ? '#4b5563' : '#6b7280', // Darker axis colors
        plotBgColor: 'transparent' // Make plot background transparent to inherit from container
      };
    },

    setupListeners() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.fetchDeviceId(user.uid);
        } else {
          console.log("No user signed in.");
          this.loading = false;
          this.readings = [];
          this.deviceId = null;
        }
      });
    },

    fetchDeviceId(userId) {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`);

      onSnapshot(userProfileRef, (userProfileSnap) => {
        if (userProfileSnap.exists()) {
          const profileData = userProfileSnap.data();
          const fetchedDeviceId = profileData.deviceId;
          if (fetchedDeviceId) {
            this.deviceId = fetchedDeviceId;
            this.fetchRealtimeData();
          } else {
            console.log("No device ID found for this user.");
            this.deviceId = null;
            this.readings = [];
            this.loading = false;
          }
        } else {
          console.log("No user profile found!");
          this.deviceId = null;
          this.readings = [];
          this.loading = false;
        }
      }, (error) => {
        console.error("Error fetching user profile:", error);
        this.loading = false;
      });
    },

    fetchRealtimeData() {
      if (!this.deviceId) {
        this.loading = false;
        return;
      }

      const q = query(
        collection(db, `devices/${this.deviceId}/realtime_readings`),
        orderBy('timestamp', 'desc'),
        limit(this.maxDataPoints)
      );

      let isInitialized = false;

      onSnapshot(q, (querySnapshot) => {
        this.loading = false;

        if (!isInitialized) {
          // Initial load - set up all data and create charts
          this.readings = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
            };
          }).reverse(); // Oldest first

          this.updateLatestValues();
          this.$nextTick(() => {
            this.createAllCharts();
          });
          isInitialized = true;
        } else {
          // Handle real-time updates
          let hasNewData = false;
          
          querySnapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const newReading = {
                id: change.doc.id,
                ...data,
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
              };

              // Check if this is truly new data
              const existingIndex = this.readings.findIndex(r => r.id === newReading.id);
              if (existingIndex === -1) {
                // Add new reading and maintain max points
                this.readings.push(newReading);
                if (this.readings.length > this.maxDataPoints) {
                  this.readings.shift();
                }
                hasNewData = true;
              }
            }
          });

          if (hasNewData) {
            this.updateLatestValues();
            this.updateAllChartsRealtime();
          }
        }
      }, (error) => {
        this.loading = false;
        this.error = "Failed to fetch data: " + error.message;
        console.error("Firestore error:", error);
      });
    },

    updateLatestValues() {
      if (this.readings.length > 0) {
        const latestReading = this.readings[this.readings.length - 1];
        for (const key in this.chartConfigurations) {
          const dataKey = this.chartConfigurations[key].dataKey;
          const value = latestReading[dataKey];
          this.latestValues[key] = value !== undefined && value !== null ? value.toFixed(2) : 'N/A';
        }
      }
    },

    createAllCharts() {
      if (!this.plotlyInstance || this.readings.length === 0) return;

      for (const key in this.chartConfigurations) {
        this.createChart(key);
      }
    },

    createChart(key) {
      const config = this.chartConfigurations[key];
      const theme = this.getTheme();
      
      // Prepare data
      const timestamps = this.readings.map(r => r.timestamp);
      const values = this.readings.map(r => r[config.dataKey] || 0);

      const traces = [{
        x: timestamps,
        y: values,
        type: 'scatter',
        mode: 'lines+markers',
        name: config.title,
        line: {
          color: config.color,
          width: 2,
          shape: 'spline'
        },
        marker: {
          size: 4,
          color: config.color
        },
        connectgaps: true
      }];

      // Add threshold lines if they exist
      if (config.thresholds) {
        config.thresholds.forEach(threshold => {
          traces.push({
            x: timestamps,
            y: Array(timestamps.length).fill(threshold.value),
            type: 'scatter',
            mode: 'lines',
            name: `${threshold.name} (${threshold.value}${config.unit})`,
            line: {
              color: threshold.color,
              width: 2,
              dash: 'dash'
            },
            showlegend: false
          });
        });
      }

      const layout = {
        margin: { l: 30, r: 30, t: 20, b: 30 },
        showlegend: false,
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: theme.textColor, size: 10 },
        xaxis: {
          showticklabels: false,
          showgrid: true,
          gridcolor: theme.gridColor,
          gridwidth: 1,
          color: theme.axisColor,
          linecolor: theme.gridColor,
          zerolinecolor: theme.gridColor
        },
        yaxis: {
          showticklabels: true,
          showgrid: true,
          gridcolor: theme.gridColor,
          gridwidth: 1,
          color: theme.axisColor,
          linecolor: theme.gridColor,
          zerolinecolor: theme.gridColor,
          tickformat: '.1f',
          tickfont: { color: theme.textColor, size: 9 }
        },
        hovermode: 'closest'
      };

      const config_options = {
        displayModeBar: false,
        responsive: true
      };

      // Create the plot
      this.plotlyInstance.newPlot(key + 'Chart', traces, layout, config_options)
        .then(() => {
          console.log(`Chart ${key} created successfully`);
        })
        .catch(error => {
          console.error(`Error creating chart ${key}:`, error);
        });
    },

    updateAllChartsRealtime() {
      if (!this.plotlyInstance) return;

      for (const key in this.chartConfigurations) {
        this.updateChartRealtime(key);
      }

      // Update expanded chart if it exists
      if (this.expandedChart) {
        this.updateExpandedChartRealtime();
      }
    },

    updateChartRealtime(key) {
      const config = this.chartConfigurations[key];
      const timestamps = this.readings.map(r => r.timestamp);
      const values = this.readings.map(r => r[config.dataKey] || 0);

      // Use Plotly's streaming update for smooth real-time updates
      const update = {
        x: [timestamps],
        y: [values]
      };

      // Update threshold lines if they exist
      if (config.thresholds) {
        config.thresholds.forEach((threshold, index) => {
          update.x.push(timestamps);
          update.y.push(Array(timestamps.length).fill(threshold.value));
        });
      }

      this.plotlyInstance.restyle(key + 'Chart', update);
    },

    expandChart(key) {
      this.expandedChart = key;
      this.$nextTick(() => {
        this.createExpandedChart();
      });
    },

    closeExpandedChart() {
      this.expandedChart = null;
      // Clean up the expanded chart
      if (this.plotlyInstance) {
        this.plotlyInstance.purge('expandedChartCanvas');
      }
    },

    createExpandedChart() {
      if (!this.plotlyInstance || !this.expandedChart) return;

      const key = this.expandedChart;
      const config = this.chartConfigurations[key];
      const theme = this.getTheme();
      
      const timestamps = this.readings.map(r => r.timestamp);
      const values = this.readings.map(r => r[config.dataKey] || 0);

      const traces = [{
        x: timestamps,
        y: values,
        type: 'scatter',
        mode: 'lines+markers',
        name: config.title,
        line: {
          color: config.color,
          width: 3,
          shape: 'spline'
        },
        marker: {
          size: 6,
          color: config.color
        }
      }];

      // Add threshold lines
      if (config.thresholds) {
        config.thresholds.forEach(threshold => {
          traces.push({
            x: timestamps,
            y: Array(timestamps.length).fill(threshold.value),
            type: 'scatter',
            mode: 'lines',
            name: `${threshold.name} (${threshold.value}${config.unit})`,
            line: {
              color: threshold.color,
              width: 2,
              dash: 'dash'
            }
          });
        });
      }

      const layout = {
        title: {
          text: `${config.title} Real-time Monitoring`,
          font: { color: theme.textColor, size: 18 }
        },
        margin: { l: 60, r: 60, t: 80, b: 60 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        modebar: { bgcolor: theme.bgColor },
        font: { color: theme.textColor },
        xaxis: {
          title: 'Time',
          showgrid: true,
          gridcolor: theme.gridColor,
          color: theme.axisColor,
          linecolor: theme.gridColor,
          zerolinecolor: theme.gridColor,
          tickfont: { color: theme.textColor }
        },
        yaxis: {
          title: `${config.title} (${config.unit})`,
          showgrid: true,
          gridcolor: theme.gridColor,
          color: theme.axisColor,
          linecolor: theme.gridColor,
          zerolinecolor: theme.gridColor,
          tickfont: { color: theme.textColor }
        },
        legend: {
          orientation: 'h',
          y: -0.2,
          font: { color: theme.textColor }
        }
      };

      const config_options = {
        displayModeBar: true,
        responsive: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d']
      };

      this.plotlyInstance.newPlot('expandedChartCanvas', traces, layout, config_options);
    },

    updateExpandedChartRealtime() {
      if (!this.plotlyInstance || !this.expandedChart) return;

      const key = this.expandedChart;
      const config = this.chartConfigurations[key];
      const timestamps = this.readings.map(r => r.timestamp);
      const values = this.readings.map(r => r[config.dataKey] || 0);

      const update = {
        x: [timestamps],
        y: [values]
      };

      if (config.thresholds) {
        config.thresholds.forEach((threshold) => {
          update.x.push(timestamps);
          update.y.push(Array(timestamps.length).fill(threshold.value));
        });
      }

      this.plotlyInstance.restyle('expandedChartCanvas', update);
    },

    handleSetDeviceId() {
      console.log('Navigating to Set Device ID page...');
    }
  },

  beforeUnmount() {
    // Disconnect theme observer
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }

    // Clean up all Plotly charts
    if (this.plotlyInstance) {
      for (const key in this.chartConfigurations) {
        try {
          this.plotlyInstance.purge(key + 'Chart');
        } catch (e) {
          // Chart might not exist
        }
      }
      if (this.expandedChart) {
        try {
          this.plotlyInstance.purge('expandedChartCanvas');
        } catch (e) {
          // Chart might not exist
        }
      }
    }
  }
};
</script>
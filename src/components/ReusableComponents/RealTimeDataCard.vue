<template>
  <div class="p-5 lg:p-10 bg-transparent dark:bg-transparent relative">
    
    <!-- Stale Data Warning Overlay/Banner -->
    <transition name="fade">
      <div v-if="isStale" class="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="p-2 bg-amber-100 dark:bg-amber-800 rounded-full text-amber-600 dark:text-amber-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-amber-800 dark:text-amber-100">Data Stream Interrupted</h3>
            <p class="text-xs text-amber-700 dark:text-amber-200 mt-1">
              Last update was {{ minutesSince }} minutes ago. Real-time charts are paused.
            </p>
            <p class="text-xs text-amber-600 dark:text-amber-300 mt-2 italic">
              "It seems like I'm not receiving new data. Please check your internet connection or the smart meter device."
            </p>
          </div>
        </div>
        
        <div class="flex gap-3">
           <button 
            @click="openKobeExplanation"
            class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
               <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Explain
          </button>
          
          <button 
            @click="reportIssue"
            class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            Report Issue
          </button>
        </div>
      </div>
    </transition>

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

        <!-- Gray out values if stale -->
        <p 
          class="text-4xl font-bold mb-4 transition-colors duration-300"
          :class="isStale ? 'text-gray-400 dark:text-gray-600' : 'text-green-600 dark:text-green-400'"
        >
          {{ latestValues[key] || 'N/A' }} 
          <span class="text-xl font-normal text-gray-500 dark:text-gray-400">{{ chartData.unit }}</span>
        </p>

        <div class="flex-grow min-h-[200px] bg-white dark:bg-gray-900 rounded-lg relative">
           <!-- Overlay for stale chart -->
           <div v-if="isStale" class="absolute inset-0 z-10 bg-white/50 dark:bg-black/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
              <span class="text-xs font-bold text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700">Paused</span>
           </div>
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
        <div class="p-6 flex-grow relative">
           <div v-if="isStale" class="absolute inset-0 z-10 bg-white/50 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
              <p class="text-lg font-bold text-gray-500 bg-white dark:bg-gray-800 px-4 py-2 rounded shadow-lg">Data Stream Paused</p>
           </div>
          <div id="expandedChartCanvas" class="w-full h-full"></div>
        </div>
      </div>
    </div>
    
    <!-- KOBE EXPLANATION MODAL (Simple) -->
    <div v-if="showKobeModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
       <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
          <button @click="showKobeModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
          
          <!-- Loading State for Audio -->
          <div v-if="kobeLoading" class="flex flex-col items-center justify-center py-8">
             <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
             </div>
             <p class="text-sm text-blue-500 font-medium animate-pulse">Kobe is analyzing...</p>
          </div>

          <div v-else class="flex gap-4">
             <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
             </div>
             <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Kobe's Diagnosis</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                   I've noticed we haven't received data from your smart meter for over <strong>{{ minutesSince }} minutes</strong>.
                </p>
                <ul class="text-sm text-gray-600 dark:text-gray-300 list-disc ml-4 mt-3 space-y-1">
                   <li>Check if your Wi-Fi is working.</li>
                   <li>Ensure the device is plugged in and powered on.</li>
                   <li>If it's still offline, you can report it to us.</li>
                </ul>
             </div>
          </div>
          <div v-if="!kobeLoading" class="mt-6 flex justify-end">
             <button @click="showKobeModal = false" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Understood
             </button>
          </div>
       </div>
    </div>

  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { auth, db, doc, onAuthStateChanged, collection, onSnapshot, query, orderBy, limit } from '../../firebase';
import { Timestamp } from 'firebase/firestore';
import { useSystemHealth } from '@/composables/useSystemHealth.js';
import { useAgent } from '@/composables/useAgent.js';
import api from '@/services/api.js';
import {
  BoltIcon,
  ArrowsRightLeftIcon,
  SunIcon,
  FireIcon,
  CircleStackIcon
} from '@heroicons/vue/24/outline'

// Load Plotly.js (Keep existing loading logic)
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
  setup() {
      // --- Integration of System Health Composable ---
      const lastReadingTime = ref(null);
      
      // Use 2 minutes threshold for "real-time" feeling
      const { isStale, minutesSince } = useSystemHealth(lastReadingTime, 2);
      const showKobeModal = ref(false);
      const kobeLoading = ref(false);
      const kobeAudio = ref(null);
      
      const { triggerAgent } = useAgent();

      return {
          lastReadingTime,
          isStale,
          minutesSince,
          showKobeModal,
          kobeLoading,
          kobeAudio,
          triggerAgent
      };
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
      maxDataPoints: 50, 
      plotlyInstance: null,
      themeObserver: null,
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
      this.setupThemeObserver(); 
      this.setupListeners();
    } catch (error) {
      console.error('Failed to load Plotly:', error);
      this.error = "Error loading charts. Please try again.";
      this.loading = false;
    }
  },

  methods: {
    async openKobeExplanation() {
        if (this.kobeAudio) {
            this.kobeAudio.pause();
            this.kobeAudio = null;
        }

        const message = `I've noticed we haven't received data from your smart meter for over ${this.minutesSince} minutes. Check if your Wi-Fi is working or ensure the device is plugged in.`;
        
        this.kobeLoading = true;
        // Show modal immediately to show loading state
        this.showKobeModal = true;

        try {
            const response = await api.post('/api/kobe/tts', { text: message }, {
                responseType: 'blob'
            });
            const audioUrl = URL.createObjectURL(response.data);
            this.kobeAudio = new Audio(audioUrl);
            this.kobeAudio.play();
        } catch (e) {
            console.error("Kobe TTS failed:", e);
        } finally {
            this.kobeLoading = false;
        }
    },
    
    reportIssue() {
        const context = `I am reporting an issue. My device (${this.deviceId}) has stopped sending data for ${this.minutesSince} minutes. Can you help me file a report?`;
        this.triggerAgent(context);
    },

    setupThemeObserver() {
      this.themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            this.$nextTick(() => {
              this.updateAllChartThemes();
            });
          }
        });
      });

      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    },

    updateAllChartThemes() {
      if (!this.plotlyInstance) return;

      const theme = this.getTheme();

      for (const key in this.chartConfigurations) {
        const element = document.getElementById(key + 'Chart');
        if (element && element.data) {
          this.updateChartTheme(key + 'Chart', theme);
        }
      }

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
        textColor: isDarkMode ? '#6b7280' : '#374151',
        gridColor: isDarkMode ? '#374151' : '#d1d5db',
        axisColor: isDarkMode ? '#4b5563' : '#6b7280',
        plotBgColor: 'transparent' 
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
          this.readings = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
            };
          }).reverse(); 

          this.updateLatestValues();
          this.$nextTick(() => {
            this.createAllCharts();
          });
          isInitialized = true;
        } else {
          let hasNewData = false;
          
          querySnapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const newReading = {
                id: change.doc.id,
                ...data,
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
              };

              const existingIndex = this.readings.findIndex(r => r.id === newReading.id);
              if (existingIndex === -1) {
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
        
        // 🟢 SYSTEM HEALTH UPDATE: Track last timestamp
        if (latestReading.timestamp) {
            this.lastReadingTime = latestReading.timestamp; 
        }

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

  watch: {
    deviceId(newId, oldId) {
      if (newId && newId !== oldId) {
        this.fetchRealtimeData();
      }
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
    
    // Stop audio
    if (this.kobeAudio) {
        this.kobeAudio.pause();
    }
  }
};
</script>
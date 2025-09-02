<template>
  <div class="p-5 lg:p-10 bg-gray-50 dark:bg-gray-900">
    <div v-if="loading" class="text-center text-gray-500 my-8">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto mb-4"></div>
      <p class="text-lg">Loading real-time data...</p>
    </div>

    <div v-else-if="deviceId" class="grid sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4">

      <!-- Graph Cards -->
      <div v-for="(chartData, key) in chartConfigurations" :key="key"
        class="p-6 bg-white shadow-lg rounded-xl dark:bg-gray-800  flex flex-col relative">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center space-x-3">
            <!-- Icon for each card -->
            <span v-html="chartData.icon" class="text-green-500 text-3xl"></span>
            <div>
              <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-300">{{ chartData.title }}</h3>
              <!-- Display Device ID on each card -->
              <p class="text-sm text-gray-500 truncate w-full">{{ deviceId }}</p>
            </div>
          </div>
          <button @click="expandChart(key)"
            class="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>

        <!-- Real-time Value -->
        <p class="text-4xl font-bold text-green-600 mb-4">{{ latestValues[key] || 'N/A' }} <span
            class="text-xl font-normal text-gray-500">{{ chartData.unit }}</span></p>

        <div class="flex-grow">
          <canvas :id="key + 'Chart'"></canvas>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 space-y-4 my-8">
      <p class="text-lg font-semibold text-gray-800">No device linked yet.</p>
      <p>Please enter your device ID to start seeing real-time data.</p>
      <button @click="handleSetDeviceId"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
        Set Device ID
      </button>
    </div>

    <!-- Full-screen Modal -->
    <div v-if="expandedChart" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4"
      @click.self="closeExpandedChart">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-5xl flex flex-col">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-2xl font-bold text-gray-800">{{ chartConfigurations[expandedChart].title }}</h3>
          <button @click="closeExpandedChart"
            class="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 flex-grow flex items-center justify-center">
          <canvas id="expandedChartCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db, doc, onAuthStateChanged, collection, onSnapshot, query, orderBy, limit } from '../../firebase';
import { Timestamp } from 'firebase/firestore';


// A promise to ensure Chart.js is loaded
const chartJsPromise = new Promise((resolve, reject) => {
  const chartJsScript = document.createElement('script');
  chartJsScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
  chartJsScript.onload = () => resolve();
  chartJsScript.onerror = () => reject(new Error('Failed to load Chart.js'));
  document.head.appendChild(chartJsScript);
});

export default {
  name: 'EnergreenDashboard',
  data() {
    return {
      deviceId: null,
      readings: [],
      latestValues: {},
      loading: true,
      error: null,
      charts: {},
      expandedChart: null,
      chartConfigurations: {
        voltage: { title: 'Voltage', unit: 'V', dataKey: 'voltageVolt', color: '#34D399', icon: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>' },
        current: { title: 'Current', unit: 'A', dataKey: 'currentAmp', color: '#60A5FA', icon: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>' },
        power: { title: 'Power', unit: 'W', dataKey: 'powerWatt', color: '#F87171', icon: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>' },
        energyConsumed: { title: 'Energy Consumed', unit: 'kWh', dataKey: 'kwhConsumed', color: '#A78BFA', icon: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="2 8 22 8"></polyline><line x1="12" y1="4" x2="12" y2="20"></line><line x1="6" y1="16" x2="6" y2="16"></line><line x1="18" y1="16" x2="18" y2="16"></line></svg>' },
        powerFactor: { title: 'Power Factor', unit: '', dataKey: 'powerFactor', color: '#9CA3AF', icon: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v6h-2z"></path></svg>' },
      },
    };
  },
  mounted() {
    chartJsPromise.then(() => {
      this.setupListeners();
    }).catch(error => {
      console.error(error);
      this.error = "Error loading charts. Please try again.";
      this.loading = false;
    });
  },
  methods: {
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
        limit(30)
      );

      onSnapshot(q, (querySnapshot) => {
        this.loading = false;
        this.readings = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
          };
        }).reverse();
        this.updateLatestValues();

        this.$nextTick(() => {
          this.updateOrCreateCharts();
        });
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
          this.latestValues[key] = latestReading[dataKey]?.toFixed(2) || 'N/A';
        }
      }
    },
    updateOrCreateCharts() {
      if (Object.keys(this.charts).length === 0) {
        this.createCharts();
      } else {
        this.updateCharts();
      }
    },
    createCharts() {
      const labels = this.readings.map(r => r.timestamp.toLocaleTimeString());

      for (const key in this.chartConfigurations) {
        const config = this.chartConfigurations[key];
        const ctx = document.getElementById(key + 'Chart')?.getContext('2d');
        if (ctx) {
          const datasets = [{
            data: this.readings.map(r => r[config.dataKey]),
            borderColor: config.color,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            fill: false
          }];

          // Add a line for the target voltage and thresholds
          if (key === 'voltage') {
            datasets.push({
              data: Array(labels.length).fill(230),
              borderColor: '#facc15', // Yellow
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              label: 'Target (230V)'
            });
            datasets.push({
              data: Array(labels.length).fill(253),
              borderColor: '#dc2626', // Red
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              label: 'Upper Threshold (253V)'
            });
            datasets.push({
              data: Array(labels.length).fill(207),
              borderColor: '#dc2626', // Red
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              label: 'Lower Threshold (207V)'
            });
          }

          // Add a threshold line for Power Factor
          if (key === 'powerFactor') {
            datasets.push({
              data: Array(labels.length).fill(0.9),
              borderColor: '#dc2626', // Red
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              label: 'Threshold (0.9)'
            });
          }

          this.charts[key] = new Chart(ctx, {
            type: 'line',
            data: {
              labels: labels,
              datasets: datasets,
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { display: false },
                y: {
                  beginAtZero: true,
                  ticks: { color: '#6B7280' },
                  grid: { color: '#E5E7EB' }
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                }
              }
            }
          });
        }
      }
    },
    updateCharts() {
      const labels = this.readings.map(r => r.timestamp.toLocaleTimeString());
      for (const key in this.charts) {
        const chart = this.charts[key];
        const config = this.chartConfigurations[key];
        if (chart) {
          chart.data.labels = labels;
          chart.data.datasets[0].data = this.readings.map(r => r[config.dataKey]);

          if (key === 'voltage') {
            chart.data.datasets[1].data = Array(labels.length).fill(230);
            chart.data.datasets[2].data = Array(labels.length).fill(253);
            chart.data.datasets[3].data = Array(labels.length).fill(207);
          }

          if (key === 'powerFactor') {
            chart.data.datasets[1].data = Array(labels.length).fill(0.9);
          }

          chart.update();
        }
      }
    },
    expandChart(key) {
      this.expandedChart = key;
      this.$nextTick(() => {
        this.createExpandedChart();
      });
    },
    closeExpandedChart() {
      this.expandedChart = null;
    },
    createExpandedChart() {
      const key = this.expandedChart;
      if (!key) return;

      const config = this.chartConfigurations[key];
      const labels = this.readings.map(r => r.timestamp.toLocaleTimeString());
      const ctx = document.getElementById('expandedChartCanvas')?.getContext('2d');

      if (ctx) {
        if (this.charts.expanded) {
          this.charts.expanded.destroy();
        }

        const datasets = [{
          label: config.title,
          data: this.readings.map(r => r[config.dataKey]),
          borderColor: config.color,
          borderWidth: 2,
          tension: 0.4,
          fill: false
        }];

        if (key === 'voltage') {
          datasets.push({
            data: Array(labels.length).fill(230),
            borderColor: '#facc15', // Yellow
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            label: 'Target (230V)'
          });
          datasets.push({
            data: Array(labels.length).fill(253),
            borderColor: '#dc2626', // Red
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            label: 'Upper Threshold (253V)'
          });
          datasets.push({
            data: Array(labels.length).fill(207),
            borderColor: '#dc2626', // Red
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            label: 'Lower Threshold (207V)'
          });
        }

        if (key === 'powerFactor') {
          datasets.push({
            data: Array(labels.length).fill(0.9),
            borderColor: '#dc2626', // Red
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            label: 'Threshold (0.9)'
          });
        }

        this.charts.expanded = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: { display: true, text: 'Time' },
                ticks: { color: '#6B7280' },
                grid: { color: '#E5E7EB' }
              },
              y: {
                title: { display: true, text: config.title + ' (' + config.unit + ')' },
                beginAtZero: true,
                ticks: { color: '#6B7280' },
                grid: { color: '#E5E7EB' }
              }
            },
            plugins: {
              legend: { display: true },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
              }
            }
          }
        });
      }
    },
    handleSetDeviceId() {
      console.log('Navigating to Set Device ID page...');
    }
  },
};
</script>

<style scoped>
/* Scoped styles can be added here if needed, but Tailwind CSS is used for all styling */
</style>

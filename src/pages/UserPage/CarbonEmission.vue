<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">

    <UserHeader />
    <div class="flex flex-col items-center justify-between sm:flex-row">
      <Heading title="Carbon Emission" subtitle="Monitor your carbon emission and find ways to reduce them." />
    </div>

    <div v-if="loading" class="text-center p-10">Loading Emission Data...</div>
    <div v-if="error" class="text-center p-10 text-red-500">Error: {{ error }}</div>

    <!-- Integrated CO₂ Emissions Metrics Card -->
    <div v-if="!loading && !error" class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        <div 
          v-for="(metric, index) in dynamicMetrics" 
          :key="index"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div class="flex items-start justify-between mb-4 ">
            <h3 class="text-base font-medium text-gray-600 dark:text-gray-300">{{ metric.title }}</h3>
            <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <svg 
                v-if="metric.title === 'Current CO₂ Emissions (Today)'" 
                class="w-5 h-5 text-green-600 dark:text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <svg 
                v-else-if="metric.title === 'Trees Equivalent (Monthly)'" 
                class="w-5 h-5 text-green-600 dark:text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2c-1.2 0-2.4.4-3.3 1.2-.9.8-1.5 1.9-1.7 3.1-.2 1.2 0 2.4.6 3.4.6 1 1.5 1.8 2.6 2.2 1.1.4 2.3.4 3.4 0 1.1-.4 2-1.2 2.6-2.2.6-1 .8-2.2.6-3.4-.2-1.2-.8-2.3-1.7-3.1C14.4 2.4 13.2 2 12 2zM8 12c-1.5 0-2.9.6-4 1.6-1.1 1-1.8 2.4-2 3.8-.2 1.5.1 2.9.8 4.2.7 1.3 1.8 2.3 3.2 2.9 1.4.6 2.9.7 4.4.3 1.5-.4 2.8-1.3 3.6-2.6.8-1.3 1.1-2.8.8-4.3-.3-1.5-1.1-2.8-2.2-3.8-1.1-1-2.5-1.6-4-1.6z"/>
              </svg>
              <svg 
                v-else-if="metric.title === 'Monthly Total'" 
                class="w-5 h-5 text-green-600 dark:text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ metric.cost }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-300 mt-1">{{ metric.definition }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <EmissionDashboard :emissionSources="sources" :tips="smartTips" />

    <ReusableBarChart
    v-if="!loading && !error"
    title="Carbon Emission"
    :activePeriod="activePeriod"
    @update:activePeriod="activePeriod = $event"
    
    :periods="['Daily', 'Weekly', 'Monthly', 'Yearly']"
    
    :dailyData="hourlyChartData" 
    
    :weeklyData="weeklyChartData"
    :monthlyData="monthlyChartData"
    :yearlyData="yearlyChartData"
    xAxisLabel="Time"
    tooltipUnit="kg CO₂"
  />
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useAuth } from "@/composables/useAuth"; 

// Import all service functions
import * as carbonService from "@/services/carbonService.js";

// Reusable Components
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import EmissionDashboard from "@/components/ReusableComponents/EmissionCard.vue";
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue"; 

// --- AUTH & DEVICE STATE ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const { userProfile, isLoading: authLoading } = useAuth(appId);
const deviceId = ref(null); 

// --- LOCAL COMPONENT STATE ---
const loading = ref(true);
const error = ref(null);
const activePeriod = ref("Daily");

// --- DATA REFS ---
const dynamicMetrics = ref([]);
const hourlyChartData = ref([]); 
const weeklyChartData = ref([]);
const monthlyChartData = ref([]);
const yearlyChartData = ref([]);

// --- STATIC DATA (can be moved to a service if it becomes dynamic) ---
const sources = [
  { id: 1, name: 'Air Conditioning', percentage: 40 },
  { id: 2, name: 'Lighting', percentage: 30 },
  { id: 3, name: 'Computers', percentage: 30 }
];
const smartTips = computed(() => {
  // This logic could also be moved to the service layer if it becomes more complex
  if (dynamicMetrics.value.length === 0) return [{ id: 1, title: 'No Data', description: 'Waiting for energy data to generate tips.' }];
  return [{ id: 1, title: 'Reduce Phantom Load', description: 'Your lowest consumption is still high. Unplug devices when not in use.' }];
});

// --- DATA FETCHING & PROCESSING ---
let hourlyUnsubscribe = null;

const fetchAllData = async (id) => {
  if (!id) {
    error.value = "No Device ID found. Cannot fetch data.";
    loading.value = false;
    return;
  }
  
  loading.value = true;
  error.value = null;

  try {
    const [carbonRate, summaries] = await Promise.all([
      carbonService.getCarbonRate(),
      carbonService.getDailySummaries(id)
    ]);
    
    // Process historical data
    const chartData = carbonService.processCo2SummariesForCharts(summaries, carbonRate);
    weeklyChartData.value = chartData.weeklyChartData;
    monthlyChartData.value = chartData.monthlyChartData;
    yearlyChartData.value = chartData.yearlyChartData;

    // Calculate metrics
    dynamicMetrics.value = carbonService.calculateDynamicMetrics(summaries, carbonRate);

    // Set up listener for today's hourly data
    if (hourlyUnsubscribe) hourlyUnsubscribe();
    hourlyUnsubscribe = carbonService.listenToHourlyReadings(id, ({ data, error: listenerError }) => {
      if (listenerError) {
        error.value = listenerError;
        return;
      }
      hourlyChartData.value = carbonService.processReadingsForHourlyChart(data, carbonRate);
    });

  } catch (err) {
    console.error("Error fetching carbon emission data:", err);
    error.value = "Failed to load all emission data.";
  } finally {
    loading.value = false;
  }
};


// --- LIFECYCLE HOOKS ---
watch(userProfile, (newProfile) => {
  const newDeviceId = newProfile?.deviceId || null;
  if (newDeviceId !== deviceId.value) {
    deviceId.value = newDeviceId;
    if (newDeviceId) {
      fetchAllData(newDeviceId);
    } else {
      // Clear all data if user has no device
      loading.value = false;
      error.value = "No Smart Meter linked to your account.";
      dynamicMetrics.value = [];
      hourlyChartData.value = [];
      weeklyChartData.value = [];
      monthlyChartData.value = [];
      yearlyChartData.value = [];
    }
  }
}, { immediate: true });

onUnmounted(() => {
  if (hourlyUnsubscribe) {
    hourlyUnsubscribe();
  }
});
</script>
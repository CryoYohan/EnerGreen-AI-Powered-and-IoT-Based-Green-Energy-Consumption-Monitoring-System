<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">

    <UserHeader />
    <div class="flex flex-col items-center justify-between sm:flex-row">
      <Heading title="Carbon Emission" subtitle="Monitor your carbon emission and find ways to reduce them." />
    </div>

    <div v-if="loading" class="text-center p-10">Loading Emission Data...</div>
    <div v-if="error" class="text-center p-10 text-red-500">Error: {{ error }}</div>

    <div v-if="!loading && !error" class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        <div 
          v-for="(metric, index) in dynamicMetrics" 
          :key="index"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
             <div class="flex items-start justify-between mb-4 ">
               <h3 class="text-base font-medium text-gray-600 dark:text-gray-300">{{ metric.title }}</h3>
               </div>
             <div>
                <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ metric.cost }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-300 mt-1">{{ metric.definition }}</p>
             </div>
        </div>
      </div>
    </div>
    
    <EmissionDashboard :emissionSources="sources" :tips="smartTips" />

    <div v-if="!loading && !error" class="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        
        <div class="flex justify-end mb-4">
             </div>

        <div v-if="isCarbonFree" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 text-center border border-green-100 dark:border-green-900">
             <div class="mb-6 relative inline-block">
                 <div class="absolute inset-0 bg-green-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-green-500 relative z-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
             </div>
             <h2 class="text-3xl font-extrabold text-green-600 dark:text-green-400 mb-2">100% Carbon Free!</h2>
             <p class="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto">
                {{ activePeriod }} period shows <b>0 kg CO₂</b> emissions. You are running purely on clean energy! 🌱
             </p>
             <button @click="activePeriod = 'Monthly'" v-if="activePeriod === 'Daily'" class="mt-6 text-sm text-green-600 hover:underline">
                Check Monthly View
             </button>
        </div>

        <ReusableBarChart
            v-else
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
    </div>
    
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

// --- STATIC DATA ---
const sources = [
  { id: 1, name: 'Air Conditioning', percentage: 40 },
  { id: 2, name: 'Lighting', percentage: 30 },
  { id: 3, name: 'Computers', percentage: 30 }
];
const smartTips = computed(() => {
  if (dynamicMetrics.value.length === 0) return [{ id: 1, title: 'No Data', description: 'Waiting for energy data to generate tips.' }];
  return [{ id: 1, title: 'Reduce Phantom Load', description: 'Your lowest consumption is still high. Unplug devices when not in use.' }];
});

// --- UPDATED CARBON FREE LOGIC ---
const isCarbonFree = computed(() => {
    let currentData = [];
    if (activePeriod.value === 'Daily') currentData = hourlyChartData.value;
    else if (activePeriod.value === 'Weekly') currentData = weeklyChartData.value;
    else if (activePeriod.value === 'Monthly') currentData = monthlyChartData.value;
    else if (activePeriod.value === 'Yearly') currentData = yearlyChartData.value;

    if (!currentData || currentData.length === 0) return true;
    
    // Sum up ONLY Grid Emissions (Actual Emissions)
    const gridEmissions = currentData
        .filter(item => item.source === 'Grid' || !item.source) // Assume Grid if source undefined
        .reduce((acc, item) => acc + (item.value || 0), 0);
    
    return gridEmissions <= 0;
});

// --- HELPER: Process Hourly Data Locally for Solar/Grid logic ---
const processHourlyDataWithSource = (readings, carbonRate) => {
    // Group by hour
    const grouped = {};
    
    readings.forEach(r => {
        const date = new Date(r.timestamp?.seconds * 1000 || r.timestamp);
        const hour = date.getHours();
        const label = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        
        if (!grouped[hour]) {
            grouped[hour] = { label, kwh: 0, source: r.energySource || 'Grid' };
        }
        
        // Sum kWh
        grouped[hour].kwh += (r.kwhDelta || 0);
        
        // If ANY record in this hour is Grid, we treat the hour as Grid (conservative approach)
        // Or if your data is perfectly clean, this overwrites correctly.
        if (r.energySource === 'Grid') {
            grouped[hour].source = 'Grid';
        }
    });

    return Object.values(grouped).map(item => {
        const co2 = item.kwh * carbonRate;
        const isSolar = item.source === 'Solar';
        
        return {
            label: item.label,
            value: parseFloat(co2.toFixed(3)),
            source: item.source, 
            // COLOR LOGIC: Green for Solar (Prevented), Red/Gray for Grid (Emission)
            color: isSolar ? '#10B981' : '#EF4444' 
        };
    }).sort((a, b) => {
        // Simple sort by time label parsing or index if available
        // For simplicity, relying on reading order or adding an index field is better
        return 0; 
    });
};

// --- DATA FETCHING ---
let hourlyUnsubscribe = null;

const fetchAllData = async (id) => {
  if (!id) {
    error.value = "No Device ID found.";
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
    
    const chartData = carbonService.processCo2SummariesForCharts(summaries, carbonRate);
    weeklyChartData.value = chartData.weeklyChartData;
    monthlyChartData.value = chartData.monthlyChartData;
    yearlyChartData.value = chartData.yearlyChartData;

    dynamicMetrics.value = carbonService.calculateDynamicMetrics(summaries, carbonRate);

    if (hourlyUnsubscribe) hourlyUnsubscribe();
    
    hourlyUnsubscribe = carbonService.listenToHourlyReadings(id, ({ data, error: listenerError }) => {
      if (listenerError) {
        error.value = listenerError;
        return;
      }
      
      // USE LOCAL PROCESSING to handle Solar vs Grid colors
      // We pass the raw 'data' (readings) to our local helper
      hourlyChartData.value = processHourlyDataWithSource(data, carbonRate);
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
      loading.value = false;
      error.value = "No Smart Meter linked.";
      // ... clear refs
    }
  }
}, { immediate: true });

onUnmounted(() => {
  if (hourlyUnsubscribe) hourlyUnsubscribe();
});
</script>
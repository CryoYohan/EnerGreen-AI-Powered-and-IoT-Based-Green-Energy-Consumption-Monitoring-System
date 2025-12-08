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
               <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ metric.title }}</h3>
               <div class="p-2 rounded-lg" :class="metric.bgClass">
                 <component :is="metric.icon" class="w-6 h-6" :class="metric.textClass" />
               </div>
             </div>
             <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ metric.cost }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ metric.definition }}</p>
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
import { GlobeAmericasIcon, SparklesIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline';

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

// --- DYNAMIC SOURCES DATA ---
const sources = computed(() => {
    // Since we don't have individual appliance tracking yet, we show a single source
    // representing the total energy consumption for the day/period.
    return [
        { id: 1, name: 'Total Energy Consumption', percentage: 100 }
    ];
});
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

    if (!currentData || currentData.length === 0) return false;
    
    // Sum up ONLY Grid Emissions (Actual Emissions)
    const gridEmissions = currentData
        .filter(item => item.source === 'Grid' || !item.source) // Assume Grid if source undefined
        .reduce((acc, item) => acc + (item.value || 0), 0);
    
    // Strict check: strictly 0 or negligible floating point error
    return gridEmissions < 0.0001;
});

// --- HELPER: Process Hourly Data Locally for Solar/Grid logic ---
const processHourlyDataWithSource = (readings, carbonRate) => {
    // 1. Separate readings by source to calculate deltas correctly
    const readingsBySource = { 'Grid': [], 'Solar': [] };
    
    readings.forEach(r => {
        const source = r.energySource || 'Grid';
        if (!readingsBySource[source]) readingsBySource[source] = [];
        readingsBySource[source].push(r);
    });

    const grouped = {};

    // 2. Process each source independently
    Object.keys(readingsBySource).forEach(source => {
        const sourceReadings = readingsBySource[source];
        // Ensure sorted by timestamp (though likely already sorted from query)
        sourceReadings.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));

        for (let i = 1; i < sourceReadings.length; i++) {
            const prev = sourceReadings[i - 1];
            const curr = sourceReadings[i];
            
            // Calculate Delta
            const delta = (curr.kwhConsumed || 0) - (prev.kwhConsumed || 0);

            // Filter out invalid/negative deltas or massive outliers if necessary
            if (delta > 0) {
                const date = new Date(curr.timestamp?.seconds * 1000 || curr.timestamp);
                const hour = date.getHours();
                const label = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

                if (!grouped[hour]) {
                    // Initialize if not exists. Default source for the group is the first one found, 
                    // but we handle mixed sources below.
                    grouped[hour] = { label, kwh: 0, source: source, hasGrid: false };
                }

                grouped[hour].kwh += delta;
                
                // Track if this hour has any Grid usage (for color logic)
                if (source === 'Grid') {
                    grouped[hour].hasGrid = true;
                    grouped[hour].source = 'Grid'; // Force source to Grid if mixed
                }
            }
        }
    });

    return Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map(hourKey => {
        const item = grouped[hourKey];
        const co2 = item.kwh * carbonRate;
        // If hour has ANY Grid usage, treat as Grid (Red). Else Solar (Green).
        const isSolar = !item.hasGrid && item.source === 'Solar';
        
        return {
            label: item.label,
            value: parseFloat(co2.toFixed(4)), // Higher precision
            source: isSolar ? 'Solar' : 'Grid',
            color: isSolar ? '#10B981' : '#F43F5E' 
        };
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
    
    // Apply the "Grid" color (#F43F5E) to all historical bars for consistency
    const applyColor = (data) => data.map(item => ({ ...item, color: '#F43F5E' }));

    weeklyChartData.value = applyColor(chartData.weeklyChartData);
    monthlyChartData.value = applyColor(chartData.monthlyChartData);
    yearlyChartData.value = applyColor(chartData.yearlyChartData);

    const rawMetrics = carbonService.calculateDynamicMetrics(summaries, carbonRate);
    dynamicMetrics.value = [
      { 
        ...rawMetrics[0], 
        icon: GlobeAmericasIcon, 
        bgClass: 'bg-red-100 dark:bg-red-900/30', 
        textClass: 'text-red-600 dark:text-red-400' 
      },
      { 
        ...rawMetrics[1], 
        icon: SparklesIcon, 
        bgClass: 'bg-green-100 dark:bg-green-900/30', 
        textClass: 'text-green-600 dark:text-green-400' 
      },
      { 
        ...rawMetrics[2], 
        icon: CalendarDaysIcon, 
        bgClass: 'bg-blue-100 dark:bg-blue-900/30', 
        textClass: 'text-blue-600 dark:text-blue-400' 
      }
    ];

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
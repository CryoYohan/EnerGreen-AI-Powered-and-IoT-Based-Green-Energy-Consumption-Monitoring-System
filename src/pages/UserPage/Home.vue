<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
    <UserHeader />
    <Heading :title="`Welcome Back, ${userName}!`" subtitle="Here's your energy consumption overview"/>

    <!-- Integrated Metrics Card -->
    <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div 
          v-for="(metric, index) in dailyMetrics" 
          :key="index"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ metric.title }}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ metric.cost }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ metric.definition }}</p>
            </div>
            <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div 
                v-if="metric.title === 'Current Cost' || metric.title === 'Today\'s Estimated Cost'" 
                class="w-6 h-6 flex items-center justify-center"
              >
                <span class="text-2xl font-bold text-green-600 dark:text-green-400">₱</span>
              </div>
              <svg 
                v-else-if="metric.title === 'Grid Consumption'" 
                class="w-6 h-6 text-blue-600 dark:text-blue-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <svg 
                v-else-if="metric.title === 'Solar Consumption'" 
                class="w-6 h-6 text-yellow-600 dark:text-yellow-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <svg 
                v-else-if="metric.title === 'CO₂ Saved'" 
                class="w-6 h-6 text-green-600 dark:text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Dashboard />

    <CombineCharts
      chartTitle="Electricity Usage"
      :activePeriod="activePeriod"
      @update:activePeriod="activePeriod = $event"
      @refresh="fetchDailySummaries"
      :periods="['Daily', 'Weekly', 'Monthly', 'Yearly']"
      :dailyData="dailyData"
      :weeklyData="weeklyData"
      :monthlyData="monthlyData"
      :yearlyData="yearlyData"
      :dailyCostData="dailyCostData"
      :weeklyCostData="weeklyCostData"
      :monthlyCostData="monthlyCostData"
      :yearlyCostData="yearlyCostData"
      :dailySavingsData="dailySavingsData"
      :weeklySavingsData="weeklySavingsData"
      :monthlySavingsData="monthlySavingsData"
      :yearlySavingsData="yearlySavingsData"
      xAxisLabel="Time"
      tooltipUnit="kWh"
    />
    
    <SourcesChart 
      :grid-kwh="gridKwh" 
      :solar-kwh="solarKwh" 
      :top-consumers="topConsumers" 
      :loading-consumers="loadingConsumers" 
      :pesoFormatter="pesoFormatter"
      :estimatedSavings="estimatedSavings"
    />
    <Footer />
    
    <div v-if="showOnboarding" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 class="text-xl font-semibold mb-4 text-green-600">Welcome, {{ userFirstName }}!</h2>
        <p class="text-gray-700 dark:text-gray-200 mb-4">This dashboard helps you track your energy usage and savings. Explore each section
          to get insights on your consumption.</p>
        <button @click="showOnboarding = false"
          class="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Got it!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useAuth } from "@/composables/useAuth"; 
import * as dashboardService from '@/services/dashboardService.js';
import { db, doc, onSnapshot, collection, query, getDocs, orderBy, limit } from "../../firebase.js"; 

// Import your components
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import SourcesChart from "@/components/UserComponents/Home/SourcesChart.vue";
import CombineCharts from "@/components/UserComponents/Home/CombineCharts.vue";
import Dashboard from "@/components/ReusableComponents/RealTimeDataCard.vue";

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const { user, userProfile, isLoading: authLoading } = useAuth(appId);

// --- Local Component State ---
const userName = computed(() => userProfile.value?.fullName || 'Guest');
const userFirstName = computed(() => userName.value.split(' ')[0] || 'Guest');
const activePeriod = ref("Weekly");
const deviceId = ref(null);

// --- Data for Child Components ---
const dailyData = ref([]); 
const weeklyData = ref([]);
const monthlyData = ref([]);
const yearlyData = ref([]);

const gridKwh = ref(0);
const solarKwh = ref(0);
const topConsumers = ref([]);
const loadingConsumers = ref(true);

const dailyCostData = ref([]);
const weeklyCostData = ref([]);
const monthlyCostData = ref([]);
const yearlyCostData = ref([]);

const dailySavingsData = ref([]);
const weeklySavingsData = ref([]);
const monthlySavingsData = ref([]);
const yearlySavingsData = ref([]);

const currentRate = ref(0);
const carbonRateKg = ref(0.7);

const pesoFormatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
const estimatedSavings = computed(() => solarKwh.value * currentRate.value);

const dailyMetrics = computed(() => [
  {
    title: 'Current Cost',
    cost: `₱${currentRate.value.toFixed(2)}`,
    definition: `${(userProfile.value?.electricityProvider || '').toUpperCase()} Current rate`
  },
  {
    title: 'Grid Consumption',
    cost: `${gridKwh.value.toFixed(4)} kWh`,
    definition: 'Today'
  },
  {
    title: "Today's Estimated Cost",
    cost: pesoFormatter.format(gridKwh.value * currentRate.value),
    definition: 'Based on today\'s usage'
  },
  {
    title: 'Solar Consumption',
    cost: `${solarKwh.value.toFixed(4)} kWh`,
    definition: 'Today'
  },
  {
    title: 'CO₂ Saved',
    cost: `${(solarKwh.value * carbonRateKg.value).toFixed(2)} kg`,
    definition: 'Today'
  },
]);

// --- Data Fetching Functions ---

const fetchUtilityRate = (provider) => {
  if (!provider) {
    console.warn("No electricity provider specified for rate fetch.");
    currentRate.value = 0;
    return;
  }
  
  const rateRef = doc(db, `artifacts/${appId}/public/data/utility_rates/${provider}`);
  
  onSnapshot(rateRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      currentRate.value = data.kwhRate || 0;
    } else {
      console.warn(`No rate document found for provider: ${provider}`);
      currentRate.value = 0;
    }
  }, (error) => {
    console.error(`Error fetching rate for ${provider}:`, error);
    currentRate.value = 0;
  });
};

const fetchCarbonRate = async () => {
  try {
    const q = query(
      collection(db, "artifacts/default-app-id/public/data/carbon_emission_rates"),
      orderBy("date_updated", "desc"),
      limit(1)
    )
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      carbonRateKg.value = snapshot.docs[0].data().carbonRateKg
    }
  } catch (err) {
    console.error("Error fetching carbon rate:", err)
  }
};

const fetchPageData = async () => {
  if (!deviceId.value) return;

  // Fetch historical data for W, M, Y charts
  const historicalData = await dashboardService.getHistoricalChartData(deviceId.value);
  weeklyData.value = historicalData.weeklyData;
  monthlyData.value = historicalData.monthlyData;
  yearlyData.value = historicalData.yearlyData;

  // Fetch today's hourly data
  dailyData.value = await dashboardService.getHourlyChartData(deviceId.value);

  updateCostAndSavingsData();
  fetchTopConsumers(); // Fetch appliance data separately
};

const setupRealtimeListeners = (id) => {
    if (!id) return;
    const todayDate = new Date().toISOString().slice(0, 10);
    const todaySummaryRef = doc(db, `devices/${id}/daily_summaries/${todayDate}`);

    // Listen for today's summary (for metric cards)
    return onSnapshot(todaySummaryRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            gridKwh.value = data.gridKwhTotal || 0;
            solarKwh.value = data.solarKwhTotal || 0;
        } else {
            gridKwh.value = 0;
            solarKwh.value = 0;
        }
        updateCostAndSavingsData();
    });
};

const fetchTopConsumers = async () => {
    if (!deviceId.value) return;
    loadingConsumers.value = true;
    try {
        const consumersQuery = query(collection(db, `devices/${deviceId.value}/appliances`));
        const snapshot = await getDocs(consumersQuery);
        topConsumers.value = snapshot.docs.map(doc => ({ ...doc.data() }));
    } catch (error) {
        console.error("Error fetching top consumers:", error);
    } finally {
        loadingConsumers.value = false;
    }
};

// --- Helper Functions ---
const clearAllData = () => {
  dailyData.value = [];
  weeklyData.value = [];
  monthlyData.value = [];
  yearlyData.value = [];
  gridKwh.value = 0;
  solarKwh.value = 0;
  topConsumers.value = [];
  updateCostAndSavingsData();
};

const updateCostAndSavingsData = () => {
  const mapToCostSavings = (arr) => ({
    cost: arr.map(item => ({ label: item.label, value: (item.grid ?? item.value ?? 0) * currentRate.value })),
    savings: arr.map(item => ({ label: item.label, value: (item.solar ?? 0) * currentRate.value }))
  });

  const dailyMapped = mapToCostSavings(dailyData.value);
  dailyCostData.value = dailyMapped.cost;
  dailySavingsData.value = dailyMapped.savings;

  const weeklyMapped = mapToCostSavings(weeklyData.value);
  weeklyCostData.value = weeklyMapped.cost;
  weeklySavingsData.value = weeklyMapped.savings;

  const monthlyMapped = mapToCostSavings(monthlyData.value);
  monthlyCostData.value = monthlyMapped.cost;
  monthlySavingsData.value = monthlyMapped.savings;

  const yearlyMapped = mapToCostSavings(yearlyData.value);
  yearlyCostData.value = yearlyMapped.cost;
  yearlySavingsData.value = yearlyMapped.savings;
};

// --- Lifecycle & Watchers ---
let unsubscribeSummary = null;

watch(userProfile, (newProfile) => {
    if (newProfile) {
        deviceId.value = newProfile.deviceId || null;
        fetchUtilityRate(newProfile.electricityProvider); // Restore call to fetch rate
    } else {
        deviceId.value = null;
        clearAllData();
    }
}, { immediate: true });

watch(deviceId, (newDeviceId) => {
  if (unsubscribeSummary) unsubscribeSummary();

  if (newDeviceId) {
    fetchPageData();
    unsubscribeSummary = setupRealtimeListeners(newDeviceId);
  } else {
    clearAllData();
  }
}, { immediate: true });

onMounted(() => {
    fetchCarbonRate(); // Restore call to fetch carbon rate
});

</script>

<style scoped>
/* Scoped styles remain unchanged */
</style>
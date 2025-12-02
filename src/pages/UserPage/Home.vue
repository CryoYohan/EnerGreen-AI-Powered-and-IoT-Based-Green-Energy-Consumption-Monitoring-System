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
                v-else-if="metric.title === 'Consumption'" 
                class="w-6 h-6 text-blue-600 dark:text-blue-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <svg 
                v-else-if="metric.title === 'Solar Generation'" 
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
import { ArrowPathIcon, SunIcon, BoltIcon, Battery50Icon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'; // Imported icons here
import {
  auth,
  db,
  doc,
  onAuthStateChanged,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  Timestamp,
  where,
  getDocs, // Added getDocs for the carbon rate fetch
} from "../../firebase.js"; // Ensure getDocs is imported from your firebase.js

// Import your components
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import SourcesChart from "@/components/UserComponents/Home/SourcesChart.vue";
import CombineCharts from "@/components/UserComponents/Home/CombineCharts.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import Dashboard from "@/components/ReusableComponents/RealTimeDataCard.vue";

import { useDarkMode } from "@/composables/useDarkMode.js";
const { isDarkMode } = useDarkMode();


import { useAuth } from "@/composables/useAuth"; 
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // Make sure this is still defined
const { user, userProfile, isLoading: authLoading } = useAuth(appId); // Use the composable

// Reactive state for user data
// Change userName and userFirstName to be computed properties directly tied to userProfile
const userName = computed(() => {
    // Read directly from the composable's state
    return userProfile.value?.fullName || 'Guest'; 
});

const userFirstName = computed(() => {
  return userName.value.split(' ')[0] || 'Guest';
});

// Reactive state for chart data
const activePeriod = ref("Weekly");

// Daily data will now store hourly data (still needs raw readings)
const dailyData = ref([]); 
const weeklyData = ref([]);
const monthlyData = ref([]);
const yearlyData = ref([]);
const deviceId = ref(null);

// Reactive state for total kWh consumed today
const totalKwhToday = ref(0);
const gridKwh = ref(0);
const solarKwh = ref(0);
const topConsumers = ref([]);
const loadingConsumers = ref(true);

// New refs for cost & savings timelines
const dailyCostData = ref([]);
const weeklyCostData = ref([]);
const monthlyCostData = ref([]);
const yearlyCostData = ref([]);

const dailySavingsData = ref([]);
const weeklySavingsData = ref([]);
const monthlySavingsData = ref([]);
const yearlySavingsData = ref([]);

const currentRate = ref(0); // ₱ per kWh
const carbonRateKg = ref(0.7) // fallback default

const estimatedSavings = computed(() => {
  return solarKwh.value * currentRate.value;
});

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

// Metrics Card Data - now using proper SVG icons
const dailyMetrics = computed(() => [
  {
    title: 'Current Cost',
    cost: `₱${currentRate.value.toFixed(2)}`,
    definition: `${(userProfile.value?.electricityProvider || '').toUpperCase()} Current rate`
  },
  {
    title: 'Consumption',
    cost: `${totalKwhToday.value.toFixed(4)} kWh`,
    definition: 'Today'
  },
  {
    title: "Today's Estimated Cost",
    cost: pesoFormatter.format(totalKwhToday.value * currentRate.value),
    definition: 'Based on today\'s usage'
  },
  {
    title: 'Solar Generation',
    cost: `${solarKwh.value.toFixed(2)} kWh`,
    definition: 'Today'
  },
  {
    title: 'CO₂ Saved',
    cost: `${(solarKwh.value * carbonRateKg.value).toFixed(2)} kg`,
    definition: 'Today'
  },
]);
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
      // Dynamically access the rate field, e.g., data['vecoKwhRate']
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
}

const showOnboarding = ref(false);

// Keep fetchDeviceId to set the deviceId based on the profile data
const fetchDeviceId = () => {
  // We no longer need to fetch the profile document since useAuth already did it.
  // We only need to react to userProfile.value changes.
  if (userProfile.value) {
    deviceId.value = userProfile.value.deviceId || null;
    // userName is now computed, so no need to set it here
  } else {
    console.log("No user profile found, setting to Guest state.");
    deviceId.value = null;
    // userName is already 'Guest' via computed
    clearAllData();
  }
};

/**
 * NEW: Efficiently aggregates daily summaries into weekly, monthly, and yearly chart data.
 * @param {Array<object>} summaries An array of daily summary documents.
 */
const processDailySummaries = (summaries) => {
  // Use Philippine time for grouping
  const phTime = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila' });
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Groupings
  const weeklyTotals = {}; // Key: Day of Week (0-6)
  const monthlyTotals = {}; // Key: Month-Year (e.g., "Jan-2025")
  const yearlyTotals = {}; // Key: Year (e.g., "2025")
  
  // Calculate a 7-day cutoff for weekly data
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);
  cutoffDate.setHours(0, 0, 0, 0);

  // Process all summaries
  summaries.forEach(summary => {
    const date = new Date(summary.date);
    const gridKwh = summary.gridKwhTotal || 0;
    const solarKwh = summary.solarKwhTotal || 0;
    
    // WEEKLY GROUPING - FIXED
    if (date > cutoffDate) {
      const dateKey = date.toISOString().slice(0, 10); // "YYYY-MM-DD"
      if (!weeklyTotals[dateKey]) {
        weeklyTotals[dateKey] = { 
          grid: 0, 
          solar: 0, 
          label: weekday[date.getDay()] 
        };
      }
      weeklyTotals[dateKey].grid += gridKwh;
      weeklyTotals[dateKey].solar += solarKwh;
    }

    // MONTHLY GROUPING
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthlyKey = `${monthNames[month]}-${year}`;
    if (!monthlyTotals[monthlyKey]) {
      monthlyTotals[monthlyKey] = { grid: 0, solar: 0 };
    }
    monthlyTotals[monthlyKey].grid += gridKwh;
    monthlyTotals[monthlyKey].solar += solarKwh;

    // YEARLY GROUPING
    const yearlyKey = year.toString();
    if (!yearlyTotals[yearlyKey]) {
      yearlyTotals[yearlyKey] = { grid: 0, solar: 0 };
    }
    yearlyTotals[yearlyKey].grid += gridKwh;
    yearlyTotals[yearlyKey].solar += solarKwh;
  });

  // -----------------------------------------------------------
  // 1. Weekly Data (Mon → Today) - FIXED VERSION
  // -----------------------------------------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get Monday of this week (6 days before today)
  const monday = new Date(today);
  monday.setDate(today.getDate() - 6); // 7-day window (Mon–Sun)

  // Collect last 7 days (Monday → Today)
  // Build last 7 days in order (Mon → Sun)
  const lastSevenDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);

    const dayData = weeklyTotals[dateKey] || { grid: 0, solar: 0, label: weekday[d.getDay()] };
    lastSevenDays.push({
      label: dayData.label,
      grid: dayData.grid,
      solar: dayData.solar,
      value: dayData.grid + dayData.solar
    });
  }

weeklyData.value = lastSevenDays;


  weeklyData.value = lastSevenDays;

  // 2. Monthly Data
  // -----------------------------------------------------------
  monthlyData.value = Object.keys(monthlyTotals).map(key => ({
    label: key.split('-')[0],
    grid: monthlyTotals[key].grid,
    solar: monthlyTotals[key].solar,
    value: monthlyTotals[key].grid + monthlyTotals[key].solar
  }));

  // 3. Yearly Data
  // -----------------------------------------------------------
  yearlyData.value = Object.keys(yearlyTotals).map(year => ({
    label: year,
    grid: yearlyTotals[year].grid,
    solar: yearlyTotals[year].solar,
    value: yearlyTotals[year].grid + yearlyTotals[year].solar
  }));
  
  // Update cost and savings timelines
  updateCostAndSavingsData();
};


/**
 * Fetches data from three sources: today's raw readings (for hourly), 
 * the current day's summary (for today's totals), and all daily summaries (for charts).
 */
// --- A. ALL DAILY SUMMARIES (FOR WEEKLY/MONTHLY/YEARLY CHARTS) ---
// One-time read (massive read optimization)
 const fetchDailySummaries = async () => {
  try {
    if (!deviceId.value) {
      console.warn("Device ID not available yet.");
      return;
    }

    const allSummariesQuery = query(
      collection(db, `devices/${deviceId.value}/daily_summaries`), // ✅ FIXED
      orderBy("date", "desc"),
      limit(365)
    );
    const querySnapshot = await getDocs(allSummariesQuery);

    const dailySummaries = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      dailySummaries.push(data);
    });

    if (dailySummaries.length === 0) {
      console.warn("No daily summaries found for this device.");
      weeklyData.value = [];
      monthlyData.value = [];
      yearlyData.value = [];
      updateCostAndSavingsData();
      return;
    }

    processDailySummaries(JSON.parse(JSON.stringify(dailySummaries)));
  } catch (error) {
    console.error("Error fetching daily summaries:", error);
  }
};


const fetchEnergyAndApplianceData = async (deviceIdRef) => {
  if (!deviceIdRef) {
    console.warn("No deviceId provided for energy data fetch.");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfDay = Timestamp.fromDate(today);

  // ✅ FIXED Firestore path
  const readingsQuery = query(
    collection(db, `devices/${deviceIdRef}/realtime_readings`),
    where("timestamp", ">=", startOfDay),
    orderBy("timestamp", "asc")
  );

  onSnapshot(readingsQuery, (querySnapshot) => {
    const rawReadings = [];
    const gridReadings = [];
    const solarReadings = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const readingTime = data.timestamp ? data.timestamp.toDate() : new Date();
      const reading = { ...data, timestamp: readingTime };

      if (readingTime >= today) {
        if (reading.energySource === "Grid") gridReadings.push(reading);
        else if (reading.energySource === "Solar") solarReadings.push(reading);
      }
    });

    const calculateKwhDeltaForHourly = (readings) => {
      if (!readings || readings.length < 2) return { total: 0, hourly: {} };
      let totalDelta = 0;
      const hourly = {};

      for (let i = 1; i < readings.length; i++) {
        const delta = readings[i].kwhConsumed - readings[i - 1].kwhConsumed;
        if (delta > 0) {
          totalDelta += delta;
          const hour = readings[i].timestamp.getHours();
          hourly[hour] = (hourly[hour] || 0) + delta;
        }
      }
      return { total: totalDelta, hourly };
    };

    const gridResults = calculateKwhDeltaForHourly(gridReadings);
    const solarResults = calculateKwhDeltaForHourly(solarReadings);

    dailyData.value = Array.from({ length: 24 }, (_, i) => ({
      label: `${i}:00`,
      grid: gridResults.hourly[i] || 0,
      solar: solarResults.hourly[i] || 0,
      value: (gridResults.hourly[i] || 0) + (solarResults.hourly[i] || 0)
    }));

  }, (error) => console.error("Error fetching electricity data:", error));

  // ✅ FIXED Summary path
  const todayDate = new Date().toISOString().slice(0, 10);
  const todaySummaryRef = doc(db, `devices/${deviceIdRef}/daily_summaries/${todayDate}`);

  onSnapshot(todaySummaryRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      gridKwh.value = data.gridKwhTotal || 0;
      solarKwh.value = data.solarKwhTotal || 0;
      totalKwhToday.value = gridKwh.value + solarKwh.value;
    } else {
      gridKwh.value = 0;
      solarKwh.value = 0;
      totalKwhToday.value = 0;
    }
    updateCostAndSavingsData();
  });

  // ✅ FIXED Top consumers path
  const consumersQuery = query(collection(db, `devices/${deviceIdRef}/appliances`));

  try {
    loadingConsumers.value = true;
    const snapshot = await getDocs(consumersQuery);
    const fetchedAppliances = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || 'Unknown Appliance',
      usage: doc.data().kwhConsumed || 0,
    }));

    topConsumers.value =
      fetchedAppliances.length === 0
        ? [{ name: "No Smart Plug Detected", usage: 0 }]
        : fetchedAppliances.sort((a, b) => b.usage - a.usage);
  } catch (error) {
    console.error("Error fetching appliances:", error);
    topConsumers.value = [{ name: "No Smart Plug Detected", usage: 0 }];
  } finally {
    loadingConsumers.value = false;
  }
};


const clearAllData = () => {
  dailyData.value = [];
  weeklyData.value = [];
  monthlyData.value = [];
  yearlyData.value = [];
  totalKwhToday.value = 0;
  gridKwh.value = 0;
  solarKwh.value = 0;
  topConsumers.value = [];
  loadingConsumers.value = false;
  updateCostAndSavingsData();
};

/**
 * Helper to map kWh data arrays into cost & savings data arrays.
 */
const updateCostAndSavingsData = () => {
  const mapToCostSavings = (arr) => {
    return {
      cost: arr.map(item => ({
        label: item.label,
        // Cost is calculated based on GRID consumption
        value: (item.grid ?? item.value ?? 0) * currentRate.value 
      })),
      savings: arr.map(item => ({
        label: item.label,
        // Savings is calculated based on SOLAR generation
        value: (item.solar ?? 0) * currentRate.value 
      }))
    };
  };

  // Daily
  const dailyMapped = mapToCostSavings(dailyData.value);
  dailyCostData.value = dailyMapped.cost;
  dailySavingsData.value = dailyMapped.savings;

  // Weekly
  const weeklyMapped = mapToCostSavings(weeklyData.value);
  weeklyCostData.value = weeklyMapped.cost;
  weeklySavingsData.value = weeklyMapped.savings;

  // Monthly
  const monthlyMapped = mapToCostSavings(monthlyData.value);
  monthlyCostData.value = monthlyMapped.cost;
  monthlySavingsData.value = monthlyMapped.savings;

  // Yearly
  const yearlyMapped = mapToCostSavings(yearlyData.value);
  yearlyCostData.value = yearlyMapped.cost;
  yearlySavingsData.value = yearlyMapped.savings;
};


watch(userProfile, (newProfile) => {
    // This watcher runs whenever useAuth successfully loads or clears the profile.
    if (newProfile) {
        deviceId.value = newProfile.deviceId || null;
        // Fetch the utility rate based on the user's provider
        fetchUtilityRate(newProfile.electricityProvider);
    } else if (user.value === null) {
        // User logged out
        deviceId.value = null;
        clearAllData();
    } else {
        // Profile is loading or missing, handle gracefully
        fetchDeviceId();
    }
}, { immediate: true });

// The watch(deviceId, ...) below is now cleaner:
watch(deviceId, (newDeviceId) => {
  if (newDeviceId) {
    fetchEnergyAndApplianceData(newDeviceId); // Call with the raw ID
    fetchDailySummaries();
  } else {
    clearAllData();
  }
}, { immediate: true });



onMounted(async () => {
  // All user/profile/device ID fetching is now handled by the composable and the watcher.
  // We only keep non-auth related fetches here.
  fetchCarbonRate();

  const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
  if (!hasSeenOnboarding) {
    showOnboarding.value = true;
    localStorage.setItem("hasSeenOnboarding", "true");
  }
});

</script>

<style scoped>
/* Scoped styles remain unchanged */
</style>
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          v-for="(metric, index) in dynamicMetrics" 
          :key="index"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-start justify-between mb-4">
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
import { ref, computed, onMounted, watch } from "vue";
import {
  db,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  where,
  Timestamp 
} from "@/firebase.js"; 

// Import the authentication composable
import { useAuth } from "@/composables/useAuth"; 

// Reusable Components
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import EmissionDashboard from "@/components/ReusableComponents/EmissionCard.vue";

// Page-Specific Components
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue"; 

// --- AUTH STATE ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const { userProfile, isLoading: authLoading } = useAuth(appId);
const deviceId = ref(null); 

// --- COMPONENT STATE ---
const loading = ref(true);
const error = ref(null);
const activePeriod = ref("Daily");

// Fetched Data
const carbonRateKg = ref(0.7); 
const rawSummaries = ref([]); 

// Chart Data
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

// 
// -------------------------------------------------
// --- DATA FETCHING & PROCESSING ---
// -------------------------------------------------

// This function is unchanged
const fetchCarbonRate = async () => {
  try {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/carbon_emission_rates`),
      orderBy("date_updated", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      carbonRateKg.value = snapshot.docs[0].data().carbonRateKg;
    } else {
      console.warn("No carbon rate found, using fallback.");
    }
  } catch (err) {
    console.error("Error fetching carbon rate:", err); 
  }
};

// This function fetches Weekly/Monthly/Yearly (unchanged)
const fetchCarbonSummaries = async () => {
  if (!deviceId.value) { 
    error.value = "No Device ID found in user profile.";
    loading.value = false;
    return;
  }
  
  loading.value = true;
  error.value = null;

  try {
    const allSummariesQuery = query(
      collection(db, `devices/${deviceId.value}/daily_summaries`), 
      orderBy("date", "desc"),
      limit(365) 
    );
    const querySnapshot = await getDocs(allSummariesQuery);

    if (querySnapshot.empty) {
      console.warn("No daily summaries found for this device.");
      rawSummaries.value = [];
    } else {
      //
      // CHANGE 3: (Minor change here)
      // We are now storing the components of CO2 for our smart rules.
      //
      rawSummaries.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const gridKwh = data.gridKwhTotal || 0;
        const solarKwh = data.solarKwhTotal || 0;
        
        return {
          date: data.date, 
          co2_grid: gridKwh * carbonRateKg.value,
          co2_solar: solarKwh * carbonRateKg.value, // This is "saved" CO2
          co2_total: (gridKwh + solarKwh) * carbonRateKg.value
        };
      });
    }

    processCo2Summaries();

  } catch (err) {
    console.error("Error fetching carbon summaries:", err);
    error.value = "Failed to fetch emission summaries.";
  } finally {
    loading.value = false;
  }
};

// This function is unchanged
let hourlyDataUnsubscribe = null; 
const fetchHourlyData = (currentDeviceId) => {
  if (hourlyDataUnsubscribe) {
    hourlyDataUnsubscribe();
  }
  if (!currentDeviceId) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = Timestamp.fromDate(today);

  const readingsQuery = query(
    collection(db, `devices/${currentDeviceId}/realtime_readings`),
    where("timestamp", ">=", startOfDay),
    orderBy("timestamp", "asc")
  );

  hourlyDataUnsubscribe = onSnapshot(readingsQuery, (querySnapshot) => {
    const readings = querySnapshot.docs.map(doc => doc.data());
    const hourlyKwh = {}; 

    for (let i = 1; i < readings.length; i++) {
      const prev = readings[i - 1];
      const curr = readings[i];
      const delta = curr.kwhConsumed - prev.kwhConsumed;
      
      if (delta > 0 && delta < 1) { 
        const hour = curr.timestamp.toDate().getHours();
        hourlyKwh[hour] = (hourlyKwh[hour] || 0) + delta;
      }
    }
    
    hourlyChartData.value = Array.from({ length: 24 }, (_, i) => {
      const kwh = hourlyKwh[i] || 0;
      return {
        label: `${i}:00`,
        value: parseFloat((kwh * carbonRateKg.value).toFixed(3))
      };
    });

  }, (err) => {
    console.error("Error fetching hourly data:", err);
    error.value = "Failed to load hourly data.";
  });
};


// This function is unchanged
const processCo2Summaries = () => {
  const summaries = rawSummaries.value;
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (!summaries || summaries.length === 0) {
    weeklyChartData.value = [];
    monthlyChartData.value = [];
    yearlyChartData.value = [];
    return;
  }

  // --- Weekly (Last 7 Days) ---
  const lastSevenDays = summaries
    .slice(0, 7)
    .map(s => ({
      label: weekday[new Date(s.date).getUTCDay()],
      // --- CHANGE 3: (Minor change here) ---
      // Use the co2_total we calculated
      value: parseFloat(s.co2_total.toFixed(2))
    }))
    .reverse(); 
  
  weeklyChartData.value = lastSevenDays;

  // --- Monthly (Last 12 Months) ---
  const monthlyTotals = {};
  summaries.forEach(s => {
    const date = new Date(s.date);
    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = 0;
    }
    // --- CHANGE 3: (Minor change here) ---
    monthlyTotals[monthKey] += s.co2_total;
  });

  monthlyChartData.value = Object.keys(monthlyTotals)
    .sort()
    .slice(-12) 
    .map(key => {
      const [year, month] = key.split('-');
      return {
        label: monthNames[parseInt(month) - 1],
        value: parseFloat(monthlyTotals[key].toFixed(2))
      };
    });

  // --- Yearly ---
  const yearlyTotals = {};
  summaries.forEach(s => {
    const yearKey = new Date(s.date).getUTCFullYear().toString();
    if (!yearlyTotals[yearKey]) {
      yearlyTotals[yearKey] = 0;
    }
    // --- CHANGE 3: (Minor change here) ---
    yearlyTotals[yearKey] += s.co2_total;
  });

  yearlyChartData.value = Object.keys(yearlyTotals)
    .sort()
    .map(year => ({
      label: year,
      value: parseFloat(yearlyTotals[year].toFixed(2))
    }));
};

// --- DYNAMIC COMPUTED PROPERTIES ---

// 
// CHANGE 2:
// This is the new "smartTips" computed property.
//
const smartTips = computed(() => {
  const tips = [];
  if (!rawSummaries.value.length) return []; // No data, no tips

  const last30Days = rawSummaries.value.slice(0, 30);
  if (last30Days.length < 7) return []; // Not enough data for meaningful tips

  // --- Rule 1: High Base Load ---
  // Find the lowest consumption day in the last month.
  const minCo2Day = Math.min(...last30Days.map(s => s.co2_total));
  // If their "lowest" day is still high (e.g., > 1 kg CO2), they have a high base load.
  if (minCo2Day > 1.0) {
    tips.push({
      id: 1,
      title: 'Reduce "Vampire" Power',
      description: 'Your devices are using power even on low-use days. Unplug chargers and turn off electronics at the wall when not in use.'
    });
  }

  // --- Rule 2: Recent Trend Increasing ---
  const last7Days = last30Days.slice(0, 7);
  const avg7Day = last7Days.reduce((acc, s) => acc + s.co2_total, 0) / 7;
  const avg30Day = last30Days.reduce((acc, s) => acc + s.co2_total, 0) / 30;

  if (avg7Day > avg30Day * 1.15) { // If 7-day avg is 15% higher than 30-day
    tips.push({
      id: 2,
      title: 'Check Recent Usage',
      description: 'Your carbon emission has been higher than usual this past week. Check for any new appliances or devices left running.'
    });
  }

  // --- Rule 3: Poor Solar Optimization ---
  const totalGridCo2 = last30Days.reduce((acc, s) => acc + s.co2_grid, 0);
  const totalSolarCo2 = last30Days.reduce((acc, s) => acc + s.co2_solar, 0);

  // If they use the grid more than solar (and have solar), they can optimize.
  if (totalGridCo2 > totalSolarCo2 && totalSolarCo2 > 0) {
    tips.push({
      id: 3,
      title: 'Optimize Solar Usage',
      description: 'You are still pulling significant power from the grid. Try running high-power appliances (laundry, AC) during peak sunlight hours.'
    });
  }

  // --- Fallback Tip ---
  if (tips.length === 0) {
    tips.push({
      id: 4,
      title: 'Great Job!',
      description: "Your emission levels look stable. Keep exploring ways to save, like using LED bulbs and power-saving modes."
    });
  }

  return tips;
});


// dynamicMetrics is updated to use co2_total for consistency
const dynamicMetrics = computed(() => {
  if (!rawSummaries.value.length) return [
    { title: 'Current CO₂ Emissions (Today)', cost: '0.00 kg CO₂', definition: 'No data found' },
    { title: 'Trees Equivalent (Monthly)', cost: '0 trees', definition: 'No data found' },
    { title: 'Monthly Total', cost: '0.00 kg CO₂', definition: 'No data found' },
  ];

  // --- CHANGE 3: (Minor change here) ---
  const latestCo2 = rawSummaries.value[0]?.co2_total || 0;
  const last30DaysCo2 = rawSummaries.value
    .slice(0, 30)
    .reduce((acc, s) => acc + s.co2_total, 0);
  // --- End of change ---

  const treesEquivalent = (last30DaysCo2 / (20.4 / 12)).toFixed(0);

  return [
    {
      title: 'Current CO₂ Emissions (Today)',
      cost: `${latestCo2.toFixed(2)} kg CO₂`,
      definition: 'Based on the last daily summary'
    },
    {
      title: 'Trees Equivalent (Monthly)',
      cost: `${treesEquivalent} trees`,
      definition: 'Needed to offset last 30 days'
    },
    {
      title: 'Monthly Total',
      cost: `${last30DaysCo2.toFixed(2)} kg CO₂`,
      definition: 'Total for the last 30 days'
    },
  ];
});

// --- LIFECYCLE HOOKS (Robust Version) ---

// Watch 1: Handle User Profile Loading State
watch(userProfile, (newProfile) => {
  if (newProfile) {
    // Profile loaded! Check for device ID.
    if (newProfile.deviceId) {
      deviceId.value = newProfile.deviceId;
    } else {
      // Profile exists but no device assigned
      deviceId.value = null;
      error.value = "No Smart Meter linked to your account.";
      loading.value = false; // Stop spinner so error shows
    }
  } else {
    // Profile is null (either loading or logged out)
    deviceId.value = null;
    
    // Only show error if auth is done loading and we still have no profile
    if (!authLoading.value) {
       error.value = "User profile not found.";
       loading.value = false;
    }
  }
}, { immediate: true });

// Watch 2: Trigger Data Fetch when Device ID is set
watch(deviceId, (newDeviceId) => {
  if (newDeviceId) {
    // Success path!
    fetchCarbonRate().then(() => {
      fetchCarbonSummaries(); 
      fetchHourlyData(newDeviceId); 
    });
  } else {
    // Clear data if device ID is lost
    rawSummaries.value = [];
    hourlyChartData.value = []; 
    processCo2Summaries();
    if (hourlyDataUnsubscribe) hourlyDataUnsubscribe();
    
    // We don't set error here because Watch 1 already handled the specific error message
  }
}, { immediate: true });

</script>
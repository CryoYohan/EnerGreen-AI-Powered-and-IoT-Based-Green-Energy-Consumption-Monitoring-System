<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">

    <UserHeader />
    <div class="flex flex-col items-center justify-between sm:flex-row">
      <Heading title="Carbon Emission" subtitle="Monitor your carbon emission and find ways to reduce them." />
    </div>

    <div v-if="loading" class="text-center p-10">Loading Emission Data...</div>
    <div v-if="error" class="text-center p-10 text-red-500">Error: {{ error }}</div>

    <MetricsCard v-if="!loading && !error" :metrics="dynamicMetrics" size="extra" />
    
    <EmissionDashboard :emissionSources="sources" :tips="tipsList" />

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
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import EmissionDashboard from "@/components/ReusableComponents/EmissionCard.vue";

// Page-Specific Components
import AnalyticsBtn from "@/components/UserComponents/CarbonEmission/AnalyticsBtn.vue";
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
// 2. Rename dailyChartData -> hourlyChartData
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
const tipsList = [
  { id: 1, title: 'Optimize AC Usage', description: 'Set temperature to 24°C for optimal efficiency' },
  { id: 2, title: 'Standby Power', description: 'Unplug devices when not in use' },
  { id: 3, title: 'Lighting Efficiency', description: 'Use LED bulbs and natural light when possible' },
];

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
    // Note: We run fetchCarbonRate *only once* inside the watcher
    // to avoid running it on every refresh.
    
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
      rawSummaries.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const totalKwh = (data.gridKwhTotal || 0) + (data.solarKwhTotal || 0);
        return {
          date: data.date, 
          co2: totalKwh * carbonRateKg.value
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

// 3. Add this NEW function to fetch hourly data
let hourlyDataUnsubscribe = null; // To store the onSnapshot listener

const fetchHourlyData = (currentDeviceId) => {
  // Stop any previous listener
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
    const hourlyTotals = {}; // e.g., { 8: 0.5, 9: 1.2 }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const kwh = data.kwhConsumed || 0; 
      const hour = data.timestamp.toDate().getHours(); // 0-23
      
      // Note: This logic assumes kwhConsumed is the total *for that reading*.
      // If it's a cumulative meter reading, this logic will need to be changed
      // to calculate deltas, just like in your Home.vue.
      // For simplicity, we'll sum the 'kwhConsumed' field for now.
      
      // Let's use the delta logic from Home.vue, it's safer.
      // We need to process *all* readings first.
    });

    // --- Using the Delta Logic from Home.vue ---
    const readings = querySnapshot.docs.map(doc => doc.data());
    const hourlyKwh = {}; // { 8: 0.2, 9: 0.3 }

    for (let i = 1; i < readings.length; i++) {
      const prev = readings[i - 1];
      const curr = readings[i];
      
      // Calculate delta only if it's the same energy source or if source doesn't matter
      const delta = curr.kwhConsumed - prev.kwhConsumed;
      
      if (delta > 0 && delta < 1) { // Add a small sanity check
        const hour = curr.timestamp.toDate().getHours();
        hourlyKwh[hour] = (hourlyKwh[hour] || 0) + delta;
      }
    }
    
    // Convert to chart format and calculate CO2
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


// 4. UPDATE processCo2Summaries
const processCo2Summaries = () => {
  const summaries = rawSummaries.value;
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (!summaries || summaries.length === 0) {
    // hourlyChartData is handled by its own function
    weeklyChartData.value = [];
    monthlyChartData.value = [];
    yearlyChartData.value = [];
    return;
  }

  // --- Weekly (Last 7 Days) ---
  // We removed the 'dailyChartData' line from here
  const lastSevenDays = summaries
    .slice(0, 7)
    .map(s => ({
      label: weekday[new Date(s.date).getUTCDay()],
      value: parseFloat(s.co2.toFixed(2))
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
    monthlyTotals[monthKey] += s.co2;
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
    yearlyTotals[yearKey] += s.co2;
  });

  yearlyChartData.value = Object.keys(yearlyTotals)
    .sort()
    .map(year => ({
      label: year,
      value: parseFloat(yearlyTotals[year].toFixed(2))
    }));
};

// --- DYNAMIC COMPUTED PROPERTIES ---
// (This is unchanged)
const dynamicMetrics = computed(() => {
  // ... (no changes here) ...
  if (!rawSummaries.value.length) return [
    { title: 'Current CO₂ Emissions (Today)', icon: '/src/Images/Icons/conditioner.svg', cost: '0.00 kg CO₂', definition: 'No data found' },
    { title: 'Tress Equivalent (Monthly)', icon: '/src/Images/Icons/tree.svg', cost: '0 trees', definition: 'No data found' },
    { title: 'Monthly Total', icon: '/src/Images/Icons/leaf.svg', cost: '0.00 kg CO₂', definition: 'No data found' },
  ];

  const latestCo2 = rawSummaries.value[0]?.co2 || 0;
  const last30DaysCo2 = rawSummaries.value
    .slice(0, 30)
    .reduce((acc, s) => acc + s.co2, 0);
  const treesEquivalent = (last30DaysCo2 / (20.4 / 12)).toFixed(0);

  return [
    {
      title: 'Current CO₂ Emissions (Today)',
      icon: '/src/Images/Icons/conditioner.svg',
      cost: `${latestCo2.toFixed(2)} kg CO₂`,
      definition: 'Based on the last daily summary'
    },
    {
      title: 'Tress Equivalent (Monthly)',
      icon: '/src/Images/Icons/tree.svg',
      cost: `${treesEquivalent} trees`,
      definition: 'Needed to offset last 30 days'
    },
    {
      title: 'Monthly Total',
      icon: '/src/Images/Icons/leaf.svg',
      cost: `${last30DaysCo2.toFixed(2)} kg CO₂`,
      definition: 'Total for the last 30 days'
    },
  ];
});

// -------------------------------------------------
// --- LIFECYCLE HOOKS ---
// 5. UPDATE Watchers
// -------------------------------------------------

watch(userProfile, (newProfile) => {
  if (newProfile && newProfile.deviceId) {
    deviceId.value = newProfile.deviceId;
    // The watcher below will trigger fetches
  } else {
    deviceId.value = null;
    rawSummaries.value = [];
    hourlyChartData.value = []; // Clear hourly data
    processCo2Summaries(); 
    if (hourlyDataUnsubscribe) hourlyDataUnsubscribe(); // Stop listener
    if (!authLoading.value) { 
       error.value = "No deviceId linked to your profile.";
    }
  }
}, { immediate: true });

watch(deviceId, (newDeviceId) => {
  if (newDeviceId) {
    // We fetch the rate *once*, then fetch the data.
    // The hourly listener will use the new rate.
    fetchCarbonRate().then(() => {
      fetchCarbonSummaries(); // Fetches W/M/Y data
      fetchHourlyData(newDeviceId); // Starts H listener
    });
  } else {
    // Clear all data on logout
    rawSummaries.value = [];
    hourlyChartData.value = []; // Clear hourly data
    processCo2Summaries();
    if (hourlyDataUnsubscribe) hourlyDataUnsubscribe(); // Stop listener
    
    if (!authLoading.value) { 
      error.value = "No Device ID. Cannot load carbon data.";
    }
  }
}, { immediate: true });

</script>
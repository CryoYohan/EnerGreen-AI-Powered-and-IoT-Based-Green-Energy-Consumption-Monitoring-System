<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
    <UserHeader />
    <Heading :title="`Welcome Back, ${userName}!`" subtitle="Here's your energy consumption overview"/>

    <MetricsCard :metrics="dailyMetrics" size="base" />

    <Dashboard />

    <!-- REPLACED ReusableBarChart WITH THE NEW CombineCharts -->
    <CombineCharts
      chartTitle="Electricity Usage"
      :activePeriod="activePeriod"
      @update:activePeriod="activePeriod = $event"
      :periods="['Daily', 'Weekly', 'Monthly', 'Yearly']"
      :dailyData="dailyData"
      :weeklyData="weeklyData"
      :monthlyData="monthlyData"
      :yearlyData="yearlyData"
      xAxisLabel="Time"
      tooltipUnit="kWh"
    />
    <SourcesChart :grid-kwh="gridKwh" :solar-kwh="solarKwh" :top-consumers="topConsumers" :loading-consumers="loadingConsumers" />
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
import {
  auth,
  db,
  doc,
  onAuthStateChanged,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "../../firebase.js";

// Import your components
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import SourcesChart from "@/components/UserComponents/Home/SourcesChart.vue";
// REPLACED ReusableBarChart with the new CombineCharts
import CombineCharts from "@/components/UserComponents/Home/CombineCharts.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import Dashboard from "@/components/ReusableComponents/RealTimeDataCard.vue";

// 1. Import the composable
import { useDarkMode } from "@/composables/useDarkMode.js";

// 2. Use the composable to get the shared state
const { isDarkMode } = useDarkMode();


// The global app ID is provided by the canvas environment.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Reactive state for user data
const userName = ref('Guest');
const userFirstName = computed(() => {
  return userName.value.split(' ')[0] || 'Guest';
});

// Reactive state for chart data
const activePeriod = ref("Weekly");
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

// Metrics Card Data
const dailyMetrics = computed(() => [
  {
    title: 'Current Cost',
    icon: '/src/Images/Icons/Peso.svg',
    cost: '₱12.30',
    definition: 'Current rate'
  },
  {
    title: 'Consumption',
    icon: '/src/Images/Icons/electric.svg',
    cost: `${totalKwhToday.value.toFixed(4)} kWh`,  // ✅ Now accurate
    definition: 'Today'
  },
  {
    title: 'Peak Usage',
    icon: '/src/Images/Icons/Usage.svg',
    cost: '6:00 PM - 9:00 PM',
    definition: 'Today'
  },
  {
    title: 'Solar Generation',
    icon: '/src/Images/Icons/sun.svg',
    cost: `${solarKwh.value.toFixed(2)} kWh`,
    definition: 'Today'
  },
  {
    title: 'CO₂ Saved',
    icon: '/src/Images/Icons/leaf.svg',
    cost: '1.5 kg',
    definition: 'Today'
  },
]);


const showOnboarding = ref(false);

/**
 * Fetches the user's device ID from their profile document.
 * @param {string} userId The current user's ID.
 */
const fetchDeviceId = (userId) => {
  const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`);
  onSnapshot(userProfileRef, (userProfileSnap) => {
    if (userProfileSnap.exists()) {
      const profileData = userProfileSnap.data();
      deviceId.value = profileData.deviceId || null;
      userName.value = profileData.fullName || 'Guest';
    } else {
      console.log("No user profile found!");
      deviceId.value = null;
      userName.value = 'Guest';
    }
  }, (error) => {
    console.error("Error listening to user profile:", error);
  });
};

/**
 * Calculates the delta kWh from a sorted array of readings by summing up
 * the differences between consecutive readings. This handles cases where
 * the counter may reset (e.g., device turned off).
 * @param {Array<object>} readings The sorted raw usage data from Firestore.
 * @returns {number} The total kWh consumed.
 */
const calculateKwhDelta = (readings) => {
  if (!readings || readings.length < 2) {
    return 0;
  }
  
  let totalDelta = 0;
  for (let i = 1; i < readings.length; i++) {
    const currentKwh = readings[i].kwhConsumed;
    const prevKwh = readings[i - 1].kwhConsumed;
    const delta = currentKwh - prevKwh;

    // Only add positive deltas to the total
    if (delta > 0) {
      totalDelta += delta;
    }
  }

  return totalDelta;
};


/**
 * Aggregates raw data into daily (hourly), weekly, monthly, and yearly usage.
 * Uses deltas between consecutive readings instead of raw cumulative values.
 * @param {Array<object>} rawData The raw usage data from Firestore.
 */
const aggregateData = (rawData) => {
  if (!rawData || rawData.length === 0) {
    dailyData.value = [];
    weeklyData.value = [];
    monthlyData.value = [];
    yearlyData.value = [];
    totalKwhToday.value = 0;
    return;
  }

  // Sort by timestamp
  rawData.sort((a, b) => a.timestamp - b.timestamp);

  // --- DAILY (hourly buckets) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysReadings = rawData.filter(r => r.timestamp >= today);
  totalKwhToday.value = calculateKwhDelta(todaysReadings);

  const hourly = {};
  for (let i = 1; i < todaysReadings.length; i++) {
    const prev = todaysReadings[i - 1];
    const curr = todaysReadings[i];
    const delta = curr.kwhConsumed - prev.kwhConsumed;

    if (delta > 0) {
      const hour = curr.timestamp.getHours();
      hourly[hour] = (hourly[hour] || 0) + delta;
    }
  }
  dailyData.value = Array.from({ length: 24 }, (_, i) => ({
    label: `${i}:00`,
    value: hourly[i] || 0,
  }));

  // --- WEEKLY (per day) ---
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyTotals = {};
  for (let i = 1; i < rawData.length; i++) {
    const prev = rawData[i - 1];
    const curr = rawData[i];
    const delta = curr.kwhConsumed - prev.kwhConsumed;

    if (delta > 0) {
      const day = curr.timestamp.toDateString();
      dailyTotals[day] = (dailyTotals[day] || 0) + delta;
    }
  }

  const lastSevenDays = [];
  const currentDate = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - i);
    const label = weekday[date.getDay()];
    const total = dailyTotals[date.toDateString()] || 0;
    lastSevenDays.push({ label, value: total });
  }
  weeklyData.value = lastSevenDays;

  // --- MONTHLY (per month) ---
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTotals = {};
  for (let i = 1; i < rawData.length; i++) {
    const prev = rawData[i - 1];
    const curr = rawData[i];
    const delta = curr.kwhConsumed - prev.kwhConsumed;

    if (delta > 0) {
      const month = curr.timestamp.getMonth();
      const year = curr.timestamp.getFullYear();
      const key = `${monthNames[month]}-${year}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + delta;
    }
  }
  monthlyData.value = Object.keys(monthlyTotals).map(key => ({
    label: key.split('-')[0],
    value: monthlyTotals[key],
  }));

  // --- YEARLY (per year) ---
  const yearlyTotals = {};
  for (let i = 1; i < rawData.length; i++) {
    const prev = rawData[i - 1];
    const curr = rawData[i];
    const delta = curr.kwhConsumed - prev.kwhConsumed;

    if (delta > 0) {
      const year = curr.timestamp.getFullYear();
      yearlyTotals[year] = (yearlyTotals[year] || 0) + delta;
    }
  }
  yearlyData.value = Object.keys(yearlyTotals).map(year => ({
    label: year,
    value: yearlyTotals[year],
  }));
};

/**
 * Fetches energy and appliance data based on the device ID.
 * @param {string} deviceId The device ID to fetch data for.
 */
const fetchEnergyAndApplianceData = (deviceId) => {
  // Fetch energy source data
  const readingsQuery = query(
    collection(db, `devices/${deviceId}/realtime_readings`),
    orderBy("timestamp", "asc")
  );

  onSnapshot(readingsQuery, (querySnapshot) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rawReadings = [];
    const gridReadings = [];
    const solarReadings = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const reading = {
        ...data,
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
      };
      
      // Separate the readings into grid and solar and ensure they are from today
      if (reading.timestamp >= today) {
        if (reading.energySource === "Grid") {
          gridReadings.push(reading);
        } else if (reading.energySource === "Solar") {
          solarReadings.push(reading);
        }
      }
      rawReadings.push(reading);
    });

    // Use the delta calculation for accurate totals
    gridKwh.value = calculateKwhDelta(gridReadings);
    solarKwh.value = calculateKwhDelta(solarReadings);
    aggregateData(rawReadings);
  }, (error) => {
    console.error("Error fetching electricity data:", error);
  });
  
  // Fetch top consumers data
  loadingConsumers.value = true;
  const consumersQuery = query(
    collection(db, `devices/${deviceId}/appliances`)
  );

  onSnapshot(consumersQuery, (querySnapshot) => {
    const fetchedAppliances = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fetchedAppliances.push({
        id: doc.id,
        name: data.name || 'Unknown Appliance',
        usage: data.kwhConsumed || 0,
      });
    });

    // Sort by kwh consumed in descending order
    fetchedAppliances.sort((a, b) => b.usage - a.usage);
    topConsumers.value = fetchedAppliances;
    loadingConsumers.value = false;
  }, (error) => {
    console.error("Error fetching top consumers:", error);
    loadingConsumers.value = false;
    topConsumers.value = [];
  });
};

// Listen for device ID changes to fetch and process data
watch(deviceId, (newDeviceId) => {
  if (newDeviceId) {
    fetchEnergyAndApplianceData(newDeviceId);
  } else {
    // Clear all data if no device is connected
    aggregateData([]);
    gridKwh.value = 0;
    solarKwh.value = 0;
    topConsumers.value = [];
    loadingConsumers.value = false;
  }
}, { immediate: true });


onMounted(async () => {
  // Set up the authentication state listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // If a user is logged in, fetch their profile
      fetchDeviceId(user.uid);
    } else {
      // If no user is logged in, reset the name
      userName.value = 'Guest';
    }
  });

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

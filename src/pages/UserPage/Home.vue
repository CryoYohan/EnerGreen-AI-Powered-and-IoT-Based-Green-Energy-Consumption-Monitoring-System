<template>
  <div :class="{'dark': isDarkMode}" class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
    <UserHeader />
    <Heading :title="`Welcome Back, ${userName}!`" subtitle="Here's your energy consumption overview"/>
    <MetricsCard :metrics="dailyMetrics" size="base" />

    <Dashboard />

    <ReusableBarChart
      title="Electricity Usage"
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
    <SourcesChart />
    <Tips />

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
import Tips from "@/components/UserComponents/Home/Tips.vue";
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue";
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

// Metrics data (used for MetricsCard)
const dailyMetrics = [
  {
    title: 'Current Cost',
    icon: '/src/Images/Icons/Peso.svg',
    cost: '₱12.30',
    definition: 'Current rate'
  },
  {
    title: 'Consumption',
    icon: '/src/Images/Icons/electric.svg',
    cost: '0.85 kWh',
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
    cost: '3.2 kWh',
    definition: 'Today'
  },
  {
    title: 'CO₂ Saved',
    icon: '/src/Images/Icons/leaf.svg',
    cost: '1.5 kg',
    definition: 'Today'
  },
];

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
 * Aggregates raw data into daily, weekly, monthly, and yearly usage.
 * @param {Array<object>} rawData The raw usage data from Firestore.
 */
const aggregateData = (rawData) => {
  if (!rawData || rawData.length === 0) {
    dailyData.value = [];
    weeklyData.value = [];
    monthlyData.value = [];
    yearlyData.value = [];
    return;
  }

  // Aggregate daily data (by hour)
  const hourly = {};
  rawData.forEach(item => {
    const hour = item.timestamp.getHours();
    hourly[hour] = (hourly[hour] || 0) + item.kwhConsumed;
  });
  dailyData.value = Array.from({ length: 24 }, (_, i) => ({
    label: `${i}:00`,
    value: hourly[i] || 0,
  }));

  // Aggregate weekly data (by day of the week)
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyTotal = {};
  rawData.forEach(item => {
    const day = item.timestamp.toDateString();
    dailyTotal[day] = (dailyTotal[day] || 0) + item.kwhConsumed;
  });
  weeklyData.value = weekday.map((label, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (date.getDay() - index + 7) % 7);
    const total = dailyTotal[date.toDateString()] || 0;
    return { label, value: total };
  });

  // Aggregate monthly data (by month)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTotal = {};
  rawData.forEach(item => {
    const month = item.timestamp.getMonth();
    const year = item.timestamp.getFullYear();
    const key = `${monthNames[month]}-${year}`;
    monthlyTotal[key] = (monthlyTotal[key] || 0) + item.kwhConsumed;
  });
  monthlyData.value = Object.keys(monthlyTotal).map(key => ({
    label: key.split('-')[0],
    value: monthlyTotal[key],
  }));

  // Aggregate yearly data (by year)
  const yearlyTotal = {};
  rawData.forEach(item => {
    const year = item.timestamp.getFullYear();
    yearlyTotal[year] = (yearlyTotal[year] || 0) + item.kwhConsumed;
  });
  yearlyData.value = Object.keys(yearlyTotal).map(year => ({
    label: year,
    value: yearlyTotal[year],
  }));
};

// Listen for device ID changes to fetch and process data
watch(deviceId, (newDeviceId) => {
  if (newDeviceId) {
    // Set up a real-time listener for electricity readings
    const readingsQuery = query(
      collection(db, `devices/${newDeviceId}/realtime_readings`),
      orderBy("timestamp", "desc")
    );

    onSnapshot(readingsQuery, (querySnapshot) => {
      const rawReadings = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        rawReadings.push({
          ...data,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        });
      });
      // The Firestore data is processed into the correct format for the chart.
      aggregateData(rawReadings);
    }, (error) => {
      console.error("Error fetching electricity data:", error);
    });
  } else {
    // Clear data if no device is connected
    aggregateData([]);
  }
}, { immediate: true });

// 3. Remove the dark mode watch and onMounted hooks
// watch(isDarkMode, (newValue) => { ... });
// onMounted(async () => { ... });

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
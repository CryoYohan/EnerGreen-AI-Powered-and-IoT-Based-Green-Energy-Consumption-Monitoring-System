<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] font-poppins">
    <UserHeader />
    <!-- Binds the fetched user's full name to the Heading component title -->
    <Heading :title="`Welcome Back, ${userName}!`" subtitle="Here's your energy consumption overview" />
    <MetricsCard :metrics="dailyMetrics" size="base" />
    
    <Dashboard />

    <ReusableBarChart title="Electricity Usage" :activePeriod="activePeriod"
      @update:activePeriod="activePeriod = $event" :periods="['Daily', 'Weekly', 'Monthly', 'Yearly']"
      :dailyData="dailyData" :weeklyData="weeklyData" :monthlyData="monthlyData" :yearlyData="yearlyData"
      xAxisLabel="Time" tooltipUnit="kWh" />
    <SourcesChart />
    <Tips />

    <Footer />
    <div v-if="showOnboarding" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <!-- Binds the fetched user's first name to the onboarding message -->
        <h2 class="text-xl font-semibold mb-4 text-green-600">Welcome, {{ userFirstName }}!</h2>
        <p class="text-gray-700 mb-4">This dashboard helps you track your energy usage and savings. Explore each section
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
import { ref, onMounted, computed } from "vue";
// We only need to import the services, not initialize the app again.
import { 
  auth, 
  db, 
  doc, 
  onAuthStateChanged,
  onSnapshot
} from "../../firebase.js"; 

// Import your components
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import SourcesChart from "@/components/UserComponents/Home/SourcesChart.vue";
import Tips from "@/components/UserComponents/Home/Tips.vue";
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import Dashboard from "@/components/ReusableComponents/Dashboard.vue";

// The global app ID is provided by the canvas environment.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Reactive state for user data
const userName = ref('Guest');
const userFirstName = computed(() => {
  return userName.value.split(' ')[0] || 'Guest';
});

// Fetch user profile from Firestore using onSnapshot for real-time updates
const fetchUserProfile = (userId) => {
  try {
    const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`);
    
    // Listen for real-time updates to the user profile
    onSnapshot(userProfileRef, (userProfileSnap) => {
      if (userProfileSnap.exists()) {
        const profileData = userProfileSnap.data();
        userName.value = profileData.fullName || 'Guest';
      } else {
        console.log("No user profile found!");
        userName.value = 'Guest';
      }
    }, (error) => {
      console.error("Error listening to user profile:", error);
      userName.value = 'Guest';
    });
  } catch (error) {
    console.error("Error setting up user profile listener:", error);
    userName.value = 'Guest';
  }
};

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


const activePeriod = ref("Weekly");

const dailyData = [
  { label: "12AM", value: 5 },
  { label: "2AM", value: 3 },
  { label: "4AM", value: 2 },
  { label: "6AM", value: 8 },
  { label: "8AM", value: 15 },
  { label: "10AM", value: 20 },
  { label: "12PM", value: 25 },
  { label: "2PM", value: 28 },
  { label: "4PM", value: 30 },
  { label: "6PM", value: 35 },
  { label: "8PM", value: 25 },
  { label: "10PM", value: 15 },
];

const weeklyData = [
  { label: "Mon", value: 20 },
  { label: "Tue", value: 25 },
  { label: "Wed", value: 22 },
  { label: "Thu", value: 18 },
  { label: "Fri", value: 24 },
  { label: "Sat", value: 27 },
  { label: "Sun", value: 19 },
];

const monthlyData = [
  { label: "Jan", value: 420 },
  { label: "Feb", value: 380 },
  { label: "Mar", value: 410 },
  { label: "Apr", value: 350 },
  { label: "May", value: 480 },
  { label: "Jun", value: 520 },
  { label: "Jul", value: 600 },
  { label: "Aug", value: 580 },
  { label: "Sep", value: 450 },
  { label: "Oct", value: 400 },
  { label: "Nov", value: 370 },
  { label: "Dec", value: 430 },
];

const yearlyData = [
  { label: "2025", value: 1450 },
  { label: "2026", value: 1520 },
  { label: "2027", value: 1390 },
  { label: "2028", value: 1500 },
];
const showOnboarding = ref(false);

onMounted(async () => {
  // Set up the authentication state listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // If a user is logged in, fetch their profile
      fetchUserProfile(user.uid);
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

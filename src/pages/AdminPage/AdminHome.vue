<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins">
    <AdminHeader />
    <Heading title="Admin Dashboard" subtitle="Real-time overview of your EnerGreen fleet" />
    
    <!-- Integrated Metrics Card -->
    <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="(metric, index) in dailyMetrics" 
          :key="index"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ metric.title }}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ metric.cost }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ metric.definition }}</p>
            </div>
            <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <svg 
                v-if="metric.title === 'Total devices'" 
                class="w-6 h-6 text-green-600 dark:text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
              </svg>
              <svg 
                v-else-if="metric.title === 'Active Users'" 
                class="w-6 h-6 text-blue-600 dark:text-blue-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              <svg 
                v-else-if="metric.title === 'System Health'" 
                class="w-6 h-6 text-green-600 dark:text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <svg 
                v-else-if="metric.title === 'Latest Firmware'" 
                class="w-6 h-6 text-purple-600 dark:text-purple-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <FirmwareEchoHeroes 
      :firmwareData="firmwareChartData" 
      :lastUpdate="lastFirmwareDate"
      :heroes="ecoHeroes" 
    />
    
    <div class="px-6 mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div class="space-y-3">
          <button @click="$router.push('/hardware')" class="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left group">
            <div class="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full text-emerald-600 dark:text-emerald-300 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">Register Device</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Add unit to inventory</p>
            </div>
          </button>

          <button @click="$router.push('/usermanagement')" class="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left group">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">Add User</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Create customer profile</p>
            </div>
          </button>
          
          <button @click="$router.push('/monitoring')" class="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left group">
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">View Analytics</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Check system performance</p>
            </div>
          </button>
        </div>
      </div>

      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Attention Needed</h3>
          <span v-if="attentionDevices.length > 0" class="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs font-bold rounded-full">
            {{ attentionDevices.length }} Issues
          </span>
          <span v-else class="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-bold rounded-full">
            All Systems Normal
          </span>
        </div>

        <div class="overflow-y-auto max-h-[220px] pr-2 space-y-3">
          <div v-if="attentionDevices.length === 0" class="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2 text-green-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm">No offline devices or maintenance alerts.</p>
          </div>

          <div 
            v-for="device in attentionDevices" 
            :key="device.deviceId" 
            class="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ device.deviceId }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ device.location || 'Unknown Location' }}</p>
              </div>
            </div>
            <div class="text-right">
              <span class="block text-xs font-bold" :class="device.status === 'Offline' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'">
                {{ device.status }}
              </span>
              <span class="text-xs text-gray-400">{{ formatTime(device.lastSync) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="px-6 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Recent Device Activity</h3>
          <button @click="$router.push('/hardware')" class="text-sm text-emerald-600 hover:underline">View All</button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-left">
            <thead class="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-3">Device ID</th>
                <th class="px-4 py-3">Assigned User</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Last Sync</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="device in recentDevices" :key="device.deviceId" class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ device.deviceId }}</td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ device.ownerName || 'Unassigned' }}</td>
                <td class="px-4 py-3">
                  <span :class="getStatusClass(device.status)" class="px-2 py-1 rounded-full text-xs font-semibold">
                    {{ device.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ formatTime(device.lastSync) }}</td>
              </tr>
              <tr v-if="recentDevices.length === 0">
                <td colspan="4" class="px-4 py-6 text-center text-gray-500">No recent activity.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <OverviewStatus 
      :inventoryData="inventoryChartData" 
      :statusCounts="statusCounts"
      :lastUpdate="lastFirmwareDate"
    />
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from "vue";
import { db, auth } from "@/firebase.js";
import { collection, query, onSnapshot, collectionGroup, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Components
import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import FirmwareEchoHeroes from "@/components/AdminComponents/Home/FirmwareEchoHeroes.vue";
import OverviewStatus from "@/components/AdminComponents/Home/OverviewStatus.vue";

// --- State ---
const stats = reactive({
  totalUsers: 0,
  totalDevices: 0,
  activeDevices: 0,
  systemHealth: 100
});

const firmwareReleases = ref([]);
const ecoHeroes = ref([]);
const devices = ref([]);
const recentDevices = ref([]);
const attentionDevices = ref([]);

let unsubscribeAuth = null;
let unsubscribeUsers = null;
let unsubscribeDevices = null;
let unsubscribeFirmware = null;

// --- 1. Fetch Real-Time Data ---
onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      
      // A. Users (Count)
      unsubscribeUsers = onSnapshot(query(collectionGroup(db, 'userProfile')), (snap) => {
        stats.totalUsers = snap.size;
        // Mock Heroes for now
        ecoHeroes.value = [
           { name: "John Bake", co2: "29.4 kg", img: "/src/Images/profile/pfp.png" },
           { name: "Kate Lim", co2: "18 kg", img: "/src/Images/profile/pfp.png" },
           { name: "Marc Homes", co2: "13 kg", img: "/src/Images/profile/pfp.png" },
        ];
      });

      // B. Devices (Inventory, Recent, Attention)
      unsubscribeDevices = onSnapshot(collection(db, 'devices'), (snap) => {
        const allDevices = snap.docs.map(d => d.data());
        devices.value = allDevices;
        
        stats.totalDevices = allDevices.length;
        stats.activeDevices = allDevices.filter(d => d.status === 'Active').length;
        
        if (stats.totalDevices > 0) {
          stats.systemHealth = ((stats.activeDevices / stats.totalDevices) * 100).toFixed(1);
        }

        // 1. Attention Needed (Offline or Maintenance)
        attentionDevices.value = allDevices.filter(d => 
          d.status === 'Offline' || d.status === 'Maintenance'
        );

        // 2. Recent Activity (Sort by lastSync descending)
        const sorted = [...allDevices].sort((a, b) => {
           const dateA = a.lastSync?.seconds || 0;
           const dateB = b.lastSync?.seconds || 0;
           return dateB - dateA;
        });
        recentDevices.value = sorted.slice(0, 5); // Top 5
      });

      // C. Firmware (Latest Version)
      const qFirmware = query(collection(db, 'firmware_releases'), orderBy('uploadedAt', 'desc'), limit(5));
      unsubscribeFirmware = onSnapshot(qFirmware, (snap) => {
        firmwareReleases.value = snap.docs.map(d => d.data());
      });

    }
  });
});

onUnmounted(() => {
  if (unsubscribeUsers) unsubscribeUsers();
  if (unsubscribeDevices) unsubscribeDevices();
  if (unsubscribeFirmware) unsubscribeFirmware();
  if (unsubscribeAuth) unsubscribeAuth();
});

// --- 2. Computed Props ---

const dailyMetrics = computed(() => [
  { 
    title: 'Total devices', 
    cost: stats.totalDevices.toString(), 
    definition: 'All Registered Units' 
  },
  { 
    title: 'Active Users', 
    cost: stats.totalUsers.toString(), 
    definition: 'Registered Accounts' 
  },
  { 
    title: 'System Health', 
    cost: stats.systemHealth + '%', 
    definition: 'Fleet Availability' 
  },
  { 
    title: 'Latest Firmware', 
    cost: firmwareReleases.value[0]?.version || 'v0.0.0', 
    definition: 'Current Release' 
  },
]);

const firmwareChartData = computed(() => {
  const latest = firmwareReleases.value[0]?.version || 'v1.0.0';
  return {
    labels: [latest, "Older Versions"],
    datasets: [{
      data: [85, 15], 
      backgroundColor: ["#22C55E", "#60A5FA"],
      borderWidth: 0,
      cutout: "60%"
    }]
  };
});

const lastFirmwareDate = computed(() => {
  const date = firmwareReleases.value[0]?.uploadedAt?.toDate();
  return date ? date.toLocaleDateString() : 'N/A';
});

const inventoryChartData = computed(() => {
  const plugs = devices.value.filter(d => d.type === 'Smart Plug').length;
  const panels = devices.value.filter(d => d.type === 'Solar Panel').length;
  const meters = devices.value.filter(d => d.type === 'Smart Meter').length;
  const others = devices.value.length - (plugs + panels + meters);
  
  return {
    labels: ["Smart Plugs", "Solar Panels", "Smart Meters", "Others"],
    datasets: [{
      data: [plugs, panels, meters, others],
      backgroundColor: ["#22C55E", "#60A5FA", "#EAA552", "#EA52C4"],
      borderWidth: 0,
      cutout: "60%"
    }]
  };
});

const statusCounts = computed(() => ({
  active: stats.activeDevices,
  offline: devices.value.filter(d => d.status === 'Offline').length,
  maintenance: devices.value.filter(d => d.status === 'Maintenance').length
}));

// Helpers
const getStatusClass = (status) => {
  if (status === 'Active') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (status === 'Offline') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
};

const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  if (timestamp && typeof timestamp.seconds === 'number') {
     const date = new Date(timestamp.seconds * 1000);
     return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return 'N/A';
};
</script>
<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
    <div v-if="!selectedAppliance">
      <UserHeader />
      <Heading
        title="Manage Your Appliances"
        subtitle="Manage and monitor your connected devices"
      />
   

      <ReusableBarChart
        title="Appliances Electricity Usage"
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
      <div class="container max-w-full p-4 mx-auto lg:px-12">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <div class="flex items-center gap-3 w-full sm:w-[70%]">
            <div class="relative flex-grow">
              <img
                src="/src/Images/icons/search.svg"
                alt="Search Icon"
                class="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2"
              />
              <input
                type="text"
                placeholder="Search"
                class="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-full shadow-sm focus:ring-2 dark:bg-gray-900 focus:outline-none focus:ring-[#A7F3D0]"
              />
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <img src="/src/Images/icons/Filter.svg" alt="Filter Icon" class="w-5 h-5 dar:filter dark:invert" />
              <span>Filter</span>
            </div>
          </div>
          <div class="w-full sm:w-auto flex gap-2">
            <button
              @click="startScanning"
              class="w-full sm:w-auto bg-[#059669] text-white px-4 py-2 rounded-full text-sm"
            >
              + Add Appliance
            </button>

            <button
              @click="clusterSignatures"
              class="w-full sm:w-auto bg-[#2563EB] text-white px-4 py-2 rounded-full text-sm"
              :disabled="clustering"
            >
              <span v-if="clustering">Clustering...</span>
              <span v-else>Cluster Now</span>
            </button>

            <!-- Display cluster status message -->
            <div v-if="clustering" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div class="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
                <div v-if="clusterMessage === 'Not enough unidentified signatures to form clusters. At least 2 are required.'">
                  <img src="/src/Images/gif/plug.gif" alt="pluggif" class="w-24 h-24">
                </div>
                <div v-else>
                  <div class="w-12 h-12 mb-4 border-4 border-t-4 border-[#2563EB] border-solid rounded-full animate-spin border-t-transparent"></div>
                </div>
                
                <div class="mt-2 text-sm text-center text-gray-600 dark:text-gray-300">
                  {{ clusterMessage }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
       <!-- Appliance Count Container -->
      <div class="container max-w-full p-4 mx-auto lg:px-12 mt-4">
        <div class="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm px-6 py-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200">
              Total Appliances
            </h2>
            <span class="text-2xl font-extrabold text-[#059669]">
              {{ counts.total }}
            </span>
          </div>

          <!-- Breakdown -->
          <div class="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>ON: <b class="text-green-600">{{ counts.on }}</b></span>
            <span>OFF: <b class="text-red-600">{{ counts.off }}</b></span>
          </div>
        </div>
      </div>


      <div class="container max-w-full mx-auto mt-8 flex justify-center">
        <TrainModelButton />
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center p-10 text-center text-gray-500">
        <p>Loading appliances...</p>
      </div>
      
      <div v-else-if="labeledDevices.length === 0" class="flex flex-col items-center dark:bg-gray-900 justify-center p-10 text-center text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-20 h-20 mb-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 18h.01M8.28 9.38L3 14.65V18h3.35l5.3-5.35-3.37-3.27zM16.5 6.5l-3.2 3.2m3.2-3.2l-3.2 3.2m-3.2-3.2l-3.2 3.2m-3.2-3.2l-3.2 3.2"
          />
        </svg>
        <h2 class="text-xl font-bold text-gray-800">No Appliances Found</h2>
        <p class="mt-2">It looks like you haven't added any appliances yet. Click "Add Appliance" to get started.</p>
      </div>
      
      
      <AppliancesCard
        v-else
        :devices="labeledDevices"
        @remove-device="promptDelete"
        @view-details="viewApplianceDetails"
      />

      <div class="container max-w-full p-4 mx-auto lg:px-12 mt-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">Suggested Appliances</h2>
          <button
            v-if="clusters.length > 0"
            @click="addAllSuggested"
            class="px-4 py-2 text-sm font-semibold bg-[#059669] text-white rounded-full transition-colors hover:bg-[#047857]"
          >
            Add All Suggested
          </button>
        </div>

        <div v-if="clusters.length === 0" class="text-gray-500 text-sm">
          No suggested appliances at the moment.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="cluster in clusters"
            :key="cluster.id"
            class="p-4 border text-gray-900 rounded-lg shadow-sm bg-white dark:bg-gray-800"
          >
            <h3 class="font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {{ cluster.user_label || "Unnamed Appliance" }}
            </h3>

            <p class="text-sm text-gray-500 mb-2">
              Avg Power: {{ cluster.summary?.avg_power?.toFixed(1) || 0 }} W
            </p>
            <p class="text-sm text-gray-500 mb-4">
              {{ cluster.summary?.count || 0 }} signatures grouped
            </p>

            <div v-if="cluster.status === 'unlabeled'">
              <input
                v-model="cluster.tempLabel"
                placeholder="Enter appliance name"
                class="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg mb-2"
              />
              <button
                @click="confirmClusterLabel(cluster)"
                class="px-4 py-2 text-sm bg-[#2C993A] text-white rounded hover:bg-[#248232] w-full"
              >
                Save Name
              </button>
            </div>

            <div v-else class="text-sm text-green-600 font-medium">
              ✔ Confirmed as {{ cluster.user_label }}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>

    <ApplianceDetails v-if="selectedAppliance" :device="selectedAppliance" @go-back="selectedAppliance = null" />

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-30  flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md dark:bg-gray-900">
        <div v-if="loadingSignatures" class="text-center py-10">
          <div class="relative w-24 h-24 mx-auto flex justify-center items-center mb-4">
            <div class="absolute inset-0 rounded-full bg-[#A7F3D0] opacity-30 wave-1"></div>
            <div class="absolute inset-0 rounded-full bg-[#A7F3D0] opacity-30 wave-2"></div>
            <div class="absolute inset-0 rounded-full bg-[#A7F3D0] opacity: 0.3; wave-3"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-10 h-10 text-[#2C993A] z-10"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 18a8 8 0 0 1-8-8 8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8zM9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM15 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            </svg>
          </div>
          <p class="text-lg font-semibold text-gray-700">Scanning for new appliance signatures...</p>
        </div>
        <div v-else class="dark:bg-gray">
          <h2 class="text-xl font-bold mb-2 dark:text-gray-300">Label New Appliances</h2>
          <p class="text-gray-600 mb-4">Please label the following signatures with their appliance name.</p>

          <div v-if="!deviceId" class="text-center text-gray-500 py-4">
            No device configured for this account. Please add/register your ESP32 device in the Dashboard first.
          </div>

          <div v-if="deviceId && unlabeledSignatures.length === 0" class="text-center text-gray-500 py-4">
            No new signatures to label.
          </div>
          <div v-else class="space-y-4 max-h-96 overflow-y-auto">
            <div v-for="signature in unlabeledSignatures" :key="signature.id" class="p-3 border border-gray-200 rounded">
              <p class="text-sm font-semibold break-all dark:text-gray-300 mb-2">ID: {{ signature.id }}</p>

              <p v-if="signature.ai_prediction" class="text-xs text-gray-500 mb-2">
                AI Suggestion: {{ signature.ai_prediction }}
                <span v-if="signature.confidence"> ({{ Math.round(signature.confidence * 100) }}%)</span>
              </p>

              <form @submit.prevent="updateLabel(signature.id)">
                <input
                  type="text"
                  v-model="signature.tempLabel"
                  placeholder="e.g., Coffee Maker"
                  class="w-full py-2 px-3 text-sm dark:text-gray-900 border border-gray-300 rounded-lg"
                  required
                />
                <div class="mt-3 text-right">
                  <button
                    type="submit"
                    class="px-4 py-2 text-sm bg-[#2C993A] text-white rounded hover:bg-[#248232]"
                  >
                    Save Label
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="mt-6 text-right">
          <button 
            @click="showModal = false" 
            class="px-4 py-2 text-sm dark:bg-gray-800 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full dark:bg-gray-800 max-w-sm">
        <h2 class="text-xl font-bold mb-2 dark:text-white text-gray-800">Confirm Deletion</h2>
        <p class="text-gray-600 mb-4 dark:text-white">Are you sure you want to remove this appliance?</p>
        <div class="flex justify-end gap-4">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-sm dark:text-white dark:bg-blue-400 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete(deviceToDelete)"
            :disabled="!authReady"
            class="px-4 py-2 text-sm text-white rounded"
            :class="{
              'bg-red-600 hover:bg-red-700': authReady,
              'bg-gray-400 cursor-not-allowed': !authReady
            }"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import * as applianceService from '@/services/applianceService.js';
import Swal from 'sweetalert2';

// Import Child Components
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue";
import AppliancesCard from "@/components/UserComponents/Appliances/AppliancesCard.vue";
import ApplianceDetails from "@/components/UserComponents/Appliances/ApplianceDetails.vue";
import TrainModelButton from "@/components/UserComponents/Appliances/TrainModelButton.vue";

// --- STATE ---
const { userProfile, waitForAuthReady } = useAuth('default-app-id');
const deviceId = ref(null);

const loading = ref(true);
const loadingSignatures = ref(false); // Added missing ref
const clustering = ref(false);
const clusterMessage = ref("");
const showModal = ref(false);
const showDeleteModal = ref(false);

const labeledDevices = ref([]);
const unlabeledSignatures = ref([]);
const clusters = ref([]);
const counts = ref({ total: 0, on: 0, off: 0 });
const selectedAppliance = ref(null);
const deviceToDelete = ref(null);

// --- DATA FETCHING & ACTIONS ---
const loadAllData = async () => {
  // Use the local ref deviceId.value
  if (!deviceId.value) {
    // Keep loading true if we are waiting for auth, false if we know it's empty
    return;
  }
  loading.value = true;
  try {
    const [applianceData, countData] = await Promise.all([
      applianceService.getAppliances(deviceId.value),
      applianceService.getApplianceCounts(deviceId.value)
    ]);
    
    labeledDevices.value = applianceData.labeled;
    clusters.value = applianceData.suggested;
    counts.value = countData;

  } catch (error) {
    console.error("Failed to load appliance data:", error);
  } finally {
    loading.value = false;
  }
};

const startScanning = async () => {
  if (!deviceId.value) return;
  showModal.value = true;
  loadingSignatures.value = true;
  try {
    const newSignatures = await applianceService.scanForNewSignatures(deviceId.value);
    unlabeledSignatures.value = newSignatures;
  } catch (error) {
    console.error("Scanning failed:", error);
  } finally {
    loadingSignatures.value = false;
  }
};

const clusterSignatures = async () => {
  if (!deviceId.value) return;
  clustering.value = true;
  clusterMessage.value = "Clustering signatures... please wait.";
  try {
    const result = await applianceService.triggerClustering(deviceId.value);
    clusterMessage.value = result.detail || "Clustering complete. Refreshing results...";
    await loadAllData(); // Refresh data after clustering
  } catch (err) {
    clusterMessage.value = "Clustering failed. Please try again.";
    console.error("Failed to trigger clustering:", err);
  } finally {
    setTimeout(() => { clustering.value = false; clusterMessage.value = ""; }, 4000);
  }
};

const confirmClusterLabel = async (cluster) => {
  if (!deviceId.value) return;
  try {
    await applianceService.confirmClusterLabel(deviceId.value, cluster);
    cluster.status = "labeled";
    await loadAllData(); // Refresh the main appliance list
  } catch (err) {
    console.error("Failed to label cluster:", err);
  }
};

const addAllSuggested = async () => {
  if (!deviceId.value) return;
  const promises = clusters.value
    .filter(c => c.status === 'unlabeled' && c.tempLabel)
    .map(c => applianceService.confirmClusterLabel(deviceId.value, c));
  
  await Promise.all(promises);
  await loadAllData();
};

const updateLabel = async (signatureId) => {
    // This function can be implemented if individual signature labeling is still needed
};

const promptDelete = (device) => {
  deviceToDelete.value = device;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!deviceToDelete.value || !deviceId.value) return;
  try {
    await applianceService.deleteAppliance(deviceId.value, deviceToDelete.value.id);
    await loadAllData(); // Refresh the list
    Swal.fire('Deleted!', 'The appliance has been removed.', 'success');
  } catch (error) {
    Swal.fire('Error!', 'Failed to remove the appliance.', 'error');
  } finally {
    showDeleteModal.value = false;
    deviceToDelete.value = null;
  }
};

const viewApplianceDetails = (device) => {
  selectedAppliance.value = device;
};


// --- LIFECYCLE & WATCHERS ---

// 1. WATCHER (The Key Fix)
// Watch for the user profile to load, then grab the deviceId and fetch data.
watch(() => userProfile.value, (newProfile) => {
    if (newProfile && newProfile.deviceId) {
        deviceId.value = newProfile.deviceId;
        loadAllData();
    } else {
       // Optional: Handle case where user logs out or has no device
       loading.value = false; 
    }
}, { immediate: true, deep: true });

// Mock chart data as this page doesn't fetch time-series data for it
const activePeriod = ref("Weekly");
const dailyData = ref([]);
const weeklyData = ref([]);
const monthlyData = ref([]);
const yearlyData = ref([]);
</script>


<style scoped>
/* Circular Wave Animation */
@keyframes sonar-wave {
  0% { transform: scale(0.1); opacity: 0.8; }
  70% { opacity: 0.3; }
  100% { transform: scale(2); opacity: 0; }
}
.wave-1 { animation: sonar-wave 1.5s infinite; }
.wave-2 { animation: sonar-wave 1.5s infinite; }
.wave-3 { animation: sonar-wave 1.5s infinite; }
.flex.justify-center.items-center { perspective: 1000px; }
</style>
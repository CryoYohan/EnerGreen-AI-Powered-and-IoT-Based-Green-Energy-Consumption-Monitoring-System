<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] font-poppins">
    <!-- Main Appliance List View -->
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

      <!-- Appliance Management Content -->
      <div class="container max-w-full p-4 mx-auto lg:px-12">
        <!-- Search and Add Section -->
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
                class="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:outline-none focus:ring-[#A7F3D0]"
              />
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <img src="/src/Images/icons/filter.svg" alt="Filter Icon" class="w-5 h-5" />
              <span>Filter</span>
            </div>
          </div>
          <div class="w-full sm:w-auto">
            <button
              @click="startScanning"
              class="w-full sm:w-auto bg-[#2C993A] text-white px-4 py-2 rounded-full text-sm"
            >
              + Add Appliance
            </button>
          </div>
        </div>
      </div>
      
      <!-- Appliance Cards Section -->
      <div v-if="loading" class="flex flex-col items-center justify-center p-10 text-center text-gray-500">
        <p>Loading appliances...</p>
      </div>
      <div v-else-if="labeledDevices.length === 0" class="flex flex-col items-center justify-center p-10 text-center text-gray-500">
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

      <Footer />
    </div>

    <!-- Appliance Details View -->
    <ApplianceDetails v-if="selectedAppliance" :device="selectedAppliance" @go-back="selectedAppliance = null" />

    <!-- Appliance Labeling Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
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
        <div v-else>
          <h2 class="text-xl font-bold mb-2">Label New Appliances</h2>
          <p class="text-gray-600 mb-4">Please label the following signatures with their appliance name.</p>
          <div v-if="unlabeledSignatures.length === 0" class="text-center text-gray-500 py-4">
            No new signatures to label.
          </div>
          <div v-else class="space-y-4 max-h-96 overflow-y-auto">
            <div v-for="signature in unlabeledSignatures" :key="signature.id" class="p-3 border border-gray-200 rounded">
              <p class="text-sm font-semibold break-all mb-2">ID: {{ signature.id }}</p>
              <form @submit.prevent="updateLabel(signature.id)">
                <input
                  type="text"
                  v-model="signature.tempLabel"
                  placeholder="e.g., Coffee Maker"
                  class="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg"
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
            class="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Confirm Deletion</h2>
        <p class="text-gray-600 mb-4">Are you sure you want to remove this appliance?</p>
        <div class="flex justify-end gap-4">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
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
import { ref, onMounted } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/firebase.js';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';

import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue";
import AppliancesCard from "@/components/UserComponents/Appliances/AppliancesCard.vue";
import ApplianceDetails from "@/components/UserComponents/Appliances/ApplianceDetails.vue";

// --- Global Variables ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const authToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
let userId = null;

// --- Reactive State ---
const labeledDevices = ref([]);
const unlabeledSignatures = ref([]);
const showModal = ref(false);
const showDeleteModal = ref(false);
const deviceToDelete = ref(null);
const loading = ref(true);
const loadingSignatures = ref(false);
const authReady = ref(false);
const selectedAppliance = ref(null);

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
const activePeriod = ref("Weekly");

// --- Firestore Methods ---
const getApplianceCollectionRef = () => {
  if (!userId) {
    console.error("User ID is not available.");
    return null;
  }
  return collection(db, `artifacts/${appId}/users/${userId}/appliance_signatures`);
};

const fetchApplianceSignatures = async () => {
  if (!authReady.value || !userId) {
    return;
  }
  
  loading.value = true;
  unlabeledSignatures.value = [];
  labeledDevices.value = [];

  try {
    const q = query(getApplianceCollectionRef());
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.label) {
        labeledDevices.value.push({
          id: doc.id,
          name: data.label,
          location: "N/A",
          status: "Active",
          usage: 0,
          maxUsage: 1,
          icon: "/src/images/icons/ref.svg",
        });
      } else {
        unlabeledSignatures.value.push({ id: doc.id, tempLabel: '' });
      }
    });

  } catch (error) {
    console.error("Failed to fetch or process signatures:", error);
  } finally {
    loading.value = false;
  }
};

const startScanning = async () => {
  showModal.value = true;
  loadingSignatures.value = true;

  try {
    // Placeholder data to simulate a real-world NILM scan.
    // All new signatures are initially unlabeled.
    const newSignatures = [
      { label: null, signature_data: '456-unknown-device' },
      { label: null, signature_data: '012-another-unknown' },
      { label: null, signature_data: '345-device-c' },
      { label: null, signature_data: '678-device-d' }
    ];

    const applianceCollectionRef = getApplianceCollectionRef();
    if (applianceCollectionRef) {
      for (const signature of newSignatures) {
        await addDoc(applianceCollectionRef, {
          label: signature.label,
          signature_data: signature.signature_data
        });
      }
    }
    
    // After adding the new signatures, re-fetch all signatures to update the lists.
    await fetchApplianceSignatures();

  } catch (error) {
    console.error("Scanning failed:", error);
  } finally {
    loadingSignatures.value = false;
  }
};

const updateLabel = async (signatureId) => {
  const signatureToUpdate = unlabeledSignatures.value.find(s => s.id === signatureId);
  if (!signatureToUpdate || !signatureToUpdate.tempLabel) return;
  
  try {
    await updateDoc(doc(getApplianceCollectionRef(), signatureId), {
      label: signatureToUpdate.tempLabel
    });
    
    // Remove from unlabeled list and add to labeled list
    unlabeledSignatures.value = unlabeledSignatures.value.filter(s => s.id !== signatureId);
    labeledDevices.value.push({
      id: signatureId,
      name: signatureToUpdate.tempLabel,
      location: "N/A",
      status: "Active",
      usage: 0,
      maxUsage: 1,
      icon: "/src/images/icons/ref.svg",
    });

  } catch (error) {
    console.error("Failed to update signature:", error);
  }
};

// --- New Delete Logic ---
const promptDelete = (device) => {
  // Ensure we get the ID, whether the event passed a string or an object
  const deviceId = typeof device === 'string' ? device : device.id;
  deviceToDelete.value = deviceId;
  showDeleteModal.value = true;
};

const confirmDelete = async (deviceId) => {
  if (!deviceId || !userId) {
    console.error("User ID or device ID is not available. Aborting delete operation.");
    showDeleteModal.value = false;
    deviceToDelete.value = null;
    return;
  }
  
  const applianceCollectionRef = getApplianceCollectionRef();
  if (!applianceCollectionRef) {
    console.error("Firestore collection reference is not available. Aborting delete operation.");
    showDeleteModal.value = false;
    deviceToDelete.value = null;
    return;
  }

  try {
    await deleteDoc(doc(applianceCollectionRef, deviceId));
    labeledDevices.value = labeledDevices.value.filter(d => d.id !== deviceId);
    console.log(`Device ${deviceId} successfully deleted.`);
  } catch (error) {
    console.error("Failed to remove device:", error);
  } finally {
    showDeleteModal.value = false;
    deviceToDelete.value = null;
  }
};

const viewApplianceDetails = (device) => {
  selectedAppliance.value = device;
};

// --- Lifecycle Hook ---
onMounted(() => {
  // Wait for Firebase Auth to be ready before proceeding
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      userId = user.uid;
      authReady.value = true;
      console.log(`User authenticated: ${userId}`);
      await fetchApplianceSignatures();
      unsubscribe(); // Stop listening after the first state change
    }
  });
});
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

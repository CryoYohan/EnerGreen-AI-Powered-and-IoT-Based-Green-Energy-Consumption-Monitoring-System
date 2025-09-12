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
              <img src="/src/Images/icons/filter.svg" alt="Filter Icon" class="w-5 h-5 dar:filter dark:invert" />
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
            <div v-if="clusterMessage" class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {{ clusterMessage }}
            </div>

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
            class="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800"
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
          <h2 class="text-xl font-bold mb-2">Label New Appliances</h2>
          <p class="text-gray-600 mb-4">Please label the following signatures with their appliance name.</p>

          <div v-if="!deviceId" class="text-center text-gray-500 py-4">
            No device configured for this account. Please add/register your ESP32 device in the Dashboard first.
          </div>

          <div v-if="deviceId && unlabeledSignatures.length === 0" class="text-center text-gray-500 py-4">
            No new signatures to label.
          </div>

          <div v-else class="space-y-4 max-h-96 overflow-y-auto  ">
            <div v-for="signature in unlabeledSignatures" :key="signature.id" class="p-3 border border-gray-200 rounded">
              <p class="text-sm font-semibold break-all mb-2">ID: {{ signature.id }}</p>

              <p v-if="signature.ai_prediction" class="text-xs text-gray-500 mb-2">
                AI Suggestion: {{ signature.ai_prediction }}
                <span v-if="signature.confidence"> ({{ Math.round(signature.confidence * 100) }}%)</span>
              </p>

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
            class="px-4 py-2 text-white text-sm bg-[#2C993A] rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>

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
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  addDoc,
  setDoc,              
  serverTimestamp,      
  deleteDoc,
} from 'firebase/firestore';

import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue";
import AppliancesCard from "@/components/UserComponents/Appliances/AppliancesCard.vue";
import ApplianceDetails from "@/components/UserComponents/Appliances/ApplianceDetails.vue";
import TrainModelButton from "@/components/UserComponents/Appliances/TrainModelButton.vue";

// --- Global Variables ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
let userId = null;
const deviceId = ref(null); // <-- will be discovered from user's profile

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
const clusters = ref([]); // new for suggested appliances
const clustering = ref(false); // <-- NEW: track clustering state
const clusterMessage = ref(""); // <-- NEW: status message

// --- Fetch clusters ---
const fetchClusters = async () => {
  if (!deviceId.value) return;
  try {
    const clustersRef = collection(db, `devices/${deviceId.value}/clusters`);
    const snapshot = await getDocs(clustersRef);

    clusters.value = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        user_label: data.user_label || "",
        status: data.status || "unlabeled",
        summary: data.summary || {},
        tempLabel: data.user_label || data.ai_suggestion || "", // Pre-fill with AI suggestion
      };
    });
  } catch (err) {
    console.error("Error fetching clusters:", err);
  }
};


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

// --- Helpers: dynamic references based on discovered deviceId ---
const getAppliancePredictionsRef = () => {
  if (!deviceId.value) return null;
  return collection(db, `devices/${deviceId.value}/appliance_predictions`);
};

// Fetch signatures (confirmed => labeledDevices, unidentified => unlabeledSignatures)
const fetchApplianceSignatures = async () => {
  if (!authReady.value || !userId) return;

  loading.value = true;
  unlabeledSignatures.value = [];
  labeledDevices.value = [];

  try {
    if (!deviceId.value) {
      console.warn("No deviceId found for user; fetchApplianceSignatures skipped.");
      return;
    }

    const predictionsRef = getAppliancePredictionsRef();
    if (!predictionsRef) return;

    const q = query(predictionsRef);
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Accept both 'confirmed_label' (preferred) or 'label' (legacy) fields
      const confirmedLabel = data.confirmed_label || data.label || null;

      if (data.status === "confirmed" && confirmedLabel) {
        labeledDevices.value.push({
          id: docSnap.id,
          name: confirmedLabel,
          location: "N/A",
          status: "Active",
          usage: 0,
          maxUsage: 1,
          icon: "/src/images/icons/ref.svg",
        });
      } else {
        // Unidentified / unlabeled signature - show AI suggestion if present
        unlabeledSignatures.value.push({
          id: docSnap.id,
          tempLabel: "",
          ai_prediction: data.predicted_label || "Unknown",
          confidence: data.confidence || null,
        });
      }
    });

  } catch (error) {
    console.error("Failed to fetch or process signatures:", error);
  } finally {
    loading.value = false;
  }
};

// --- Confirm appliance doc creation ---
const confirmApplianceFromCluster = async (cluster, deviceId) => {
  try {
    const confirmedRef = doc(
      db,
      `devices/${deviceId}/confirmed_appliances/${cluster.id}`
    );

    await setDoc(confirmedRef, {
      cluster_id: cluster.id,
      user_label: cluster.user_label,
      centroid: cluster.centroid || [],
      summary: cluster.summary || {},
      created_at: cluster.created_at || serverTimestamp(),
      confirmed_at: serverTimestamp(),
    });

    console.log(`✅ Confirmed appliance created: ${cluster.user_label}`);
  } catch (err) {
    console.error("Error creating confirmed appliance:", err);
  }
};

// --- Confirm cluster label (also create confirmed appliance) ---
const confirmClusterLabel = async (cluster) => {
  if (!cluster.tempLabel) return;
  try {
    const clusterRef = doc(db, `devices/${deviceId.value}/clusters`, cluster.id);
    await updateDoc(clusterRef, {
      user_label: cluster.tempLabel,
      status: "labeled",
    });

    cluster.user_label = cluster.tempLabel;
    cluster.status = "labeled";

    // ✅ Immediately create confirmed appliance document
    await confirmApplianceFromCluster(cluster, deviceId.value);

  } catch (err) {
    console.error("Failed to label cluster:", err);
  }
};

// --- Confirm all suggested clusters (bulk) ---
const addAllSuggested = async () => {
  if (!deviceId.value) return;

  const confirmPromises = clusters.value.map(async (cluster) => {
    // Only process clusters that are unlabeled and have a temporary label
    if (cluster.status === 'unlabeled' && cluster.tempLabel) {
      await confirmClusterLabel(cluster);                 // ✅ updates cluster + creates confirmed appliance
      await confirmApplianceFromCluster(cluster, deviceId.value); // ✅ redundant safety, ensures doc exists
    }
  });

  await Promise.all(confirmPromises);

  // Re-fetch appliances so main list updates
  await fetchApplianceSignatures();
};


const PREDICT_URL = import.meta.env.VITE_PREDICT_URL; 

const startScanning = async () => {
  showModal.value = true;
  loadingSignatures.value = true;

  try {
    if (!deviceId.value) {
      unlabeledSignatures.value = [];
      return;
    }

    const predictionsRef = getAppliancePredictionsRef();
    if (!predictionsRef) return;

    // Query only "unidentified" signatures (status === "unidentified")
    const q = query(predictionsRef, where("status", "==", "unidentified"));
    const snapshot = await getDocs(q);

    unlabeledSignatures.value = [];

    const predictionPromises = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();

      // Initialize the signature object
      const signatureObj = {
        id: docSnap.id,
        tempLabel: "",
        ai_prediction: null,
        confidence: null,
        readings: data.signature || [],
      };

      // Push immediately for Vue reactivity
      unlabeledSignatures.value.push(signatureObj);

      // Always call the prediction API
      try {
        const resp = await fetch(PREDICT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_id: deviceId.value,
            signature: signatureObj.readings,
          }),
        });

        const result = await resp.json();

        // Update signature object in-place (reactive)
        signatureObj.ai_prediction = result.predicted_label;
        signatureObj.confidence =
          result.predicted_probabilities?.[result.predicted_label] || null;

        // Update Firestore with new prediction and confidence
        await updateDoc(doc(predictionsRef, signatureObj.id), {
          predicted_label: signatureObj.ai_prediction,
          confidence: signatureObj.confidence,
        });
      } catch (apiError) {
        console.error("Prediction API failed for signature:", signatureObj.id, apiError);
      }
    });

    // Wait for all predictions to finish
    await Promise.all(predictionPromises);
  } catch (error) {
    console.error("Scanning failed:", error);
  } finally {
    loadingSignatures.value = false;
  }
};

const CLUSTER_URL = import.meta.env.VITE_CLUSTER_URL; // e.g. your Cloud Run service

const clusterSignatures = async () => {
  if (!deviceId.value) {
    console.error("No device configured; cannot cluster signatures.");
    return;
  }

  clustering.value = true;
  clusterMessage.value = "Clustering signatures... please wait.";

  try {
    const resp = await fetch(CLUSTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId.value })
    });

    const result = await resp.json();
    console.log("Clustering result:", result);

    if (result.detail) {
      // Show backend-provided detail message
      clusterMessage.value = result.detail;
    } else {
      clusterMessage.value = "Clustering complete. Refreshing results...";
      await fetchClusters();
      clusterMessage.value = "Suggested appliances updated successfully";
    }
  } catch (err) {
    console.error("Failed to trigger clustering:", err);
    clusterMessage.value = "Clustering failed. Please try again.";
  } finally {
    setTimeout(() => { 
      clustering.value = false;
      clusterMessage.value = "";
    }, 4000); // auto-hide after 4s
  }
};




// --- updateLabel: mark prediction as confirmed + add confirmed_label (no hardcoded user/device) ---
const updateLabel = async (signatureId) => {
  const signatureToUpdate = unlabeledSignatures.value.find(s => s.id === signatureId);
  if (!signatureToUpdate || !signatureToUpdate.tempLabel) return;

  try {
    const predictionsRef = getAppliancePredictionsRef();
    if (!predictionsRef) {
      console.error("No device configured; cannot update label.");
      return;
    }

    await updateDoc(doc(predictionsRef, signatureId), {
      status: "confirmed",
      confirmed_label: signatureToUpdate.tempLabel,
      confirmed_at: new Date()
    });

    // Update UI lists
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

// --- Delete logic (uses discovered device path) ---
const promptDelete = (device) => {
  const deviceIdLocal = typeof device === 'string' ? device : device.id;
  deviceToDelete.value = deviceIdLocal;
  showDeleteModal.value = true;
};

const confirmDelete = async (deviceIdLocal) => {
  if (!deviceIdLocal || !userId) {
    console.error("User ID or device ID is not available. Aborting delete operation.");
    showDeleteModal.value = false;
    deviceToDelete.value = null;
    return;
  }

  try {
    if (!deviceId.value) {
      console.error("No configured device for this account; cannot delete signature.");
      return;
    }
    const predictionsRef = getAppliancePredictionsRef();
    if (!predictionsRef) return;

    await deleteDoc(doc(predictionsRef, deviceIdLocal));
    labeledDevices.value = labeledDevices.value.filter(d => d.id !== deviceIdLocal);
    console.log(`Device ${deviceIdLocal} successfully deleted.`);
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

// --- discover deviceId for the signed-in user ---
// tries multiple likely locations for deviceId in user's Firestore record
const fetchUserDeviceId = async () => {
  if (!userId) return;

  try {
    // 1) try doc: artifacts/{appId}/users/{userId}
    const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'userProfile', 'profile');
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      // common field names: deviceId, primaryDeviceId, devices (array), devices_map, namedDevices
      if (data.deviceId) {
        deviceId.value = data.deviceId;
        return;
      }
      if (data.primaryDeviceId) {
        deviceId.value = data.primaryDeviceId;
        return;
      }
      if (Array.isArray(data.devices) && data.devices.length > 0) {
        // devices might be array of ids or objects with id
        const first = data.devices[0];
        deviceId.value = (typeof first === 'string') ? first : (first.deviceId || first.id || null);
        if (deviceId.value) return;
      }
    }

    // 2) try subcollection: artifacts/{appId}/users/{userId}/devices (pick first doc id or deviceId field)
    const devicesCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'devices');
    const devicesSnapshot = await getDocs(devicesCollectionRef);
    if (!devicesSnapshot.empty) {
      const firstDoc = devicesSnapshot.docs[0];
      const d = firstDoc.data();
      deviceId.value = d.deviceId || firstDoc.id || null;
      if (deviceId.value) return;
    }

    // 3) fallback - try to find any device doc in /devices that references this user (optional)
    // (omitted for now - keep minimal and non-intrusive)
    console.warn("No deviceId found in user profile. Please register device in Dashboard.");
  } catch (err) {
    console.error("Error fetching user deviceId:", err);
  }
};

// --- Lifecycle Hook ---
onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      userId = user.uid;
      authReady.value = true;
      console.log(`User authenticated: ${userId}`);

      // attempt to find this user's deviceId from Firestore
      await fetchUserDeviceId();

      // once deviceId discovery attempted, fetch existing signatures (if deviceId found)
      await fetchApplianceSignatures();

      // Fetch Clustered Unidentified Appliances
      await fetchClusters(); // NEW
      unsubscribe(); // stop listening once setup is done
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
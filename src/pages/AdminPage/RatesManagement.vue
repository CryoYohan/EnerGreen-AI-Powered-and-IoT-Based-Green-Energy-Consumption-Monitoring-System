<template>
  <div class="min-h-screen dark:bg-gray-900 min-w-screen flex flex-col bg-[#F9FAFB] font-poppins transition-colors duration-300">
    <AdminHeader />
    
    <Heading title="Rates Management" subtitle="Configure utility prices and environmental factors" />

    <div class=" mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- 1. UTILITY RATES CARD -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
               <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Electricity Rates</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">Set the cost per kWh for providers</p>
            </div>
          </div>

          <form @submit.prevent="updateUtilityRate" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
              <select v-model="utilityForm.providerId" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <option value="veco">Visayan Electric (VECO)</option>
                <option value="cebeco">CEBECO</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate (PHP / kWh)</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">₱</span>
                </div>
                <input 
                  v-model="utilityForm.rate" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  required
                  class="w-full pl-7 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div class="pt-2">
              <button 
                type="submit" 
                :disabled="loadingUtility"
                class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg v-if="loadingUtility" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                {{ loadingUtility ? 'Updating...' : 'Update Rate' }}
              </button>
            </div>
          </form>

          <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Live Rate</h4>
            <div class="flex justify-between items-end">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ getProviderName(utilityForm.providerId) }}</span>
              <span class="text-xl font-bold text-emerald-600 dark:text-emerald-400">₱{{ currentRateDisplay }}</span>
            </div>
            <div class="text-xs text-gray-400 mt-1 text-right" v-if="lastUpdatedDisplay">
              Updated: {{ lastUpdatedDisplay }}
            </div>
          </div>
        </div>

        <!-- 2. CARBON RATES CARD -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
               <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Carbon Footprint</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">Set global emission factor (kg CO₂ / kWh)</p>
            </div>
          </div>

          <form @submit.prevent="updateCarbonRate" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
              <input type="text" value="Philippines (Grid Average)" disabled class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emission Factor</label>
              <div class="relative">
                <input 
                  v-model="carbonForm.rate" 
                  type="number" 
                  step="0.0001" 
                  min="0" 
                  required
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="0.7122"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">kg/kWh</span>
                </div>
              </div>
            </div>

            <div class="pt-2">
              <button 
                type="submit" 
                :disabled="loadingCarbon"
                class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg v-if="loadingCarbon" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                {{ loadingCarbon ? 'Updating...' : 'Update Factor' }}
              </button>
            </div>
          </form>

          <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Factor</h4>
            <div class="flex justify-between items-end">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">National Grid</span>
              <span class="text-xl font-bold text-green-600 dark:text-green-400">{{ currentCarbonRate }} <span class="text-sm text-gray-500 font-normal">kg/kWh</span></span>
            </div>
             <div class="text-xs text-gray-400 mt-1 text-right" v-if="lastUpdatedCarbon">
              Updated: {{ formatDate(lastUpdatedCarbon) }}
            </div>
          </div>
        </div>

      </div>
    </div>

    <Footer />

    <!-- Notification Toast -->
    <transition name="fade">
      <div v-if="showPopup" 
        :class="['fixed top-24 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold z-50 flex items-center gap-2', 
          popupType === 'info' ? 'bg-blue-500' : popupType === 'success' ? 'bg-green-500' : 'bg-red-500']">
        <span v-if="popupType === 'success'">✅</span>
        <span v-else-if="popupType === 'error'">⚠️</span>
        <span v-else>ℹ️</span>
        {{ popupMessage }}
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue';
import { db } from '@/firebase.js';
import { doc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import api from '@/services/api';

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";

// State
const loadingUtility = ref(false);
const loadingCarbon = ref(false);
const currentRates = ref({}); // Stores rates by providerId { veco: 12.51, cebeco: 10.20 }
const lastUpdatedMap = ref({}); // Stores timestamps by providerId
const currentCarbonRate = ref('---');
const lastUpdatedCarbon = ref(null);

// Notification State
const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("info");

const utilityForm = reactive({
  providerId: 'veco', // Default
  rate: ''
});

const carbonForm = reactive({
  rate: ''
});

// --- Helpers ---
const showNotification = (message, type = "info", duration = 3000) => {
  popupMessage.value = message;
  popupType.value = type;
  showPopup.value = true;
  setTimeout(() => (showPopup.value = false), duration);
};

const getProviderName = (id) => {
  const names = { veco: 'Visayan Electric', cebeco: 'CEBECO' };
  return names[id] || id.toUpperCase();
};

const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
};

// Computed properties for the currently selected provider
const currentRateDisplay = computed(() => {
    const val = currentRates.value[utilityForm.providerId];
    return val !== undefined ? val.toFixed(2) : '---';
});

const lastUpdatedDisplay = computed(() => {
    const val = lastUpdatedMap.value[utilityForm.providerId];
    return val ? formatDate(val) : null;
});

// --- API CALLS ---
const updateUtilityRate = async () => {
  if (!utilityForm.rate) return;
  loadingUtility.value = true;
  try {
    const response = await api.post('/api/admin/update-utility-rate', {
      providerId: utilityForm.providerId,
      providerName: getProviderName(utilityForm.providerId),
      rate: utilityForm.rate
    });
    
    if (response.data.success) {
      showNotification(response.data.message, 'success');
      utilityForm.rate = ''; 
    }
  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    showNotification(msg, 'error');
  } finally {
    loadingUtility.value = false;
  }
};

const updateCarbonRate = async () => {
  if (!carbonForm.rate) return;
  loadingCarbon.value = true;
  try {
    const response = await api.post('/api/admin/update-carbon-rate', {
      rate: carbonForm.rate
    });
    
    if (response.data.success) {
      showNotification(response.data.message, 'success');
      carbonForm.rate = ''; 
    }
  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    showNotification(msg, 'error');
  } finally {
    loadingCarbon.value = false;
  }
};

// --- LISTENERS ---
let unsubUtility = null;
let unsubCarbon = null;

const subscribeToProvider = (providerId) => {
    // Unsubscribe previous listener if it exists
    if (unsubUtility) {
        unsubUtility();
        unsubUtility = null;
    }

    // Path: artifacts/default-app-id/public/data/utility_rates/{providerId}
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const rateRef = doc(db, `artifacts/${appId}/public/data/utility_rates`, providerId);
    
    unsubUtility = onSnapshot(rateRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Handle legacy 'vecoKwhRate' or standard 'kwhRate'
            const val = data.kwhRate || data.vecoKwhRate || 0;
            
            // Update the specific key in the reactive object
            currentRates.value[providerId] = val;
            lastUpdatedMap.value[providerId] = data.date_updated || data.lastUpdated;
        } else {
            currentRates.value[providerId] = 0;
            lastUpdatedMap.value[providerId] = null;
        }
    }, (error) => {
        console.error("Error listening to utility rate:", error);
    });
};

onMounted(() => {
  // 1. Initialize Utility Listener
  subscribeToProvider(utilityForm.providerId);

  // 2. Watch for dropdown changes to switch listeners
  watch(() => utilityForm.providerId, (newVal) => {
      subscribeToProvider(newVal);
  });
  
  // 3. Listen to Latest Carbon Rate
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const carbonQuery = query(
    collection(db, `artifacts/${appId}/public/data/carbon_emission_rates`),
    orderBy("date_updated", "desc"),
    limit(1)
  );
  
  unsubCarbon = onSnapshot(carbonQuery, (snap) => {
    if (!snap.empty) {
      const data = snap.docs[0].data();
      currentCarbonRate.value = data.carbonRateKg;
      lastUpdatedCarbon.value = data.date_updated;
    }
  }, (error) => {
      console.error("Error listening to carbon rate:", error);
  });
});

onUnmounted(() => {
  if (unsubUtility) unsubUtility();
  if (unsubCarbon) unsubCarbon();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; transform: translateY(0); }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
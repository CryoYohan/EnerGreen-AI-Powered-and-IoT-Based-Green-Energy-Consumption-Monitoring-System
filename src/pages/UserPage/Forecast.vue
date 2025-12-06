<template>
  <div class="min-h-screen min-w-full flex flex-col bg-gray-50 dark:bg-gray-900 font-poppins dark:text-gray-100 transition-colors duration-300">
    <UserHeader />
    
    <!-- Header Section -->
    <div class="w-full mx-auto">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Heading title="Future Energy Predictions" subtitle="AI-powered forecasts for your electricity consumption" />
        
        <button 
          @click="handlePredictNow" 
          :disabled="isPredicting"
          class="w-full mr-7 md:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 mb-4 md:mb-0"
        >
          <svg v-if="isPredicting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          {{ isPredicting ? 'Analyzing...' : 'Run AI Analysis' }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 space-y-6">

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- LEFT COLUMN: Stats & Charts (2/3 Width) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- 1. Top Stats Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Next Month -->
            <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between relative overflow-hidden group transition-all hover:shadow-md">
              <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg class="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 z-10">Next 30 Days</span>
              <div class="mt-2 flex items-baseline gap-2 z-10">
                <span class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{{ nextMonthPrediction }}</span>
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">kWh</span>
              </div>
            </div>

            <!-- Daily Total -->
            <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between relative overflow-hidden group transition-all hover:shadow-md">
              <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg class="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 z-10">Next 24 Hours</span>
              <div class="mt-2 flex items-baseline gap-2 z-10">
                <span class="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{{ nextDayPrediction }}</span>
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">kWh</span>
              </div>
            </div>
          </div>

          <!-- 2. Main Chart -->
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Consumption Trend</h3>
                <p class="text-xs text-gray-500 mt-1">Visualizing predicted usage patterns</p>
              </div>
              
              <!-- Model Toggles -->
              <div class="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg self-start sm:self-auto">
                <button 
                  @click="activeModel = 'prophet'"
                  :class="['px-4 py-1.5 text-xs font-semibold rounded-md transition-all', activeModel === 'prophet' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200']"
                  title="Best for long-term trends (requires more data)"
                >
                  Prophet
                </button>
                <button 
                  @click="activeModel = 'lightgbm'"
                  :class="['px-4 py-1.5 text-xs font-semibold rounded-md transition-all', activeModel === 'lightgbm' ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200']"
                  title="Best for short-term accuracy with current data"
                >
                  LightGBM
                </button>
              </div>
            </div>

            <!-- Chart Area -->
            <div class="w-full h-[450px] relative bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 p-2">
              <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10 backdrop-blur-[1px] rounded-lg">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-sm text-gray-500 animate-pulse">Generating forecast...</p>
              </div>
              
              <div v-if="!isLoading && !chartData.length" class="flex h-full flex-col items-center justify-center">
                <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p class="text-gray-500 text-sm font-medium">No forecast data</p>
                <p class="text-gray-400 text-xs mt-1">Run an analysis to generate charts</p>
              </div>
              
              <PredictionLineChart v-else :chartData="chartData" :activeModel="activeModel" :forecasts="forecastsForDisplay" />
            </div>

            <!-- Time Interval Selector -->
            <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 overflow-x-auto pb-2 sm:pb-0">
              <div class="flex gap-2 min-w-max sm:min-w-0">
                <button 
                  v-for="interval in ['Immediate', 'Next Hour', 'Next Day', 'Next Week', 'Next Month']" 
                  :key="interval" 
                  @click="currentInterval = interval"
                  :class="['px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap', currentInterval === interval ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800']"
                >
                  {{ interval }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Summary & Health (1/3 Width) -->
        <div class="lg:col-span-1 space-y-6">
          
          <!-- 3. Prediction Summary (Cost/Carbon) - MOVED UP for visibility -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
             <PredictionSummaryCard
              v-if="activeForecast"
              :forecast="activeForecast"
              :pesoFormatter="pesoFormatter"
              :overviewMetrics="overviewMetrics"
              :activeModel="activeModel"
              :predictionTimestamp="latestPredictionTimestamp"
            />
            <div v-else class="text-center py-8 text-gray-400 text-sm flex flex-col items-center justify-center h-[180px] border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-lg">
              <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-full mb-3">
                <svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p>Run analysis to view cost estimates.</p>
            </div>
          </div>

          <!-- 4. System Health / Anomaly Card - Compacted -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[400px]">
            <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30">
              <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                <span class="relative flex h-2 w-2">
                  <span v-if="anomalies.length > 0" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2" :class="anomalies.length > 0 ? 'bg-red-500' : 'bg-emerald-500'"></span>
                </span>
                System Health (Anomaly Detection)
              </h3>
              <span 
                class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                :class="anomalies.length > 0 ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'"
              >
                {{ anomalies.length > 0 ? `${anomalies.length} ALERTS` : 'NOMINAL' }}
              </span>
            </div>

            <div class="p-4 overflow-y-auto custom-scrollbar">
              <div v-if="anomalies.length === 0" class="h-full flex flex-col items-center justify-center text-center py-6 opacity-60">
                <div class="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-3">
                  <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">All Systems Normal</p>
                <p class="text-[11px] text-gray-500 mt-1">No irregularities detected in the last 24h.</p>
              </div>

              <div v-else class="space-y-2">
                <div v-for="alert in anomalies" :key="alert.id" class="relative pl-3 py-2 border-l-4 rounded bg-gray-50 dark:bg-gray-900/50 transition-all hover:bg-white dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700"
                  :class="alert.severity === 'High' ? 'border-l-red-500' : 'border-l-amber-500'">
                  
                  <div class="flex justify-between items-center mb-1">
                    <p class="text-[11px] font-bold uppercase tracking-tight" :class="alert.severity === 'High' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'">
                      {{ alert.type }}
                    </p>
                    <span class="text-[10px] text-gray-400 font-mono">{{ formatTime(alert.timestamp) }}</span>
                  </div>
                  
                  <p class="text-xs text-gray-700 dark:text-gray-300 leading-snug line-clamp-2">
                    {{ alert.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <Footer />
    
    <!-- Toast Notification -->
    <transition name="fade">
      <div v-if="showPopup" 
           class="fixed bottom-5 right-5 z-[100] px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 transition-all duration-300 border border-white/10 backdrop-blur-md max-w-[90vw] sm:max-w-sm"
           :class="popupType === 'info' ? 'bg-blue-600 text-white' : popupType === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'"
      >
        <span class="text-xl" v-if="popupType === 'success'">✅</span>
        <span class="text-xl" v-else-if="popupType === 'error'">⚠️</span>
        <span class="text-xl" v-else>ℹ️</span>
        <div>
          <p class="font-medium text-sm">{{ popupMessage }}</p>
        </div>
      </div>
    </transition>

  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { auth } from '../../firebase.js'; 
import { onAuthStateChanged } from 'firebase/auth';
import * as predictionService from '@/services/predictionService.js';
import { currentRate, carbonRateKg } from '@/services/predictionService.js'; // Import reactive rates

// Import UI Components
import PredictionLineChart from '@/components/UserComponents/Forecast/PredictionLineChart.vue';
import PredictionSummaryCard from '@/components/UserComponents/Forecast/PredictionSummaryCard.vue';
import Heading from '@/components/ReusableComponents/Heading.vue';
import UserHeader from '@/components/ReusableComponents/UserHeader.vue';
import Footer from '@/components/ReusableComponents/Footer.vue';

// --- Local Component State ---
const deviceId = ref(null);
const anomalies = ref([]); 
const rawPredictions = ref({ lightgbm: [], prophet: [] });
const activeModel = ref('lightgbm');
const currentInterval = ref('Next Day');
const isLoading = ref(true);
const isPredicting = ref(false);
const overviewMetrics = ref([]);
const latestPredictionTimestamp = ref(null); 

const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("info");

// --- Formatters & Helpers ---
const pesoFormatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const showNotification = (message, type = "info", duration = 3000) => {
  popupMessage.value = message;
  popupType.value = type;
  showPopup.value = true;
  setTimeout(() => (showPopup.value = false), duration);
};

// --- Computed Properties for the Template ---
const filteredPredictions = computed(() => rawPredictions.value[activeModel.value] || []);

const forecastsForDisplay = computed(() =>
  filteredPredictions.value.map(p => {
    const predictedKwh = p.predicted_consumption_kwh || 0;
    return {
      ...p,
      predicted_consumption_kwh: predictedKwh,
      predicted_cost: predictedKwh * currentRate.value,
      predicted_carbon_kg: predictedKwh * carbonRateKg.value,
    };
  })
);

const activeForecast = computed(() => forecastsForDisplay.value.find(f => f.interval === currentInterval.value) || null);

const chartData = computed(() => {
  if (!filteredPredictions.value.length) return [];
  return filteredPredictions.value.map(p => ({
    timestamp: p.prediction_for_time?.toDate ? p.prediction_for_time.toDate() : new Date(p.prediction_for_time),
    yhat: p.prediction_value_watt,
    yhat_lower: p.confidence_interval_watt?.lower,
    yhat_upper: p.confidence_interval_watt?.upper
  }));
});

const nextMonthPrediction = computed(() => {
  const pred = rawPredictions.value.lightgbm?.find(p => p.interval === 'Next Month');
  return pred ? (pred.predicted_consumption_kwh || 0).toFixed(2) : '0.00';
});

const nextDayPrediction = computed(() => {
  const pred = rawPredictions.value.lightgbm?.find(p => p.interval === 'Next Day');
  return pred ? (pred.predicted_consumption_kwh || 0).toFixed(2) : '0.00';
});

// --- Actions ---
const handlePredictNow = async () => {
  if (!deviceId.value) return;
  
  isPredicting.value = true; 
  showNotification("Generating new forecast...", "info");

  try {
    const result = await predictionService.triggerPredictionRun(deviceId.value);
    const successMsg = result?.message || "Forecast update requested successfully!";
    showNotification(successMsg, "success");
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Prediction failed";
    showNotification(`Error: ${msg}`, msg.includes("No historical data") ? "info" : "error", 5000);
  } finally {
    isPredicting.value = false;
  }
};


// --- Lifecycle & Data Subscription ---
let unsubscribeAuth = null;
let unsubscribePredictions = null;

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    if (unsubscribePredictions) unsubscribePredictions(); // Stop listening for old user's data

    if (user) {
      isLoading.value = true;
      const profile = await predictionService.getUserProfile(user.uid);
      deviceId.value = profile?.deviceId || null;
      
      if (profile?.electricityProvider) {
        await predictionService.loadContextualRates(profile.electricityProvider);
      }
      
      if (deviceId.value) {
        // Subscribe to real-time prediction updates via the service
        unsubscribePredictions = predictionService.listenToPredictions(deviceId.value, ({ data, error }) => {
          if (error) {
            console.error(error);
            showNotification(error, 'error');
            isLoading.value = false;
            return;
          }
          
          const processed = predictionService.processPredictionData(data);
          latestPredictionTimestamp.value = processed.latestPredictionTimestamp;
          rawPredictions.value = processed.rawPredictions;
          anomalies.value = processed.anomalies;
          overviewMetrics.value = processed.overviewMetrics;
          isLoading.value = false;
        });
      } else {
        isLoading.value = false;
      }
    } else {
      // User logged out
      deviceId.value = null;
      isLoading.value = false;
    }
  });
});

onUnmounted(() => {
  if (unsubscribeAuth) unsubscribeAuth();
  if (unsubscribePredictions) unsubscribePredictions();
});
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Custom scrollbar for anomaly list */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}
</style>
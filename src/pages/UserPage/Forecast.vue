<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 font-poppins dark:text-gray-100 transition-colors duration-300">
    <UserHeader />
    <Heading title="Future Energy Predictions" subtitle="AI-powered forecasts for your electricity consumption" />

    <div class="p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 mx-auto w-full">
      <!-- Main Forecast Panel -->
      <div class="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 flex flex-col transition-all duration-300 hover:shadow-2xl">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent dark:from-green-400 dark:to-blue-400">
              Consumption Forecast
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">AI-powered predictions based on your usage patterns</p>
          </div>
          
          <!-- Predict Now Button -->
          <button
            @click="handlePredictNow"
            :disabled="isLoading"
            class="px-6 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg v-if="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span v-if="!isLoading">Predict Now</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Generating...
            </span>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-col justify-center items-center h-64 space-y-4">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-green-200 dark:border-green-800 rounded-full"></div>
            <div class="w-16 h-16 border-4 border-transparent border-t-green-600 rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-400 font-medium">Analyzing your energy patterns</p>
            <p class="text-gray-500 dark:text-gray-500 text-sm mt-1">This may take a few moments...</p>
          </div>
        </div>

        <!-- No Data State -->
        <div v-else-if="!chartData.length" class="flex flex-col justify-center items-center h-64 space-y-4 text-center">
          <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <p class="text-gray-600 dark:text-gray-400 font-medium">No forecast data available</p>
            <p class="text-gray-500 dark:text-gray-500 text-sm mt-1">Click "Predict Now" to generate your first forecast</p>
          </div>
        </div>

        <!-- Chart Section -->
        <div v-else class="space-y-6">
          <PredictionLineChart
            :chartData="chartData"
            :activeModel="activeModel"
            :forecasts="forecastsForDisplay"
          />

          <!-- Quick Stats -->
          <div v-if="activeForecast" class="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl border border-green-100 dark:border-gray-600">
            <div class="text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">Estimated Cost</p>
              <p class="text-xl font-bold text-green-700 dark:text-green-300">{{ pesoFormatter.format(activeForecast.predicted_cost) }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">Carbon Impact</p>
              <p class="text-xl font-bold text-blue-700 dark:text-blue-300">{{ activeForecast.predicted_carbon_kg.toFixed(2) }} kg</p>
            </div>
          </div>
        </div>

        <!-- Interval Selector -->
        <div class="mt-6">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Time Interval</h4>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="interval in ['Immediate', 'Next Hour', 'Next Day', 'Next Week', 'Next Month']"
              :key="interval"
              @click="currentInterval = interval"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2',
                currentInterval === interval
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md border-green-500 scale-105'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600 border-transparent hover:border-green-200 dark:hover:border-gray-500'
              ]"
            >
              {{ interval }}
            </button>
          </div>
        </div>

        <!-- Model Selector -->
        <div class="mt-6">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">AI Model</h4>
          <div class="flex flex-wrap gap-3">
            <button
              @click="activeModel = 'prophet'"
              :class="[
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 flex items-center gap-2',
                activeModel === 'prophet'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg border-blue-500 scale-105'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-600 border-transparent hover:border-blue-200 dark:hover:border-gray-500'
              ]"
            >
              <div class="w-2 h-2 rounded-full bg-current"></div>
              Prophet (with Confidence)
            </button>
            <button
              @click="activeModel = 'lightgbm'"
              :class="[
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 flex items-center gap-2',
                activeModel === 'lightgbm'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg border-purple-500 scale-105'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-600 border-transparent hover:border-purple-200 dark:hover:border-gray-500'
              ]"
            >
              <div class="w-2 h-2 rounded-full bg-current"></div>
              LightGBM
            </button>
          </div>
        </div>
      </div>

      <!-- Sidebar Cards -->
      <div class="lg:col-span-1 flex flex-col gap-6">
        <PredictionSummaryCard
          v-if="activeForecast"
          :forecast="activeForecast"
          :pesoFormatter="pesoFormatter"
          :overviewMetrics="overviewMetrics"
          :activeModel="activeModel"
        />
      </div>

      <!-- Insights Section -->
      <section
        v-if="insights.length"
        class="lg:col-span-3 mt-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:shadow-2xl"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">
            Smart Insights
          </h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(insight, idx) in insights"
            :key="idx"
            class="p-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:border-green-200 dark:hover:border-green-400 transition-all duration-300"
          >
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{{ insight }}</p>
            </div>
          </div>
        </div>
      </section>

    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { auth, db, doc, collection, query, orderBy, limit, getDocs, onAuthStateChanged, onSnapshot } from '../../firebase.js';
import PredictionLineChart from '@/components/UserComponents/Forecast/PredictionLineChart.vue';
import PredictionSummaryCard from '@/components/UserComponents/Forecast/PredictionSummaryCard.vue';
import Heading from '@/components/ReusableComponents/Heading.vue';
import UserHeader from '@/components/ReusableComponents/UserHeader.vue';
import Footer from '@/components/ReusableComponents/Footer.vue';
import MetricsCard from '@/components/ReusableComponents/MetricsCard.vue';

const userName = ref('Guest');
const deviceId = ref(null);
const rawPredictions = ref({ lightgbm: [], prophet: [] });
const activeModel = ref('prophet');
const currentInterval = ref('Next Day');
const isLoading = ref(true);
const currentRate = ref(0); // ₱ per kWh
const carbonRateKg = ref(0.7); // fallback default
const overviewMetrics = ref([]); // ✅ fixed

// Pesos formatter
const pesoFormatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

// Computed
const filteredPredictions = computed(() => rawPredictions.value[activeModel.value] || []);
const forecastsForDisplay = computed(() =>
  filteredPredictions.value.map(p => {
    const predictedKwh = p.predicted_consumption_kwh || ((p.prediction_value_watt * p.hours_in_interval) / 1000);
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

const insights = computed(() => {
  if (!forecastsForDisplay.value.length) return [];

  return forecastsForDisplay.value.map(f => {
    let trendText = f.trend_vs_baseline_percent > 0
      ? `⚠️ ${f.trend_vs_baseline_percent.toFixed(2)}% higher than your baseline`
      : `✅ ${Math.abs(f.trend_vs_baseline_percent).toFixed(2)}% lower than your baseline`;

    return `Your ${f.interval} forecast is ${trendText}. 
      Expected cost: ${pesoFormatter.format(f.predicted_cost)}. 
      Estimated CO₂: ${f.predicted_carbon_kg.toFixed(2)} kg.`;
  });
});

// Get logged-in user's deviceId
const fetchDeviceId = (userId) => {
  const userProfileRef = doc(db, `artifacts/default-app-id/users/${userId}/userProfile/profile`);
  onSnapshot(userProfileRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      deviceId.value = data.deviceId || null;
      userName.value = data.fullName || 'Guest';
    } else {
      deviceId.value = null;
      userName.value = 'Guest';
    }
  }, (err) => console.error(err));
};

// Trigger Cloud Run with Firebase token
const triggerPredictionRun = async (deviceId) => {
  if (!deviceId) return;
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not logged in");
    }

    // 🔑 Get Firebase ID token for logged in user
    const token = await user.getIdToken();

    const body = JSON.stringify({ deviceId });
    console.log("Triggering prediction run with body:", body);

    const response = await fetch(import.meta.env.VITE_FORECAST_URL, {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // 👈 attach token
      },
      body
    });

    if (!response.ok) {
      throw new Error(`Cloud Run error: ${response.status} ${response.statusText}`);
    }

    console.log("Prediction triggered successfully");
  } catch (err) {
    console.error("Error triggering prediction run:", err);
    throw err;
  }
};

let predictionsUnsubscribe = null;

const listenToPredictions = (id) => {
  if (predictionsUnsubscribe) predictionsUnsubscribe();
  if (!id) return;

  isLoading.value = true;

  // 👉 fetch 2 docs: latest + previous
  const predictionsQuery = query(
    collection(db, `devices/${id}/predictions`),
    orderBy("timestamp", "desc"),
    limit(2)
  );

  predictionsUnsubscribe = onSnapshot(
    predictionsQuery,
    (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data());
        const latest = docs[0];
        const previous = docs[1];

        console.log("Latest prediction doc:", latest);
        if (previous) console.log("Previous prediction doc:", previous);

        rawPredictions.value = latest.predictions || { lightgbm: [], prophet: [] };

        // Fallback for hours_in_interval
        const addHours = (preds) =>
          preds.map(p => {
            let hours = 0;
            switch (p.interval) {
              case "Immediate": hours = 1 / 60; break;
              case "Next Hour": hours = 1; break;
              case "Next Day": hours = 24; break;
              case "Next Week": hours = 24 * 7; break;
              case "Next Month": hours = 24 * 30; break;
            }
            return { ...p, hours_in_interval: hours };
          });
        rawPredictions.value.lightgbm = addHours(rawPredictions.value.lightgbm);
        rawPredictions.value.prophet = addHours(rawPredictions.value.prophet);

        // ✅ Metrics with trend vs previous
        if (latest.metrics) {
          const m = latest.metrics;
          const prev = previous?.metrics || {};

          overviewMetrics.value = [
            {
              label: "Baseline Consumption",
              value: `${m.baseline_consumption?.toFixed(2)} kWh`,
              description: "Your average energy use used as the baseline for predictions.",
              trend: prev.baseline_consumption
                ? `${((m.baseline_consumption - prev.baseline_consumption) / prev.baseline_consumption * 100).toFixed(2)}% vs last run`
                : null
            },
            {
            label: "Model Accuracy (LightGBM)",
            value: `${((m.lightgbm_accuracy ?? 0) * 100).toFixed(2)}%`,
            description: "How accurate the LightGBM machine learning model is on past data.",
            trend: prev.lightgbm_accuracy
              ? `${(((m.lightgbm_accuracy ?? 0) - (prev.lightgbm_accuracy ?? 0)) * 100).toFixed(2)}% vs last run`
              : null
          },
          {
            label: "Model Accuracy (Prophet)",
            value: `${((m.prophet_accuracy ?? 0) * 100).toFixed(2)}%`,
            description: "How accurate the Prophet forecasting model is on past data.",
            trend: prev.prophet_accuracy
              ? `${(((m.prophet_accuracy ?? 0) - (prev.prophet_accuracy ?? 0)) * 100).toFixed(2)}% vs last run`
              : null
          },
          {
            label: "Carbon Rate",
            value: `${carbonRateKg.value.toFixed(2)} kg/kWh`,
            description: "Estimated CO₂ emissions per kWh of electricity used."
            },
            {
              label: "Utility Rate",
              value: pesoFormatter.format(currentRate.value),
              description: "Your current electricity rate from VECO."
            }
          ];
        } else {
          overviewMetrics.value = [];
        }
      } else {
        rawPredictions.value = { lightgbm: [], prophet: [] };
        overviewMetrics.value = [];
      }
      isLoading.value = false;
    },
    (err) => {
      console.error("Error listening to predictions:", err);
      rawPredictions.value = { lightgbm: [], prophet: [] };
      overviewMetrics.value = [];
      isLoading.value = false;
    }
  );
};

watch(deviceId, (id) => { if (id) listenToPredictions(id); }, { immediate: true });

// Lifecycle
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) fetchDeviceId(user.uid);
    else { userName.value = 'Guest'; deviceId.value = null; }
  });
  fetchCarbonRate();
  fetchUtilityRate();
});

// Carbon rate
const fetchCarbonRate = async () => {
  try {
    const q = query(
      collection(db, "artifacts/default-app-id/public/data/carbon_emission_rates"),
      orderBy("date_updated", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      carbonRateKg.value = snapshot.docs[0].data().carbonRateKg;
    }
  } catch (err) {
    console.error("Error fetching carbon rate:", err);
  }
};

// Utility rate
const fetchUtilityRate = () => {
  const rateRef = doc(db, "artifacts/default-app-id/public/data/utility_rates/veco");
  onSnapshot(rateRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      currentRate.value = data.vecoKwhRate || 0;
    } else {
      console.warn("No VECO rate document found!");
      currentRate.value = 0;
    }
  }, (error) => {
    console.error("Error fetching VECO rate:", error);
    currentRate.value = 0;
  });
};

// Button action
const handlePredictNow = async () => {
  if (!deviceId.value) return;
  isLoading.value = true;   // ✅ Show spinner immediately
  try {
    await triggerPredictionRun(deviceId.value);
  } catch (err) {
    console.error(err);
  } finally {
    // ⚡ Don't reset isLoading here
    // Firestore listener (listenToPredictions) will set isLoading = false once new predictions arrive
  }
};
</script>
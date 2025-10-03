<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
    <UserHeader />
    <Heading title="Future Energy Predictions" subtitle="Forecasts for your electricity consumption" />

    <div class="p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Forecast Chart & Controls -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Consumption Forecast</h3>
          <!-- Predict Now Button -->
          <button
            @click="handlePredictNow"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">Predict Now</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Predicting...
            </span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col justify-center items-center h-48 space-y-3">
          <svg class="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <p class="text-gray-500 dark:text-gray-400">Loading predictions...</p>
        </div>

        <!-- No Data -->
        <div v-else-if="!chartData.length" class="flex justify-center items-center h-48">
          <p class="text-gray-500 dark:text-gray-400">No sufficient data for forecast chart.</p>
        </div>

        <!-- Chart -->
        <PredictionLineChart
          v-else
          :chartData="chartData"
          :activeModel="activeModel"
          :forecasts="forecastsForDisplay"
        />

        <!-- Interval Buttons -->
        <div class="mt-4 flex flex-wrap gap-2 justify-center">
          <button
            v-for="interval in ['Immediate', 'Next Hour', 'Next Day', 'Next Week', 'Next Month']"
            :key="interval"
            @click="currentInterval = interval"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
              currentInterval === interval
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-gray-600'
            ]"
          >
            {{ interval }}
          </button>
        </div>

        <!-- Model Buttons -->
        <div class="mt-6 flex flex-wrap gap-2 justify-center">
          <button
            @click="activeModel = 'prophet'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
              activeModel === 'prophet'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-600'
            ]"
          >
            Prophet (with Confidence)
          </button>
          <button
            @click="activeModel = 'lightgbm'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
              activeModel === 'lightgbm'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-gray-600'
            ]"
          >
            LightGBM
          </button>
        </div>

        <!-- Future Cost and Emission -->
        <div v-if="activeForecast" class="mt-4 flex flex-col items-center">
          <div class="text-lg font-medium">
            Future Cost: <span class="text-green-700 dark:text-green-300">{{ pesoFormatter.format(activeForecast.predicted_cost) }}</span>
          </div>
          <div class="text-lg font-medium">
            Future Carbon Emission: <span class="text-blue-700 dark:text-blue-300">{{ activeForecast.predicted_carbon_kg.toFixed(2) }} kg</span>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="lg:col-span-1 flex flex-col gap-6">
        <PredictionSummaryCard
          v-if="activeForecast"
          :forecast="activeForecast"
          :pesoFormatter="pesoFormatter"
          :overviewMetrics="overviewMetrics"
          :activeModel="activeModel"
        />
        <MetricsCard :metrics="overviewMetrics" size="sm" />
      </div>

      <!-- Insights -->
      <section
        v-if="insights.length"
        class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Smart Insights
        </h3>
        <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li v-for="(insight, idx) in insights" :key="idx">{{ insight }}</li>
        </ul>
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

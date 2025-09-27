<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
    <UserHeader />
    <Heading title="Future Energy Predictions" subtitle="Forecasts for your electricity consumption" />

    <div class="p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Forecast Chart & Controls -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Consumption Forecast</h3>
          <button
            @click="handlePredictNow"
            class="px-4 py-2 text-sm font-medium rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white shadow-md transition"
          >
            Predict Now
          </button>
        </div>

        <div v-if="isLoading" class="flex justify-center items-center h-48">
          <p class="text-gray-500 dark:text-gray-400">Loading predictions...</p>
        </div>

        <div v-else-if="!chartData.length" class="flex justify-center items-center h-48">
          <p class="text-gray-500 dark:text-gray-400">No sufficient data for forecast chart.</p>
        </div>

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
          :modelAccuracy="{ lightgbm: 0.98, prophet: 0.85 }"
          :activeModel="activeModel"
        />
        <MetricsCard :metrics="overviewMetrics" size="sm" />
      </div>
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
const overviewMetrics = ref([]);


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
    timestamp: p.prediction_for_time.toDate ? p.prediction_for_time.toDate() : new Date(p.prediction_for_time),
    yhat: p.prediction_value_watt,
    yhat_lower: p.confidence_interval_watt?.lower,
    yhat_upper: p.confidence_interval_watt?.upper
  }));
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

// Optionally trigger Cloud Run to generate predictions
const triggerPredictionRun = async (deviceId) => {
  if (!deviceId) return;
  try {
    const token = await fetch('/__/auth/identityToken').then(res => res.text()); // Or use gcloud auth token in dev
    await fetch("https://daily-prediction-runner-91407391585.us-central1.run.app", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ deviceId })
    });
  } catch (err) {
    console.error("Error triggering prediction run:", err);
  }
};

let predictionsUnsubscribe = null;

const listenToPredictions = (id) => {
  if (predictionsUnsubscribe) predictionsUnsubscribe(); // Clean up previous listener
  if (!id) return;

  isLoading.value = true;
  const predictionsQuery = query(
    collection(db, `devices/${id}/predictions`),
    orderBy("timestamp", "desc"),
    limit(1)
  );
  predictionsUnsubscribe = onSnapshot(predictionsQuery, (snapshot) => {
    if (!snapshot.empty) {
      const latest = snapshot.docs[0].data();
      console.log("Latest prediction doc:", latest);
      rawPredictions.value = latest.predictions || { lightgbm: [], prophet: [] };

      // Add hours_in_interval fallback
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
    } else {
      rawPredictions.value = { lightgbm: [], prophet: [] };
    }
    isLoading.value = false;
  }, (err) => {
    console.error("Error listening to predictions:", err);
    rawPredictions.value = { lightgbm: [], prophet: [] };
    isLoading.value = false;
  });
};

// Update watcher to use the new function
watch(deviceId, (id) => { if (id) listenToPredictions(id); }, { immediate: true });

// Lifecycle
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) fetchDeviceId(user.uid);
    else { userName.value = 'Guest'; deviceId.value = null; }
  });
  fetchCarbonRate();    // <-- Add this
  fetchUtilityRate();   // <-- Add this
});

// Fetch the latest Carbon Emission rate (kg CO2 per kWh)
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

// Fetch the latest Utility Rate (₱ per kWh)
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
</script>


<style scoped>
/* Optional styles */
</style>

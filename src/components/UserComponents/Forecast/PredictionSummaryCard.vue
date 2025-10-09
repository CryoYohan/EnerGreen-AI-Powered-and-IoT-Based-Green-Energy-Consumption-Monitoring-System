<template>
  <div
    class="bg-white h-full dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-800"
  >
    <!-- Header -->
    <div class="flex items-center justify-between w-full mb-6">
      <div class="flex items-center space-x-3">
        <div class="h-3 w-3 rounded-full bg-blue-500"></div>
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {{ forecast.interval }} Forecast
        </h3>
      </div>

      <!-- Dynamic Model Accuracy -->
      <div class="flex items-center text-sm font-medium bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
        <span class="mr-2 text-gray-500 dark:text-gray-400">Accuracy:</span>
        <span
          class="font-bold"
          :class="accuracyClass"
        >
          {{ modelAccuracyValue }}
        </span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 space-y-6">
      <!-- Main Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Predicted Usage -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
          <div class="flex items-center space-x-3">
            <div class="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
              <img
                src="/src/Images/Icons/electric.svg"
                alt="Energy Icon"
                class="h-6 w-6 dark:invert"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Predicted Usage</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {{ forecast.predicted_consumption_kwh.toFixed(3) }} kWh
              </p>
            </div>
          </div>
        </div>

        <!-- CO₂ Equivalent -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4">
          <div class="flex items-center space-x-3">
            <div class="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
              <img
                src="/src/Images/Icons/leaf.svg"
                alt="Leaf Icon"
                class="h-6 w-6 dark:invert"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">CO₂ Equivalent</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {{ forecast.predicted_carbon_kg.toFixed(2) }} kg
              </p>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Carbon Rate: <b>{{ carbonRate }}</b>
          </p>
        </div>
      </div>

      <!-- Estimated Cost -->
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
        <div class="flex items-center space-x-3">
          <div class="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <img
              src="/src/Images/Icons/Peso.svg"
              alt="Peso Icon"
              class="h-6 w-6 dark:invert"
            />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Estimated Cost</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {{ pesoFormatter.format(forecast.predicted_cost) }}
            </p>
          </div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Based on utility rate: <b>{{ utilityRate }}</b>
        </p>
      </div>

      <!-- Trend vs Baseline -->
      <div
        v-if="forecast.trend_vs_baseline_percent !== null"
        class="w-full pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <p class="text-gray-600 dark:text-gray-300 font-medium">
            Trend vs. Baseline:
          </p>
          <div
            class="flex items-center px-3 py-1.5 rounded-full"
            :class="{
              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300': forecast.trend_vs_baseline_percent <= 0,
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300': forecast.trend_vs_baseline_percent > 0
            }"
          >
            <svg
              v-if="forecast.trend_vs_baseline_percent > 0"
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 8.707a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <p class="font-bold text-sm ml-1">
              {{ Math.abs(forecast.trend_vs_baseline_percent).toFixed(2) }}%
            </p>
          </div>
        </div>
      </div>

      <!-- Confidence Interval -->
      <div
        v-if="activeModel === 'prophet' && forecast.confidence_interval_watt"
        class="w-full pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between mb-2">
          <p class="text-gray-600 dark:text-gray-300 font-medium">
            Confidence Interval (95%):
          </p>
          <div class="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
            {{ forecast.confidence_interval_watt.lower.toFixed(2) }} - {{ forecast.confidence_interval_watt.upper.toFixed(2) }} W
          </div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          This is the range where the true value is expected to fall.
        </p>
      </div>

      <!-- Additional Info Section to Fill Space -->
      <div class="w-full pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-sm">
          <div class="text-gray-500 dark:text-gray-400">
            <p>Forecast Model</p>
            <p class="font-semibold text-gray-700 dark:text-gray-300 capitalize">{{ activeModel }}</p>
          </div>
          <div class="text-gray-500 dark:text-gray-400 text-right">
            <p>Last Updated</p>
            <p class="font-semibold text-gray-700 dark:text-gray-300">{{ formattedDateTime }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import Plotly from "plotly.js-dist-min";

const props = defineProps({
  forecast: { type: Object, required: true },
  pesoFormatter: { type: Object, required: true },
  overviewMetrics: { type: Array, required: true },
  activeModel: { type: String, required: true },
  predictionTimestamp: { type: [Object, Date, null], default: null }, // 👈 ADD THIS PROP
});

const formattedDateTime = computed(() => {
  if (!props.predictionTimestamp) {
    return "No data";
  }
  
  try {
    // Handle Firestore Timestamp objects
    const date = props.predictionTimestamp.toDate 
      ? props.predictionTimestamp.toDate() 
      : new Date(props.predictionTimestamp);
    
    return date.toLocaleString([], { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error("Error formatting prediction timestamp:", error);
    return "Invalid date";
  }
});


// Update time every minute
onMounted(() => {
  setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, 60000);
});


const getMetric = (label) =>
  props.overviewMetrics.find((m) => m.label === label)?.value || "N/A";

const modelAccuracyValue = computed(() => {
  const key =
    props.activeModel === "prophet"
      ? "Model Accuracy (Prophet)"
      : "Model Accuracy (LightGBM)";
  return getMetric(key);
});

const accuracyClass = computed(() =>
  props.activeModel === "prophet" ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400"
);

const carbonRate = computed(() => getMetric("Carbon Rate"));
const utilityRate = computed(() => getMetric("Utility Rate"));
</script>
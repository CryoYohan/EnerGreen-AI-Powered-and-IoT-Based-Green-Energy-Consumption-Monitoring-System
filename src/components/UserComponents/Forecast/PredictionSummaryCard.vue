<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start space-y-4 transition-transform duration-300 transform hover:scale-[1.01]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between w-full mb-2">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">
        {{ forecast.interval }} Forecast
      </h3>

      <!-- Dynamic Model Accuracy -->
      <div class="flex items-center text-sm font-medium">
        <span class="mr-2 text-gray-500 dark:text-gray-400">Model Accuracy:</span>
        <span
          class="font-bold"
          :class="accuracyClass"
        >
          {{ modelAccuracyValue }}
        </span>
      </div>
    </div>

    <!-- Predicted Usage -->
    <div class="flex items-center space-x-3">
      <img
        src="/src/Images/Icons/electric.svg"
        alt="Energy Icon"
        class="h-8 w-8 dark:invert"
      />
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Predicted Usage</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {{ forecast.predicted_consumption_kwh.toFixed(3) }} kWh
        </p>
      </div>
    </div>

    <!-- Sparkline -->
    <div class="w-full h-20">
      <div ref="sparklineDiv" class="w-full h-full"></div>
    </div>

    <!-- Estimated Cost -->
    <div class="flex items-center space-x-3">
      <img
        src="/src/Images/Icons/Peso.svg"
        alt="Peso Icon"
        class="h-8 w-8 dark:invert"
      />
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Estimated Cost</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {{ pesoFormatter.format(forecast.predicted_cost) }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Based on utility rate: <b>{{ utilityRate }}</b>
        </p>
      </div>
    </div>

    <!-- Carbon Equivalent -->
    <div class="flex items-center space-x-3">
      <img
        src="/src/Images/Icons/leaf.svg"
        alt="Leaf Icon"
        class="h-8 w-8 dark:invert"
      />
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">CO₂ Equivalent</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {{ forecast.predicted_carbon_kg.toFixed(2) }} kg
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Carbon Rate: <b>{{ carbonRate }}</b>
        </p>
      </div>
    </div>

    <!-- Trend vs Baseline -->
    <div
      v-if="forecast.trend_vs_baseline_percent !== null"
      class="w-full pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center space-x-2">
        <p class="text-gray-600 dark:text-gray-300 font-medium">
          Trend vs. Baseline:
        </p>
        <div
          class="flex items-center"
          :class="{
            'text-green-600': forecast.trend_vs_baseline_percent <= 0,
            'text-red-600': forecast.trend_vs_baseline_percent > 0
          }"
        >
          <svg
            v-if="forecast.trend_vs_baseline_percent > 0"
            class="w-5 h-5"
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
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 8.707a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="font-bold text-lg ml-1">
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
      <p class="text-gray-600 dark:text-gray-300 font-medium mb-1">
        Confidence Interval (95%):
      </p>
      <p class="text-lg font-semibold text-gray-900 dark:text-gray-50">
        {{ forecast.confidence_interval_watt.lower.toFixed(2) }} -
        {{ forecast.confidence_interval_watt.upper.toFixed(2) }} W
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        This is the range where the true value is expected to fall.
      </p>
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
});

// Sparkline
const sparklineDiv = ref(null);
const renderSparkline = () => {
  if (!sparklineDiv.value || !props.forecast.history) return;

  const xValues = props.forecast.history.map((p) => new Date(p.timestamp));
  const yValues = props.forecast.history.map((p) => p.predicted_consumption_kwh);

  const trace = {
    x: xValues,
    y: yValues,
    type: "scatter",
    mode: "lines",
    line: {
      color:
        props.activeModel === "prophet"
          ? "rgb(59, 130, 246)"
          : "rgb(147, 51, 234)",
      shape: "spline",
    },
    hoverinfo: "none",
  };

  const layout = {
    margin: { t: 2, b: 2, l: 2, r: 2 },
    xaxis: { visible: false },
    yaxis: { visible: false },
    height: 60,
    width: "100%",
  };

  Plotly.react(sparklineDiv.value, [trace], layout, {
    displayModeBar: false,
    responsive: true,
  });
};

onMounted(() => renderSparkline());
watch(() => [props.forecast, props.activeModel], () => renderSparkline(), { deep: true });

// ---- Derived Metrics ----
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

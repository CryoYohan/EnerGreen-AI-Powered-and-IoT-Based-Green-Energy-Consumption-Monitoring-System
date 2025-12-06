<template>
  <div class="p-4 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
    <div class=" mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Input Panel -->
      <div id="simulation-inputs" class="lg:col-span-1 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
        <!-- Header -->
        <div class="flex items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg mr-4">
            <i class="fas fa-sliders-h text-green-600 dark:text-green-400 text-lg"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Your Inputs</h3>
        </div>

        <!-- Monthly Bill Input -->
        <div id="monthly-bill-input" class="mb-8">
          <div class="flex items-center justify-between mb-3">
            <label for="monthly-bill" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Average Monthly Bill (PHP)
            </label>
            <div class="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
              <i class="fas fa-bolt mr-1"></i>Required
            </div>
          </div>
          <div class="relative">
            <input type="number" id="monthly-bill" v-model.number="avgMonthlyBill"
              class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
              placeholder="e.g., 5000" />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="fas fa-file-invoice-dollar text-gray-400"></i>
            </div>
          </div>
        </div>

        <!-- System Size Slider -->
        <div id="system-size-slider" class="mb-8">
          <div class="flex items-center justify-between mb-3">
            <label for="system-size" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Solar System Size (kWp)
            </label>
            <div class="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
              <i class="fas fa-sliders mr-1"></i>Adjustable
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
            <input type="range" id="system-size" v-model.number="systemSizeKw" min="1.5" max="20" step="0.5"
              class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb" />

            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>1.5 kWp</span>
              <span>10 kWp</span>
              <span>20 kWp</span>
            </div>

            <div class="text-center mt-4">
              <div class="inline-flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
                <i class="fas fa-solar-panel text-green-500 mr-2"></i>
                <span class="text-xl font-bold text-gray-800 dark:text-white">{{ systemSizeKw }} kWp</span>
              </div>
            </div>
          </div>
        </div>

        <!-- System Cost Input -->
        <div class="mb-2">
          <div class="flex items-center justify-between mb-3">
            <label for="system-cost" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Estimated System Cost (PHP)
            </label>
            <div class="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
              <i class="fas fa-edit mr-1"></i>Editable
            </div>
          </div>
          <div class="relative">
            <input type="number" id="system-cost" v-model.number="estimatedSystemCost"
              class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200" />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="fas fa-peso-sign text-gray-400"></i>
            </div>
          </div>
          <div class="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <i class="fas fa-info-circle mr-1.5"></i>
            <span>We estimated this, but you can override it.</span>
          </div>
        </div>
      </div>

      <!-- Savings Panel -->
      <div id="simulation-results" class="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <!-- Header -->
        <div class="flex items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
            <i class="fas fa-chart-line text-blue-600 dark:text-blue-400 text-lg"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Your Estimated Savings</h3>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 text-center shadow-sm">
            <div class="flex items-center justify-center mb-2">
              <i class="fas fa-piggy-bank text-blue-500 mr-2"></i>
              <div class="text-sm font-medium text-blue-600 dark:text-blue-300">Monthly Savings</div>
            </div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ pesoFormatter.format(monthlySavingsPhp) }}
            </div>
          </div>
          <div class="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700 text-center shadow-sm">
            <div class="flex items-center justify-center mb-2">
              <i class="fas fa-file-invoice text-green-500 mr-2"></i>
              <div class="text-sm font-medium text-green-600 dark:text-green-300">New Monthly Bill</div>
            </div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ pesoFormatter.format(newMonthlyBillPhp) }}
            </div>
          </div>
          <div class="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-700 text-center shadow-sm">
            <div class="flex items-center justify-center mb-2">
              <i class="fas fa-calendar-alt text-amber-500 mr-2"></i>
              <div class="text-sm font-medium text-amber-600 dark:text-amber-400">Payback Period</div>
            </div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ paybackPeriodYears.toFixed(1) }} <span class="text-xl">years</span>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
            <h4 class="text-lg font-semibold text-center mb-4 text-gray-800 dark:text-white">Bill Comparison</h4>
            <div class="h-64 relative">
              <Bar :data="billChartData" :options="chartOptions" />
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
            <h4 class="text-lg font-semibold text-center mb-4 text-gray-800 dark:text-white">New Energy Mix</h4>
            <div class="h-64 relative">
              <Doughnut :data="mixChartData" :options="doughnutOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class=" mx-auto mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700 text-sm text-gray-700 dark:text-gray-300">
      <div class="flex items-start">
        <i class="fas fa-info-circle text-blue-500 mt-0.5 mr-3"></i>
        <div>
          <strong class="font-bold text-gray-800 dark:text-white">Disclaimer:</strong> This is an estimate. Actual savings vary based on your specific
          location, roof tilt, shading, and final system cost.
          Calculations assume an electricity rate of <strong>{{ currentRate.toFixed(2) }} PHP/kWh</strong>, an average of <strong>{{
            AVG_INSOLATION }} Peak Sun Hours</strong>, and a system performance ratio of <strong>{{ (PERFORMANCE_RATIO * 100).toFixed(0)
          }}%</strong>.
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { db, doc, onSnapshot } from '@/firebase.js';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- 1. OUR HARDCODED ASSUMPTIONS ---
const AVG_INSOLATION = 4.5;
const PERFORMANCE_RATIO = 0.80;
const COST_PER_KW = 85000;
const AVG_DAYS_PER_MONTH = 30.44;

// --- 2. THE ONE (cost-free) DATA FETCH ---
const currentRate = ref(12.0);
onMounted(() => {
  const rateRef = doc(db, `artifacts/${appId}/public/data/utility_rates/veco`);
  onSnapshot(rateRef, (docSnap) => {
    if (docSnap.exists()) {
      currentRate.value = docSnap.data().vecoKwhRate || 12.0;
    }
  });
});

// --- 3. USER INPUTS ---
const avgMonthlyBill = ref(5000);
const systemSizeKw = ref(5.0);
const estimatedSystemCost = ref(systemSizeKw.value * COST_PER_KW);

watch(systemSizeKw, (newSize) => {
  estimatedSystemCost.value = newSize * COST_PER_KW;
});

// --- 4. THE CORE CALCULATION LOGIC ---
const avgMonthlyKwhConsumed = computed(() => {
  return avgMonthlyBill.value / currentRate.value;
});

const avgMonthlyKwhGenerated = computed(() => {
  const dailyGeneration = systemSizeKw.value * AVG_INSOLATION * PERFORMANCE_RATIO;
  return dailyGeneration * AVG_DAYS_PER_MONTH;
});

const kwhImportedFromGrid = computed(() => {
  return Math.max(0, avgMonthlyKwhConsumed.value - avgMonthlyKwhGenerated.value);
});

const newMonthlyBillPhp = computed(() => {
  return kwhImportedFromGrid.value * currentRate.value;
});

const monthlySavingsPhp = computed(() => {
  return avgMonthlyBill.value - newMonthlyBillPhp.value;
});

const paybackPeriodYears = computed(() => {
  const annualSavings = monthlySavingsPhp.value * 12;
  if (annualSavings <= 0) return Infinity;
  return estimatedSystemCost.value / annualSavings;
});

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// --- 5. CHART DATA ---
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    }
  }
};

const billChartData = computed(() => ({
  labels: ['Current Bill', 'New Bill (w/ Solar)'],
  datasets: [
    {
      label: 'Monthly Bill (PHP)',
      backgroundColor: ['#ef4444', '#22c55e'],
      data: [avgMonthlyBill.value, newMonthlyBillPhp.value]
    }
  ]
}));

const mixChartData = computed(() => {
  const solarUsed = avgMonthlyKwhConsumed.value - kwhImportedFromGrid.value;

  return {
    labels: ['From Grid', 'From Solar'],
    datasets: [
      {
        backgroundColor: ['#6b7280', '#f59e0b'],
        data: [kwhImportedFromGrid.value, solarUsed]
      }
    ]
  };
});
</script>

<style>
.slider-thumb::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.slider-thumb::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
</style>
<template>
  <div class="p-4 md:p-6">
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 class="text-2xl font-bold mb-6 text-green-600 dark:text-green-400">1. Your Inputs</h3>

        <div class="mb-6">
          <label for="monthly-bill" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Average Monthly Bill (PHP)
          </label>
          <input
            type="number"
            id="monthly-bill"
            v-model.number="avgMonthlyBill"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            placeholder="e.g., 5000"
          />
        </div>

        <div class="mb-6">
          <label for="system-size" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Solar System Size (kWp)
          </label>
          <input
            type="range"
            id="system-size"
            v-model.number="systemSizeKw"
            min="1.5"
            max="20"
            step="0.5"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div class="text-center text-lg font-semibold mt-2">{{ systemSizeKw }} kWp</div>
        </div>
        
        <div class="mb-4">
          <label for="system-cost" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Estimated System Cost (PHP)
          </label>
          <input
            type="number"
            id="system-cost"
            v-model.number="estimatedSystemCost"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          />
          <span class="text-xs text-gray-500 dark:text-gray-400">
            We estimated this, but you can override it.
          </span>
        </div>
      </div>

      <div class="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 class="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">2. Your Estimated Savings</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="p-4 bg-blue-50 dark:bg-gray-700 rounded-lg text-center">
            <div class="text-sm font-medium text-blue-600 dark:text-blue-300">Monthly Savings</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ pesoFormatter.format(monthlySavingsPhp) }}
            </div>
          </div>
          <div class="p-4 bg-green-50 dark:bg-gray-700 rounded-lg text-center">
            <div class="text-sm font-medium text-green-600 dark:text-green-300">New Monthly Bill</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ pesoFormatter.format(newMonthlyBillPhp) }}
            </div>
          </div>
          <div class="p-4 bg-yellow-50 dark:bg-gray-700 rounded-lg text-center">
            <div class="text-sm font-medium text-yellow-600 dark:text-yellow-400">Payback Period</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ paybackPeriodYears.toFixed(1) }} <span class="text-xl">years</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-lg font-medium text-center mb-2">Bill Comparison</h4>
            <div class="h-64 relative">
              <Bar :data="billChartData" :options="chartOptions" />
            </div>
          </div>
          <div>
            <h4 class="text-lg font-medium text-center mb-2">New Energy Mix</h4>
            <div class="h-64 relative">
              <Doughnut :data="mixChartData" :options="doughnutOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="max-w-6xl mx-auto mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300">
      <strong class="font-bold">Disclaimer:</strong> This is an estimate. Actual savings vary based on your specific location, roof tilt, shading, and final system cost.
      <br />
      Calculations assume an electricity rate of **{{ currentRate.toFixed(2) }} PHP/kWh**, an average of **{{ AVG_INSOLATION }} Peak Sun Hours**, and a system performance ratio of **{{ (PERFORMANCE_RATIO * 100).toFixed(0) }}%**.
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
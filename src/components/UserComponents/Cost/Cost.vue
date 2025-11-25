<template>
  <div class="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
    
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="error" class="max-w-4xl mx-auto mb-6 bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/20 dark:border-red-600">
      <p class="text-sm text-red-700 dark:text-red-200">{{ error }}</p>
    </div>

    <div v-else>
      <div class="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 mx-auto">
        
        <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div class="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 inline-block">
            <div class="flex flex-wrap gap-1">
              <button 
                v-for="filter in timeFilters" 
                :key="filter"
                @click="activeFilter = filter"
                :class="[
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
                  activeFilter === filter 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >
                {{ filter }}
              </button>
            </div>
          </div>

          <div class="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <span class="text-sm text-gray-500 dark:text-gray-400 mr-3">Budget:</span>
            <span class="text-gray-500 font-bold mr-1">₱</span>
            <input 
              v-model.number="userBudget" 
              type="number" 
              class="w-24 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white font-bold text-right"
            />
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="handleExport('csv')" class="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm">
            CSV
          </button>
          <button @click="handleExport('pdf')" class="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm">
            PDF
          </button>
          <button @click="handleExport('word')" class="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm">
            Word
          </button>
        </div>
      </div>

      <CostMetricsCard :metrics="calculatedMetrics" />

      <div class="mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Cost Trend (₱)</h3>
          <div class="h-80 relative">
            <div id="cost-trend-chart" class="w-full h-full"></div>
          </div>
        </div>
        <div class="lg:col-span-1">
          <CostBreakdown 
            :gridCost="breakdownStats.gridCost" 
            :solarSavings="breakdownStats.solarSavings" 
          />
        </div>
      </div>

      <div class="mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Energy Usage (kWh)</h3>
          <div class="h-80 relative">
            <div id="usage-pattern-chart" class="w-full h-full"></div>
          </div>
        </div>
        <div class="lg:col-span-2">
          <BillingHistory :history="billingHistory" :budget="userBudget" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { db } from '@/firebase.js';
import { collection, query, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/composables/useAuth'; 
import Plotly from 'plotly.js-dist-min';
import { CurrencyDollarIcon, BoltIcon, ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/vue/24/outline';

// Export Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

import CostMetricsCard from './CostMetricsCard.vue';
import CostBreakdown from './CostBreakdown.vue';
import BillingHistory from './BillingHistory.vue';

// State
const timeFilters = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
const activeFilter = ref('Weekly'); 
const loading = ref(true);
const error = ref(null);
const rawData = ref([]); 
const currentRate = ref(12.0); 
const userBudget = ref(5000);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const { userProfile, isLoading: authLoading } = useAuth(appId);
const deviceId = ref(null);

// --- Watchers ---
watch(userProfile, (newProfile) => {
  if (newProfile && newProfile.deviceId) deviceId.value = newProfile.deviceId;
  else {
    deviceId.value = null;
    rawData.value = [];
    if (!authLoading.value) loading.value = false;
  }
}, { immediate: true });

watch(deviceId, async (newId) => {
  if (newId) {
    await fetchUtilityRate();
    await fetchCostData(newId);
  }
}, { immediate: true });

const fetchUtilityRate = async () => {
  try {
    const rateSnap = await getDoc(doc(db, 'artifacts/default-app-id/public/data/utility_rates/veco'));
    if (rateSnap.exists()) currentRate.value = rateSnap.data().vecoKwhRate || 12.0;
  } catch (e) { console.error(e); }
};

// --- BUG FIX: LOAD SEQUENCE ---
const fetchCostData = async (id) => {
  loading.value = true; // Hide charts
  try {
    const q = query(collection(db, `devices/${id}/daily_summaries`), orderBy('date', 'desc'), limit(365));
    const snap = await getDocs(q);
    
    if (!snap.empty) rawData.value = snap.docs.map(doc => doc.data());
    else rawData.value = [];

    // 1. REVEAL DOM: Set loading to false FIRST so v-else renders
    loading.value = false; 
    
    // 2. WAIT FOR RENDER: Wait 1 tick for DOM to exist
    await nextTick();
    
    // 3. DRAW: Now it is safe to plot
    updateCharts();

  } catch (e) { 
    error.value = "Failed to load data."; 
    loading.value = false; // Ensure loading stops on error
  } 
};

// --- Export Logic ---
const handleExport = (format) => {
  if (!rawData.value.length) return alert("No data to export.");
  const filename = `EnerGreen_Cost_Report_${new Date().toISOString().split('T')[0]}`;
  
  // Prepare data (Chronological)
  const exportData = [...rawData.value].reverse().map(d => ({
    date: d.date,
    grid: (d.gridKwhTotal || 0).toFixed(2),
    solar: (d.solarKwhTotal || 0).toFixed(2),
    cost: ((d.gridKwhTotal || 0) * currentRate.value).toFixed(2)
  }));

  if (format === 'csv') exportCSV(exportData, filename);
  if (format === 'pdf') exportPDF(exportData, filename);
  if (format === 'word') exportWord(exportData, filename);
};

const exportCSV = (data, filename) => {
  const headers = "Date,Grid Usage (kWh),Solar Savings (kWh),Cost (PHP)\n";
  const rows = data.map(r => `${r.date},${r.grid},${r.solar},${r.cost}`).join("\n");
  saveAs(new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
};

const exportPDF = (data, filename) => {
  const doc = new jsPDF();
  doc.setFontSize(18); doc.setTextColor(40, 167, 69);
  doc.text("EnerGreen Cost Report", 14, 20);
  
  autoTable(doc, {
    startY: 30,
    head: [['Date', 'Grid (kWh)', 'Solar (kWh)', 'Cost (PHP)']],
    body: data.map(r => [r.date, r.grid, r.solar, r.cost]),
    theme: 'grid',
    headStyles: { fillColor: [40, 167, 69] }
  });
  doc.save(`${filename}.pdf`);
};

const exportWord = async (data, filename) => {
  const tableRows = [
    new TableRow({ children: ["Date", "Grid (kWh)", "Solar (kWh)", "Cost (PHP)"].map(t => new TableCell({ children: [new Paragraph({ text: t, bold: true })] })) }),
    ...data.map(r => new TableRow({ children: [r.date, r.grid, r.solar, r.cost].map(t => new TableCell({ children: [new Paragraph(t)] })) }))
  ];
  const doc = new Document({ sections: [{ children: [new Paragraph({ text: "EnerGreen Cost Report", heading: HeadingLevel.HEADING_1 }), new Table({ rows: tableRows, width: { size: 100, type: "pct" } })] }] });
  saveAs(await Packer.toBlob(doc), `${filename}.docx`);
};

// --- Logic for Charts & Metrics (Same as before) ---
// ... [Copied from previous successful implementation] ...

const calculatedMetrics = computed(() => {
  if (!rawData.value.length) return [];
  const now = new Date();
  const currentMonthData = rawData.value.filter(d => new Date(d.date).getMonth() === now.getMonth());
  
  const monthKwh = currentMonthData.reduce((acc, c) => acc + (c.gridKwhTotal || 0), 0);
  const monthCost = monthKwh * currentRate.value;
  const dayAvg = now.getDate() > 0 ? monthCost / now.getDate() : 0;
  
  // Projected
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projected = dayAvg * daysInMonth;
  const isOverBudget = projected > userBudget.value;

  return [
    { title: 'Current Bill', cost: `₱${monthCost.toFixed(2)}`, definition: 'Run-rate', icon: CurrencyDollarIcon, bgClass: 'bg-blue-100 dark:bg-blue-900/30', textClass: 'text-blue-600 dark:text-blue-400' },
    { title: 'Projected Bill', cost: `₱${projected.toFixed(2)}`, definition: isOverBudget ? '⚠️ Over Budget' : '✅ On Track', icon: ChartBarIcon, bgClass: isOverBudget ? 'bg-red-100' : 'bg-purple-100', textClass: isOverBudget ? 'text-red-600' : 'text-purple-600' },
    { title: 'Consumption', cost: `${monthKwh.toFixed(1)} kWh`, definition: 'This Month', icon: BoltIcon, bgClass: 'bg-yellow-100 dark:bg-yellow-900/30', textClass: 'text-yellow-600' },
    { title: 'Avg Daily', cost: `₱${dayAvg.toFixed(2)}`, definition: 'Daily Cost', icon: ArrowTrendingUpIcon, bgClass: 'bg-emerald-100 dark:bg-emerald-900/30', textClass: 'text-emerald-600' }
  ];
});

const breakdownStats = computed(() => {
  if (!rawData.value.length) return { gridCost: 0, solarSavings: 0 };
  const now = new Date();
  const monthData = rawData.value.filter(d => new Date(d.date).getMonth() === now.getMonth());
  const grid = monthData.reduce((acc, c) => acc + (c.gridKwhTotal || 0), 0);
  const solar = monthData.reduce((acc, c) => acc + (c.solarKwhTotal || 0), 0);
  return { gridCost: grid * currentRate.value, solarSavings: solar * currentRate.value };
});

const billingHistory = computed(() => {
  if (!rawData.value.length) return [];
  const grouped = {};
  rawData.value.forEach(d => {
    const date = new Date(d.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!grouped[key]) grouped[key] = { month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), kwh: 0, cost: 0, sort: date.getTime() };
    const val = (d.gridKwhTotal || 0);
    grouped[key].kwh += val;
    grouped[key].cost += val * currentRate.value;
  });
  return Object.values(grouped).sort((a, b) => b.sort - a.sort).map(i => ({...i, kwh: i.kwh.toFixed(1), cost: i.cost.toFixed(2)})).slice(0, 12);
});

const updateCharts = () => {
  const costDiv = document.getElementById('cost-trend-chart');
  const usageDiv = document.getElementById('usage-pattern-chart');
  if (!costDiv || !usageDiv) return;

  let days = 7;
  if (activeFilter.value === 'Monthly') days = 30;
  if (activeFilter.value === 'Yearly') days = 365;

  const filtered = rawData.value.slice(0, days).reverse();

  const xValues = filtered.map(d => {
    const [y, m, day] = d.date.split('-');
    const date = new Date(y, m - 1, day);
    return activeFilter.value === 'Yearly' 
      ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const yCost = filtered.map(d => (d.gridKwhTotal || 0) * currentRate.value);
  const yUsage = filtered.map(d => (d.gridKwhTotal || 0));

  const commonLayout = {
    margin: { l: 50, r: 20, t: 20, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { gridcolor: '#e5e7eb', showgrid: false, tickfont: { size: 11, color: '#6b7280' } },
    yaxis: { gridcolor: '#e5e7eb', tickfont: { size: 11, color: '#6b7280' } },
    font: { family: 'Poppins, sans-serif' }
  };

  Plotly.newPlot('cost-trend-chart', [{
    x: xValues, y: yCost, type: 'scatter', mode: 'lines+markers', fill: 'tozeroy',
    line: { color: '#3b82f6', width: 3, shape: 'spline' }, marker: { color: '#3b82f6', size: 6 },
    hovertemplate: '<b>%{x}</b><br>₱%{y:.2f}<extra></extra>'
  }], { ...commonLayout, yaxis: { ...commonLayout.yaxis, title: 'Cost (PHP)' } }, { displayModeBar: false, responsive: true });

  Plotly.newPlot('usage-pattern-chart', [{
    x: xValues, y: yUsage, type: 'bar', marker: { color: '#10b981', opacity: 0.8 },
    hovertemplate: '<b>%{x}</b><br>%{y:.2f} kWh<extra></extra>'
  }], { ...commonLayout, yaxis: { ...commonLayout.yaxis, title: 'Energy (kWh)' } }, { displayModeBar: false, responsive: true });
};

watch(activeFilter, updateCharts);
</script>
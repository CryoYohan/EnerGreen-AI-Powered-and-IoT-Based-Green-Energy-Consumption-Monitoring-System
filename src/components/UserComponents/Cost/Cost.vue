<template>
  <div class="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
    
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="error" class="max-w-4xl mx-auto mb-6 bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/20 dark:border-red-600">
      <p class="text-sm text-red-700 dark:text-red-200">{{ error }}</p>
    </div>

    <div v-else-if="showNoDeviceMessage" class="text-center py-16 px-4">
        <div class="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <svg class="mx-auto h-16 w-16 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.471-2.471a2.652 2.652 0 00-3.75-3.75L4.5 12.552A2.652 2.652 0 008.25 21l5.877-5.877M11.42 15.17L5.877 21m6.082-6.082L9 3.75l-6 6 6 6 3.75-3.75M9 3.75L12.553 7.5M16.5 21L12 16.5" />
            </svg>
            <h2 class="mt-4 text-xl font-semibold text-gray-800 dark:text-white">No Smart Meter Linked</h2>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
                To see your cost analytics, please link your EnerGreen Smart Meter to your account in your profile settings.
            </p>
            <button @click="$router.push({ name: 'Profile' })" class="mt-6 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Go to Profile
            </button>
        </div>
    </div>

    <div v-else>
      <div class="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 mx-auto">
        
        <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div class="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 inline-block">
            <div class="flex flex-wrap gap-1">
              <button 
                v-for="filter in timeFilters" 
                :key="filter"
                @click="emit('update:activeFilter', filter)"
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
              :value="userBudget"
              @input="emit('update:userBudget', $event.target.value)"
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
import { watch, nextTick } from 'vue';
import Plotly from 'plotly.js-dist-min';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel, WidthType } from "docx";
import { saveAs } from "file-saver";

// Import Child Components
import CostMetricsCard from './CostMetricsCard.vue';
import CostBreakdown from './CostBreakdown.vue';
import BillingHistory from './BillingHistory.vue';

// --- PROPS ---
const props = defineProps({
    loading: Boolean,
    error: String,
    showNoDeviceMessage: Boolean,
    timeFilters: Array,
    activeFilter: String,
    userBudget: Number,
    calculatedMetrics: Array,
    breakdownStats: Object,
    billingHistory: Array,
    chartPlotData: Object,
    rawData: Array,
    // ADDED: We need the rate to calculate cost in the export
    currentRate: { 
        type: Number, 
        default: 0 
    } 
});

const emit = defineEmits(['update:activeFilter', 'update:userBudget']);

// --- CHART RENDERING (Unchanged) ---
const updateCharts = () => {
  const costDiv = document.getElementById('cost-trend-chart');
  const usageDiv = document.getElementById('usage-pattern-chart');
  if (!costDiv || !usageDiv) return;

  if (props.error || props.showNoDeviceMessage || !props.chartPlotData || !props.chartPlotData.xValues || props.chartPlotData.xValues.length === 0) {
    Plotly.purge(costDiv);
    Plotly.purge(usageDiv);
    return;
  }
  
  const { xValues, yCost, yUsage } = props.chartPlotData;
  
  const commonLayout = {
    margin: { l: 50, r: 20, t: 20, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { gridcolor: '#e5e7eb', showgrid: false, tickfont: { size: 11, color: '#6b7280' } },
    yaxis: { gridcolor: '#e5e7eb', tickfont: { size: 11, color: '#6b7280' } },
    font: { family: 'Poppins, sans-serif' }
  };

  Plotly.newPlot('cost-trend-chart', [{ x: xValues, y: yCost, type: 'scatter', mode: 'lines+markers', fill: 'tozeroy', line: { color: '#3b82f6', width: 3, shape: 'spline' }, hovertemplate: '<b>%{x}</b><br>₱%{y:.2f}<extra></extra>' }], { ...commonLayout, yaxis: { ...commonLayout.yaxis, title: 'Cost (PHP)' } }, { displayModeBar: false, responsive: true });
  Plotly.newPlot('usage-pattern-chart', [{ x: xValues, y: yUsage, type: 'bar', marker: { color: '#10b981' }, hovertemplate: '<b>%{x}</b><br>%{y:.2f} kWh<extra></extra>' }], { ...commonLayout, yaxis: { ...commonLayout.yaxis, title: 'Energy (kWh)' } }, { displayModeBar: false, responsive: true });
};

// --- EXPORT LOGIC (FIXED) ---
const handleExport = (format) => {
  // FIX 1: Use props.rawData (not rawData.value)
  if (!props.rawData || !props.rawData.length) {
      alert("No data available to export.");
      return;
  }

  const filename = `EnerGreen_Cost_Report_${new Date().toISOString().split('T')[0]}`;
  
  // FIX 2: Use props.rawData and props.currentRate
  const exportData = [...props.rawData].reverse().map(d => ({
    date: d.date,
    grid: (d.gridKwhTotal || 0).toFixed(2),
    solar: (d.solarKwhTotal || 0).toFixed(2),
    // Calculate cost using the passed prop
    cost: ((d.gridKwhTotal || 0) * props.currentRate).toFixed(2)
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
  
  const doc = new Document({ 
      sections: [{ 
          children: [
              new Paragraph({ text: "EnerGreen Cost Report", heading: HeadingLevel.HEADING_1 }), 
              new Table({ 
                  rows: tableRows, 
                  width: { size: 100, type: WidthType.PERCENTAGE } // Corrected WidthType usage
              })
          ] 
      }] 
  });
  
  saveAs(await Packer.toBlob(doc), `${filename}.docx`);
};

// --- WATCHER ---
watch(() => props.chartPlotData, () => {
    nextTick(() => {
        updateCharts();
    });
}, { deep: true, immediate: true });
</script>

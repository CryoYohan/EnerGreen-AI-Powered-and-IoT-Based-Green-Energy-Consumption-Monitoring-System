<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
    <UserHeader class="print:hidden" />

    <div class="flex flex-col md:flex-row justify-between items-end gap-4 pb-0">
      <Heading
        title="Solar Generation"
        subtitle="Monitor your solar energy production and independence"
      />
      
      <div class="flex flex-col mr-8 sm:flex-row gap-4 w-full md:w-auto items-end sm:items-center">
        <!-- Time Filters -->
        <div class="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="flex flex-wrap gap-1">
            <button 
              v-for="filter in timeFilters" 
              :key="filter"
              @click="activeFilter = filter"
              :class="[
                'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
                activeFilter === filter 
                  ? 'bg-yellow-500 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              {{ filter }}
            </button>
          </div>
        </div>

        <!-- Export Buttons (Matching Costs Page Style) -->
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
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
    </div>
    
    <div v-else-if="error" class="mx-4 md:mx-8 mb-6 bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/20 dark:border-red-600">
      <p class="text-sm text-red-700 dark:text-red-200">{{ error }}</p>
    </div>

    <div v-else class="p-4 md:p-8 space-y-6 print:p-0">
      
      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
        <div v-for="(metric, index) in calculatedMetrics" :key="index" class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl print:shadow-none print:border-gray-200">
          <div class="flex justify-between items-start mb-2">
            <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ metric.title }}</p>
            <component :is="metric.icon" class="w-6 h-6" :class="metric.iconColor" />
          </div>
          <h3 class="text-2xl font-extrabold text-gray-900 dark:text-white">{{ metric.value }}</h3>
          <p class="text-xs font-medium mt-2 text-gray-500">{{ metric.subtitle }}</p>
        </div>
      </div>

      <!-- Main Chart -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 print:shadow-none print:border-gray-200">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Energy Source Mix ({{ activeFilter }})</h3>
          <div class="flex gap-4 text-xs font-medium">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-yellow-500"></span> Solar
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-gray-400"></span> Grid
            </div>
          </div>
        </div>
        <div class="h-80 w-full relative">
          <div id="solar-mix-chart" class="w-full h-full"></div>
        </div>
      </div>

      <!-- Savings & Impact -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3">
        <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white lg:col-span-1 print:text-black print:bg-none print:border print:border-gray-200">
          <h3 class="text-lg font-bold mb-2 flex items-center gap-2">
             <CurrencyDollarIcon class="w-6 h-6" /> Total Savings
          </h3>
          <p class="text-4xl font-extrabold mb-1">₱{{ savingsValue }}</p>
          <p class="text-sm opacity-90">Money saved by using your own power this period.</p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2 flex items-center justify-between print:shadow-none print:border-gray-200">
           <div>
             <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Environmental Impact</h3>
             <p class="text-sm text-gray-500">Your solar panels have reduced carbon footprint significantly.</p>
             <div class="mt-4 flex gap-6">
               <div>
                 <p class="text-2xl font-bold text-emerald-600">{{ co2Avoided }} kg</p>
                 <p class="text-xs text-gray-500 uppercase font-bold">CO2 Avoided</p>
               </div>
               <div>
                 <p class="text-2xl font-bold text-emerald-600">{{ treesPlanted }}</p>
                 <p class="text-xs text-gray-500 uppercase font-bold">Trees Equivalent</p>
               </div>
             </div>
           </div>
           <div class="hidden md:block text-emerald-100 print:hidden">
             <svg class="w-32 h-32 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20C19,20,22,3,22,3,21,5,14,5.25,9,6.25S2,11.5,2,13.5a6.22,6.22,0,0,0,1.75,3.75C7,13,11,9,17,8Z"/></svg>
           </div>
        </div>
      </div>

    </div>

    <Footer class="print:hidden" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import { useAuth } from '@/composables/useAuth';
import * as solarService from '@/services/solarService.js';
import Plotly from 'plotly.js-dist-min';
import { SunIcon, BoltIcon, Battery50Icon, CurrencyDollarIcon } from '@heroicons/vue/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from "file-saver";
// Added imports for Word export
import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel, WidthType } from "docx";

// Components
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";

// --- STATE ---
const timeFilters = ['Daily', 'Weekly', 'Monthly', 'Yearly']; 
const activeFilter = ref('Weekly');
const loading = ref(true);
const error = ref(null);

const rawData = ref([]); 
const hourlyData = ref([]);
const currentRate = ref(12.0); 
const carbonRate = ref(0.71);
const chartPlotData = ref({ xValues: [], ySolar: [], yGrid: [] });

const { userProfile, waitForAuthReady } = useAuth('default-app-id');
let hourlyUnsubscribe = null;

// --- COMPUTED PROPERTIES ---
const currentViewData = computed(() => {
  if (activeFilter.value === 'Daily') return hourlyData.value;
  let days = 7;
  if (activeFilter.value === 'Monthly') days = 30;
  if (activeFilter.value === 'Yearly') days = 365;
  return rawData.value.slice(0, days);
});

const calculatedMetrics = computed(() => {
    if (!currentViewData.value.length && activeFilter.value !== 'Daily') return [];
    
    const metrics = solarService.calculateMetrics(currentViewData.value, activeFilter.value === 'Daily');
    return [
        { ...metrics[0], icon: SunIcon, iconColor: 'text-yellow-500' },
        { ...metrics[1], icon: BoltIcon, iconColor: 'text-gray-500' },
        { ...metrics[2], icon: Battery50Icon, iconColor: 'text-emerald-500' },
        { ...metrics[3], icon: SunIcon, iconColor: 'text-orange-500' }
    ];
});

const impactStats = computed(() => {
  return solarService.calculateImpact(currentViewData.value, activeFilter.value === 'Daily', currentRate.value, carbonRate.value);
});

const savingsValue = computed(() => impactStats.value.savingsValue);
const co2Avoided = computed(() => impactStats.value.co2Avoided);
const treesPlanted = computed(() => impactStats.value.treesPlanted);


// --- DATA FETCHING ---
const fetchAllData = async () => {
    const profile = userProfile.value;
    
    if (!profile || !profile.deviceId) {
        console.warn("Waiting for Device ID...");
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        const [rate, carbon, summaries] = await Promise.all([
            solarService.getUtilityRate(profile.electricityProvider),
            solarService.getCarbonRate(),
            solarService.getDailySummaries(profile.deviceId)
        ]);
        
        currentRate.value = rate;
        carbonRate.value = carbon;
        rawData.value = summaries;

        if (hourlyUnsubscribe) hourlyUnsubscribe();
        hourlyUnsubscribe = solarService.listenToHourlyReadings(profile.deviceId, (readings) => {
            hourlyData.value = solarService.processHourlyDeltas(readings);
        });

        loading.value = false;
        await nextTick();
        updateCharts();

    } catch (e) {
        console.error("Failed to fetch solar data:", e);
        error.value = "Could not load solar panel data.";
        loading.value = false;
    } 
};

// --- CHARTING ---
const updateCharts = () => {
    const chartDiv = document.getElementById('solar-mix-chart');
    if (!chartDiv) return;

    chartPlotData.value = solarService.processDataForChart(rawData.value, hourlyData.value, activeFilter.value);
    const { xValues, ySolar, yGrid } = chartPlotData.value;
    
    if (!xValues || xValues.length === 0) {
        Plotly.purge(chartDiv);
        return;
    }
    
    const traceSolar = { x: xValues, y: ySolar, name: 'Solar', type: 'bar', marker: { color: '#EAB308' } };
    const traceGrid = { x: xValues, y: yGrid, name: 'Grid', type: 'bar', marker: { color: '#9CA3AF' } };
    const layout = { barmode: 'stack', margin: { l: 40, r: 20, t: 20, b: 40 }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', showlegend: false, xaxis: { gridcolor: '#e5e7eb', showgrid: false }, yaxis: { gridcolor: '#e5e7eb', title: 'Energy (kWh)' }, font: { family: 'Poppins, sans-serif' } };
    
    Plotly.newPlot('solar-mix-chart', [traceGrid, traceSolar], layout, { displayModeBar: false, responsive: true });
};

// --- EXPORT LOGIC (ADAPTED FOR SOLAR PAGE) ---
const handleExport = (format) => {
  // Use .value because these are local refs, not props
  if (!rawData.value || !rawData.value.length) {
      alert("No data available to export.");
      return;
  }

  const filename = `EnerGreen_Solar_Report_${new Date().toISOString().split('T')[0]}`;
  
  const exportData = [...rawData.value].reverse().map(d => ({
    date: d.date,
    grid: (d.gridKwhTotal || 0).toFixed(2),
    solar: (d.solarKwhTotal || 0).toFixed(2),
    // Calculated Savings (Solar * Rate) instead of Cost
    savings: ((d.solarKwhTotal || 0) * currentRate.value).toFixed(2)
  }));

  if (format === 'csv') exportCSV(exportData, filename);
  if (format === 'pdf') exportPDF(exportData, filename);
  if (format === 'word') exportWord(exportData, filename);
};

const exportCSV = (data, filename) => {
  const headers = "Date,Grid Usage (kWh),Solar Gen (kWh),Savings (PHP)\n";
  const rows = data.map(r => `${r.date},${r.grid},${r.solar},${r.savings}`).join("\n");
  saveAs(new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
};

const exportPDF = (data, filename) => {
  const doc = new jsPDF();
  doc.setFontSize(18); doc.setTextColor(234, 179, 8); // Yellow for Solar
  doc.text("EnerGreen Solar Report", 14, 20);
  
  autoTable(doc, {
    startY: 30,
    head: [['Date', 'Grid (kWh)', 'Solar (kWh)', 'Savings (PHP)']],
    body: data.map(r => [r.date, r.grid, r.solar, r.savings]),
    theme: 'grid',
    headStyles: { fillColor: [234, 179, 8] } // Yellow header
  });
  doc.save(`${filename}.pdf`);
};

const exportWord = async (data, filename) => {
  const tableRows = [
    new TableRow({ children: ["Date", "Grid (kWh)", "Solar (kWh)", "Savings (PHP)"].map(t => new TableCell({ children: [new Paragraph({ text: t, bold: true })] })) }),
    ...data.map(r => new TableRow({ children: [r.date, r.grid, r.solar, r.savings].map(t => new TableCell({ children: [new Paragraph(t)] })) }))
  ];
  
  const doc = new Document({ 
      sections: [{ 
          children: [
              new Paragraph({ text: "EnerGreen Solar Report", heading: HeadingLevel.HEADING_1 }), 
              new Table({ 
                  rows: tableRows, 
                  width: { size: 100, type: WidthType.PERCENTAGE }
              })
          ] 
      }] 
  });
  
  saveAs(await Packer.toBlob(doc), `${filename}.docx`);
};

// --- WATCHERS ---
watch(() => userProfile.value?.deviceId, (newDeviceId) => {
    if (newDeviceId) {
        fetchAllData();
    }
}, { immediate: true });

onUnmounted(() => {
  if (hourlyUnsubscribe) hourlyUnsubscribe();
});

watch(activeFilter, updateCharts);
watch(hourlyData, () => {
    if (activeFilter.value === 'Daily') {
        updateCharts();
    }
});
</script>

<style scoped>
@media print {
  /* Hide non-essential elements for printing */
  button, nav, footer, .print\:hidden {
    display: none !important;
  }
  
  /* Ensure charts are visible */
  .bg-white, .dark\:bg-gray-800 {
    background-color: white !important;
    color: black !important;
    box-shadow: none !important;
    border: 1px solid #eee !important;
  }

  body {
    background-color: white !important;
  }
}
</style>
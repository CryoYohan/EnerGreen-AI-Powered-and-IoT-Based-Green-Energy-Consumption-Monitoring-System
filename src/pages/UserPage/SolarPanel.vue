<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
    <UserHeader class="print:hidden" />

    <div class="flex flex-col md:flex-row justify-between items-end gap-4 pb-0">
      <Heading
        title="Solar Generation"
        subtitle="Monitor your solar energy production and independence"
      />
      
      <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-end sm:items-center">
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
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { db } from '@/firebase.js';
import { collection, query, getDocs, orderBy, limit, doc, getDoc, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/composables/useAuth'; 
import Plotly from 'plotly.js-dist-min';
import { SunIcon, BoltIcon, Battery50Icon, CurrencyDollarIcon } from '@heroicons/vue/24/outline';

// Export Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

// Components
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";

// State
const timeFilters = ['Daily', 'Weekly', 'Monthly', 'Yearly']; 
const activeFilter = ref('Weekly');
const loading = ref(true);
const error = ref(null);
const rawData = ref([]); // Weekly/Monthly/Yearly Data
const hourlyData = ref([]); // Daily Data (Realtime)
const currentRate = ref(12.0); 
const carbonRate = ref(0.71);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const { userProfile, isLoading: authLoading } = useAuth(appId);
const deviceId = ref(null);

// --- Watchers ---
watch(userProfile, (newProfile) => {
  if (newProfile && newProfile.deviceId) {
    deviceId.value = newProfile.deviceId;
  } else {
    deviceId.value = null;
    rawData.value = [];
    hourlyData.value = [];
    if (!authLoading.value) {
      loading.value = false;
      error.value = "No solar device linked to account.";
    }
  }
}, { immediate: true });

watch(deviceId, async (newId) => {
  if (newId) {
    await fetchRates();
    fetchSolarData(newId); // Historical
    fetchHourlyData(newId); // Today's Hourly
  }
}, { immediate: true });

watch(activeFilter, () => {
  updateCharts();
});

// --- Data Fetching ---
const fetchRates = async () => {
  try {
    const rateSnap = await getDoc(doc(db, 'artifacts/default-app-id/public/data/utility_rates/veco'));
    if (rateSnap.exists()) currentRate.value = rateSnap.data().vecoKwhRate || 12.0;
  } catch (e) { console.error(e); }
};

// A. Historical Data (W/M/Y)
const fetchSolarData = async (id) => {
  loading.value = true;
  try {
    const q = query(collection(db, `devices/${id}/daily_summaries`), orderBy('date', 'desc'), limit(365));
    const snap = await getDocs(q);
    
    if (!snap.empty) rawData.value = snap.docs.map(doc => doc.data());
    else rawData.value = [];

    loading.value = false;
    await nextTick();
    updateCharts();
  } catch (e) {
    console.error(e);
    error.value = "Failed to load solar data.";
    loading.value = false;
  }
};

// B. Hourly Data (Daily)
let hourlyUnsubscribe = null;
const fetchHourlyData = (id) => {
  if (hourlyUnsubscribe) hourlyUnsubscribe();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = Timestamp.fromDate(today);

  const q = query(
    collection(db, `devices/${id}/realtime_readings`),
    where("timestamp", ">=", startOfDay),
    orderBy("timestamp", "asc")
  );

  hourlyUnsubscribe = onSnapshot(q, (snap) => {
    const readings = snap.docs.map(doc => doc.data());
    
    // Separate streams based on Source
    const solarReadings = readings.filter(r => r.energySource === 'Solar');
    const gridReadings = readings.filter(r => r.energySource === 'Grid');

    // Helper to Process Deltas
    const processDeltas = (list) => {
      const hours = {};
      for (let i = 1; i < list.length; i++) {
        const delta = list[i].kwhConsumed - list[i-1].kwhConsumed;
        if (delta > 0) {
           const h = list[i].timestamp.toDate().getHours();
           hours[h] = (hours[h] || 0) + delta;
        }
      }
      return hours;
    };

    const solarHourly = processDeltas(solarReadings);
    const gridHourly = processDeltas(gridReadings);

    // Merge into one array [0..23]
    hourlyData.value = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      solar: solarHourly[i] || 0,
      grid: gridHourly[i] || 0
    }));
    
    if (activeFilter.value === 'Daily') updateCharts();
  });
};

// --- Computed Metrics ---
const currentViewData = computed(() => {
  // If Daily, calculate sum from hourlyData
  if (activeFilter.value === 'Daily') {
     return hourlyData.value; // Array of objects { solar, grid }
  }
  // Else use rawData
  let days = 7;
  if (activeFilter.value === 'Monthly') days = 30;
  if (activeFilter.value === 'Yearly') days = 365;
  return rawData.value.slice(0, days);
});

const calculatedMetrics = computed(() => {
  let totalSolar = 0;
  let totalGrid = 0;

  if (activeFilter.value === 'Daily') {
    totalSolar = hourlyData.value.reduce((acc, c) => acc + c.solar, 0);
    totalGrid = hourlyData.value.reduce((acc, c) => acc + c.grid, 0);
  } else {
    // Use daily summaries fields
    const data = currentViewData.value;
    totalSolar = data.reduce((acc, curr) => acc + (curr.solarKwhTotal || 0), 0);
    totalGrid = data.reduce((acc, curr) => acc + (curr.gridKwhTotal || 0), 0);
  }

  const totalEnergy = totalSolar + totalGrid;
  const independence = totalEnergy > 0 ? (totalSolar / totalEnergy) * 100 : 0;

  return [
    { title: 'Solar Generation', value: `${totalSolar.toFixed(1)} kWh`, subtitle: 'Produced this period', icon: SunIcon, iconColor: 'text-yellow-500' },
    { title: 'Grid Usage', value: `${totalGrid.toFixed(1)} kWh`, subtitle: 'Imported from utility', icon: BoltIcon, iconColor: 'text-gray-500' },
    { title: 'Energy Independence', value: `${independence.toFixed(1)}%`, subtitle: '% of power from Solar', icon: Battery50Icon, iconColor: 'text-emerald-500' },
    { title: 'Peak Power', value: `4.2 kW`, subtitle: 'System Capacity', icon: SunIcon, iconColor: 'text-orange-500' }
  ];
});

const savingsValue = computed(() => {
  let totalSolar = 0;
  if (activeFilter.value === 'Daily') {
     totalSolar = hourlyData.value.reduce((acc, c) => acc + c.solar, 0);
  } else {
     totalSolar = currentViewData.value.reduce((acc, curr) => acc + (curr.solarKwhTotal || 0), 0);
  }
  return (totalSolar * currentRate.value).toFixed(2);
});

const co2Avoided = computed(() => {
  const totalSolar = activeFilter.value === 'Daily' 
     ? hourlyData.value.reduce((acc, c) => acc + c.solar, 0)
     : currentViewData.value.reduce((acc, c) => acc + (c.solarKwhTotal || 0), 0);
  return (totalSolar * carbonRate.value).toFixed(1);
});

const treesPlanted = computed(() => {
  return (Number(co2Avoided.value) / 1.6).toFixed(1); 
});

// --- Export Logic ---
const handleExport = (format) => {
  const data = currentViewData.value;
  if (!data || !data.length) return alert("No data to export.");
  
  const filename = `EnerGreen_Solar_Report_${activeFilter.value}_${new Date().toISOString().split('T')[0]}`;
  const isDaily = activeFilter.value === 'Daily';

  // Prepare Data Rows
  const exportData = data.map(d => {
    const label = isDaily ? d.hour : d.date;
    const solar = isDaily ? d.solar : (d.solarKwhTotal || 0);
    const grid = isDaily ? d.grid : (d.gridKwhTotal || 0);
    const savings = solar * currentRate.value;
    return {
      label: label,
      solar: solar.toFixed(3),
      grid: grid.toFixed(3),
      savings: savings.toFixed(2)
    };
  });

  if (format === 'csv') exportCSV(exportData, filename, isDaily ? 'Hour' : 'Date');
  if (format === 'pdf') exportPDF(exportData, filename, isDaily ? 'Hour' : 'Date');
  if (format === 'word') exportWord(exportData, filename, isDaily ? 'Hour' : 'Date');
};

const exportCSV = (data, filename, timeLabel) => {
  const headers = `${timeLabel},Solar Generation (kWh),Grid Usage (kWh),Savings (PHP)\n`;
  const rows = data.map(r => `${r.label},${r.solar},${r.grid},${r.savings}`).join("\n");
  saveAs(new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
};

const exportPDF = (data, filename, timeLabel) => {
  const doc = new jsPDF();
  doc.setFontSize(18); doc.setTextColor(234, 179, 8); // Yellow-500
  doc.text("EnerGreen Solar Report", 14, 20);
  
  doc.setFontSize(11); doc.setTextColor(100);
  doc.text(`Period: ${activeFilter.value}`, 14, 30);
  doc.text(`Total Savings: PHP ${savingsValue.value}`, 14, 36);
  
  autoTable(doc, {
    startY: 45,
    head: [[timeLabel, 'Solar (kWh)', 'Grid (kWh)', 'Savings (PHP)']],
    body: data.map(r => [r.label, r.solar, r.grid, r.savings]),
    theme: 'grid',
    headStyles: { fillColor: [234, 179, 8] } // Yellow Header
  });
  doc.save(`${filename}.pdf`);
};

const exportWord = async (data, filename, timeLabel) => {
  const tableRows = [
    new TableRow({ children: [timeLabel, "Solar (kWh)", "Grid (kWh)", "Savings (PHP)"].map(t => new TableCell({ children: [new Paragraph({ text: t, bold: true })] })) }),
    ...data.map(r => new TableRow({ children: [r.label, r.solar, r.grid, r.savings].map(t => new TableCell({ children: [new Paragraph(t)] })) }))
  ];
  const doc = new Document({ sections: [{ children: [new Paragraph({ text: "EnerGreen Solar Report", heading: HeadingLevel.HEADING_1 }), new Paragraph({ text: `Total Savings: PHP ${savingsValue.value}` }), new Table({ rows: tableRows, width: { size: 100, type: "pct" } })] }] });
  saveAs(await Packer.toBlob(doc), `${filename}.docx`);
};

// --- Chart Logic ---
const updateCharts = () => {
  const chartDiv = document.getElementById('solar-mix-chart');
  if (!chartDiv) return;

  let xValues = [];
  let ySolar = [];
  let yGrid = [];

  if (activeFilter.value === 'Daily') {
    // --- DAILY (Hourly Data) ---
    xValues = hourlyData.value.map(d => d.hour);
    ySolar = hourlyData.value.map(d => d.solar);
    yGrid = hourlyData.value.map(d => d.grid);

  } else if (activeFilter.value === 'Yearly') {
    // --- YEARLY (Monthly Aggregation) ---
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    rawData.value.forEach(d => {
      const [year, month] = d.date.split('-'); 
      const key = `${year}-${month}`;
      if (!monthlyData[key]) {
        monthlyData[key] = {
           label: monthNames[parseInt(month) - 1],
           solar: 0,
           grid: 0,
           sort: new Date(d.date).getTime()
        };
      }
      monthlyData[key].solar += (d.solarKwhTotal || 0);
      monthlyData[key].grid += (d.gridKwhTotal || 0);
    });

    const sortedMonths = Object.values(monthlyData).sort((a, b) => a.sort - b.sort).slice(-12);
    xValues = sortedMonths.map(m => m.label);
    ySolar = sortedMonths.map(m => m.solar);
    yGrid = sortedMonths.map(m => m.grid);

  } else {
    // --- WEEKLY / MONTHLY (Daily Data) ---
    let days = activeFilter.value === 'Weekly' ? 7 : 30;
    const chronologicData = rawData.value.slice(0, days).reverse();

    xValues = chronologicData.map(d => {
      const [year, month, day] = d.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (activeFilter.value === 'Weekly') return date.toLocaleDateString('en-US', { weekday: 'short' }); 
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    ySolar = chronologicData.map(d => d.solarKwhTotal || 0);
    yGrid = chronologicData.map(d => d.gridKwhTotal || 0);
  }

  // Plotly Config
  const traceSolar = {
    x: xValues, y: ySolar, name: 'Solar', type: 'bar', marker: { color: '#EAB308' }, 
    hovertemplate: '<b>%{x}</b><br>Solar: %{y:.2f} kWh<extra></extra>'
  };

  const traceGrid = {
    x: xValues, y: yGrid, name: 'Grid', type: 'bar', marker: { color: '#9CA3AF' },
    hovertemplate: '<b>%{x}</b><br>Grid: %{y:.2f} kWh<extra></extra>'
  };

  const layout = {
    barmode: 'stack',
    margin: { l: 40, r: 20, t: 20, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    legend: { orientation: 'h', y: 1.1, x: 0.3 },
    showlegend: false, 
    xaxis: { gridcolor: '#e5e7eb', showgrid: false, tickfont: { size: 11, color: '#6b7280' } },
    yaxis: { gridcolor: '#e5e7eb', title: 'Energy (kWh)', tickfont: { size: 11, color: '#6b7280' } },
    font: { family: 'Poppins, sans-serif', color: '#6b7280' }
  };

  Plotly.newPlot('solar-mix-chart', [traceGrid, traceSolar], layout, { displayModeBar: false, responsive: true });
};
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
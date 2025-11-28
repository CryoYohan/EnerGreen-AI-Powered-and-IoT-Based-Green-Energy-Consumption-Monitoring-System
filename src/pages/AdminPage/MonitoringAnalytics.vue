<template>
  <div class="min-h-screen dark:bg-gray-900 min-w-screen flex flex-col bg-[#F9FAFB] font-poppins">
    <AdminHeader />
    <Heading title="Monitoring & Analytics" subtitle="Monitor your key metrics and subscription performance" />

    <div class="w-full flex flex-col lg:flex-row justify-between items-stretch gap-2  flex-1">
      <div class="w-full lg:w-[70%]">
        <ReusableBarChart 
          :title="chartTitle" 
          :activePeriod="activePeriod"
          @update:activePeriod="changePeriod" 
          :periods="['Weekly', 'Monthly', 'Yearly']" 
          
          :dailyData="[]" 
          :weeklyData="chartData" 
          :monthlyData="chartData" 
          :yearlyData="chartData"
          
          :xAxisLabel="xAxisLabel" 
          tooltipUnit="kWh"
        />
      </div>

      <div class="w-full lg:w-[30%]">
        <FiltersCard 
          :households="householdsList" 
          :totalKwh="currentTotalKwh"
          @update:household="handleHouseholdChange"
          @export="handleExport" 
        />
      </div>
    </div>
    
    <HealthImpact 
    :stats="deviceStats"
    :totalKwh="currentTotalKwh" 
    />
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { db } from "@/firebase.js";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";

// Import Export Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue";
import FiltersCard from "@/components/AdminComponents/MonitoringAnalytics/FiltersCard.vue";
import HealthImpact from "@/components/AdminComponents/MonitoringAnalytics/HealthImpact.vue";

// --- State ---
const activePeriod = ref("Weekly");
const selectedDeviceId = ref('all');
const householdsList = ref([]);
const chartData = ref([]); // This drives the chart
const currentTotalKwh = ref(0);
const chartTitle = ref("Global Energy Consumption");
const deviceStats = ref({
  total: 0,
  active: 0,
  offline: 0,
  uptime: 100,
  latency: 0 
});

const xAxisLabel = computed(() => activePeriod.value === 'Yearly' ? 'Month' : 'Date');

// --- 1. Load Data on Mount ---
onMounted(async () => {
  try {
    const devicesSnap = await getDocs(collection(db, "devices"));
    
    // 1. Map for Dropdown
    householdsList.value = devicesSnap.docs.map(doc => ({
      deviceId: doc.data().deviceId,
      ownerName: doc.data().ownerName || 'Unassigned Device' 
    }));

    // 2. Calculate System Health
    const allDevices = devicesSnap.docs.map(doc => doc.data());
    const total = allDevices.length;
    const active = allDevices.filter(d => d.status === 'Active').length;
    
    deviceStats.value.total = total;
    deviceStats.value.active = active;
    deviceStats.value.offline = total - active;
    deviceStats.value.uptime = total > 0 ? ((active / total) * 100).toFixed(1) : 100;

    // 3. Load Chart Data
    refreshData(); 
  } catch (e) {
    console.error("Error loading data:", e);
  }
});

// --- 2. Event Handlers ---
const changePeriod = (newPeriod) => {
  activePeriod.value = newPeriod;
  refreshData();
};

const handleHouseholdChange = (deviceId) => {
  selectedDeviceId.value = deviceId;
  refreshData();
};

const refreshData = () => {
  if (selectedDeviceId.value === 'all') {
    chartTitle.value = `Global Consumption (${activePeriod.value})`;
    fetchGlobalData();
  } else {
    const hh = householdsList.value.find(h => h.deviceId === selectedDeviceId.value);
    chartTitle.value = `Consumption: ${hh?.ownerName || ''} (${activePeriod.value})`;
    fetchSingleDeviceData(selectedDeviceId.value);
  }
};

const getQueryLimit = () => {
  switch(activePeriod.value) {
    case 'Weekly': return 7;
    case 'Monthly': return 30;
    case 'Yearly': return 365;
    default: return 7;
  }
};

// --- 3. Data Fetching & Processing ---

// Helper to sum up grid + solar
const calculateTotal = (item) => (item.gridKwhTotal || 0) + (item.solarKwhTotal || 0);

// A. Single Device Fetch
const fetchSingleDeviceData = async (deviceId) => {
  try {
    const start = performance.now(); // Measure latency
    
    const q = query(
      collection(db, `devices/${deviceId}/daily_summaries`),
      orderBy('date', 'desc'),
      limit(getQueryLimit())
    );
    const snapshot = await getDocs(q);
    const rawData = snapshot.docs.map(doc => doc.data());
    
    processDataForChart(rawData);
    
    const end = performance.now();
    deviceStats.value.latency = Math.round(end - start);
  } catch (e) {
    console.error("Error fetching device stats:", e);
    chartData.value = [];
    currentTotalKwh.value = 0;
  }
};

// B. Global (All Devices) Fetch
const fetchGlobalData = async () => {
  try {
    const start = performance.now();
    
    const promises = householdsList.value.map(async (device) => {
      const q = query(
        collection(db, `devices/${device.deviceId}/daily_summaries`),
        orderBy('date', 'desc'),
        limit(getQueryLimit())
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    });

    const allDevicesData = await Promise.all(promises);
    const combinedData = allDevicesData.flat();

    // AGGREGATE BY DATE (Fixes the bug!)
    // We must combine data from different devices that happened on the SAME DAY
    const groupedByDate = {};
    combinedData.forEach(item => {
      if (!groupedByDate[item.date]) {
        // Initialize if date not seen yet
        groupedByDate[item.date] = { 
            date: item.date, 
            gridKwhTotal: 0, 
            solarKwhTotal: 0 
        };
      }
      // Add to existing total for that date
      groupedByDate[item.date].gridKwhTotal += (item.gridKwhTotal || 0);
      groupedByDate[item.date].solarKwhTotal += (item.solarKwhTotal || 0);
    });

    // Convert object back to array
    const aggregatedData = Object.values(groupedByDate);
    
    processDataForChart(aggregatedData);

    const end = performance.now();
    deviceStats.value.latency = Math.round(end - start);
  } catch (error) {
    console.error("Error calculating global stats:", error);
  }
};

// --- 4. Chart Processing Engine ---
const processDataForChart = (rawData) => {
  // Sort newest to oldest first to ensure correct slicing
  rawData.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let processed = [];
  
  if (activePeriod.value === 'Yearly') {
    // Sum by Month (Jan, Feb...)
    const monthlyTotals = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    rawData.forEach(item => {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`; // e.g. "2025-10"
      
      if (!monthlyTotals[key]) {
        monthlyTotals[key] = { 
          label: monthNames[d.getMonth()], 
          value: 0,
          sortTime: d.getTime() 
        };
      }
      monthlyTotals[key].value += calculateTotal(item);
    });

    processed = Object.values(monthlyTotals)
      .sort((a, b) => a.sortTime - b.sortTime) // Sort chronologically
      .slice(-12); // Last 12 months

  } else {
    // Daily Bars (Weekly/Monthly)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    processed = rawData.map(item => {
      const d = new Date(item.date);
      return {
        // For Weekly, show "Mon". For Monthly, show date "10-24"
        label: activePeriod.value === 'Weekly' ? dayNames[d.getUTCDay()] : item.date.slice(5), 
        value: parseFloat(calculateTotal(item).toFixed(2)),
        sortTime: d.getTime()
      };
    })
    .sort((a, b) => a.sortTime - b.sortTime); // Sort Oldest -> Newest for Chart
  }

  chartData.value = processed;
  currentTotalKwh.value = processed.reduce((acc, curr) => acc + curr.value, 0);
};

// --- 5. EXPORT ENGINES ---
const handleExport = (format) => {
  if (chartData.value.length === 0) {
    alert("No data available to export.");
    return;
  }
  
  const filename = `Energy_Report_${selectedDeviceId.value}_${activePeriod.value}`;

  if (format === 'csv') exportCSV(filename);
  if (format === 'pdf') exportPDF(filename);
  if (format === 'word') exportWord(filename);
};

const exportCSV = (filename) => {
  const headers = "Time Period,Consumption (kWh)\n";
  const rows = chartData.value.map(r => `${r.label},${r.value}`).join("\n");
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

const exportPDF = (filename) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(40, 167, 69); 
  doc.text("EnerGreen Analytics Report", 14, 20);
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`View: ${chartTitle.value}`, 14, 36);
  doc.text(`Total Consumption: ${currentTotalKwh.value.toFixed(2)} kWh`, 14, 42);

  const tableData = chartData.value.map(r => [r.label, r.value + ' kWh']);
  autoTable(doc, {
    startY: 50,
    head: [['Time Period', 'Consumption']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [40, 167, 69] } 
  });
  doc.save(`${filename}.pdf`);
};

const exportWord = async (filename) => {
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: "Time Period", bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: "Consumption (kWh)", bold: true })] }),
      ],
    }),
    ...chartData.value.map(r => 
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(r.label)] }),
          new TableCell({ children: [new Paragraph(r.value.toString())] }),
        ],
      })
    )
  ];

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: "EnerGreen Analytics Report", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: `Generated: ${new Date().toLocaleString()}` }),
        new Paragraph({ text: `Total: ${currentTotalKwh.value.toFixed(2)} kWh` }),
        new Paragraph({ text: "" }), 
        new Table({
          rows: tableRows,
          width: { size: 100, type: "pct" }
        })
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};
</script>
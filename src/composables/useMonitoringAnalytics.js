import { ref, computed, onMounted } from "vue";
import { monitoringService } from "@/services/monitoringService";
import { exportService } from "@/services/exportService";

/**
 * Composable for Monitoring & Analytics Logic.
 * Handles data fetching via service, data processing for charts, and export logic.
 */
export function useMonitoringAnalytics() {
  // State
  const activePeriod = ref("Weekly");
  const selectedDeviceId = ref('all');
  const householdsList = ref([]);
  const chartData = ref([]); 
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

  // --- Initialization ---
  const initMonitoringData = async () => {
    try {
      const allDevices = await monitoringService.fetchAllDevices();
      
      // 1. Map for Dropdown
      householdsList.value = allDevices.map(d => ({
        deviceId: d.deviceId,
        ownerName: d.ownerName || 'Unassigned Device' 
      }));

      // 2. Stats
      const total = allDevices.length;
      const active = allDevices.filter(d => d.status === 'Active').length;
      
      deviceStats.value.total = total;
      deviceStats.value.active = active;
      deviceStats.value.offline = total - active;
      deviceStats.value.uptime = total > 0 ? ((active / total) * 100).toFixed(1) : 100;

      // 3. Initial Data Load
      await refreshData(); 
    } catch (e) {
      console.error("Error loading initial monitoring data:", e);
    }
  };

  // --- Actions ---
  const changePeriod = (newPeriod) => {
    activePeriod.value = newPeriod;
    refreshData();
  };

  const handleHouseholdChange = (deviceId) => {
    selectedDeviceId.value = deviceId;
    refreshData();
  };

  // --- Data Fetching Logic ---
  const getQueryLimit = () => {
    switch(activePeriod.value) {
      case 'Weekly': return 7;
      case 'Monthly': return 30;
      case 'Yearly': return 365;
      default: return 7;
    }
  };

  const calculateTotal = (item) => (item.gridKwhTotal || 0) + (item.solarKwhTotal || 0);

  const refreshData = async () => {
    if (selectedDeviceId.value === 'all') {
      chartTitle.value = `Global Consumption (${activePeriod.value})`;
      await fetchGlobalData();
    } else {
      const hh = householdsList.value.find(h => h.deviceId === selectedDeviceId.value);
      chartTitle.value = `Consumption: ${hh?.ownerName || ''} (${activePeriod.value})`;
      await fetchSingleDeviceData(selectedDeviceId.value);
    }
  };

  const fetchSingleDeviceData = async (deviceId) => {
    try {
      const start = performance.now();
      const rawData = await monitoringService.fetchDeviceDailySummaries(deviceId, getQueryLimit());
      processDataForChart(rawData);
      deviceStats.value.latency = Math.round(performance.now() - start);
    } catch (e) {
      console.error("Error fetching device stats:", e);
      chartData.value = [];
      currentTotalKwh.value = 0;
    }
  };

  const fetchGlobalData = async () => {
    try {
      const start = performance.now();
      
      const promises = householdsList.value.map(device => 
        monitoringService.fetchDeviceDailySummaries(device.deviceId, getQueryLimit())
      );

      const allDevicesData = await Promise.all(promises);
      const combinedData = allDevicesData.flat();

      // Aggregate by Date
      const groupedByDate = {};
      combinedData.forEach(item => {
        if (!groupedByDate[item.date]) {
          groupedByDate[item.date] = { 
              date: item.date, 
              gridKwhTotal: 0, 
              solarKwhTotal: 0 
          };
        }
        groupedByDate[item.date].gridKwhTotal += (item.gridKwhTotal || 0);
        groupedByDate[item.date].solarKwhTotal += (item.solarKwhTotal || 0);
      });

      processDataForChart(Object.values(groupedByDate));
      deviceStats.value.latency = Math.round(performance.now() - start);
    } catch (error) {
      console.error("Error calculating global stats:", error);
    }
  };

  // --- Data Processing ---
  const processDataForChart = (rawData) => {
    rawData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let processed = [];
    
    if (activePeriod.value === 'Yearly') {
      const monthlyTotals = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      rawData.forEach(item => {
        const d = new Date(item.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        
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
        .sort((a, b) => a.sortTime - b.sortTime)
        .slice(-12);
    } else {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      processed = rawData.map(item => {
        const d = new Date(item.date);
        return {
          label: activePeriod.value === 'Weekly' ? dayNames[d.getUTCDay()] : item.date.slice(5), 
          value: parseFloat(calculateTotal(item).toFixed(2)),
          sortTime: d.getTime()
        };
      }).sort((a, b) => a.sortTime - b.sortTime);
    }

    chartData.value = processed;
    currentTotalKwh.value = processed.reduce((acc, curr) => acc + curr.value, 0);
  };

  // --- Export ---
  const handleExport = (format) => {
    if (chartData.value.length === 0) {
      alert("No data available to export.");
      return;
    }
    const filename = `Energy_Report_${selectedDeviceId.value}_${activePeriod.value}`;
    
    if (format === 'csv') exportService.exportCSV(filename, chartData.value);
    if (format === 'pdf') exportService.exportPDF(filename, chartData.value, chartTitle.value, currentTotalKwh.value);
    if (format === 'word') exportService.exportWord(filename, chartData.value, chartTitle.value, currentTotalKwh.value);
  };

  return {
    // State
    activePeriod,
    selectedDeviceId,
    householdsList,
    chartData,
    currentTotalKwh,
    chartTitle,
    deviceStats,
    xAxisLabel,
    
    // Actions
    initMonitoringData,
    changePeriod,
    handleHouseholdChange,
    handleExport
  };
}

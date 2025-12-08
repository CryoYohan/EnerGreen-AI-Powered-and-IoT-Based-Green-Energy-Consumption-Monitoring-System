import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import * as solarService from '@/services/solarService.js';
import { weatherService } from '@/services/weatherService.js';
import { exportService } from '@/services/exportService.js';
import Plotly from 'plotly.js-dist-min';
import { SunIcon, BoltIcon, Battery50Icon } from '@heroicons/vue/24/outline';

/**
 * Composable for Solar Panel Page Logic.
 * Integrates Solar Service, Weather Service, and Export Service.
 */
export function useSolarPanel() {
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
  
  // Weather State
  const weather = ref(null);
  const solarEfficiency = ref(0);

  const { userProfile } = useAuth('default-app-id');
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

  // --- ACTIONS ---

  const initSolarData = async () => {
      const profile = userProfile.value;
      
      if (!profile || !profile.deviceId) {
          // Wait for auth or profile to load if it's missing initially
          return;
      }

      loading.value = true;
      error.value = null;

      try {
          // Parallel Fetch: Solar Data + Weather Data
          const [rate, carbon, summaries, weatherData] = await Promise.all([
              solarService.getUtilityRate(profile.electricityProvider),
              solarService.getCarbonRate(),
              solarService.getDailySummaries(profile.deviceId),
              weatherService.getCurrentWeather() // Uses default Lat/Lon (Cebu) for now
          ]);
          
          currentRate.value = rate;
          carbonRate.value = carbon;
          rawData.value = summaries;
          
          // Weather Update
          weather.value = weatherData;
          solarEfficiency.value = weatherService.calculateSolarEfficiency(weatherData);

          // Realtime Listener
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
      const layout = { 
          barmode: 'stack', 
          margin: { l: 40, r: 20, t: 20, b: 40 }, 
          paper_bgcolor: 'rgba(0,0,0,0)', 
          plot_bgcolor: 'rgba(0,0,0,0)', 
          showlegend: false, 
          xaxis: { gridcolor: '#e5e7eb', showgrid: false }, 
          yaxis: { gridcolor: '#e5e7eb', title: 'Energy (kWh)' }, 
          font: { family: 'Poppins, sans-serif' } 
      };
      
      Plotly.newPlot('solar-mix-chart', [traceGrid, traceSolar], layout, { displayModeBar: false, responsive: true });
  };

  const handleExport = (format) => {
    if (!rawData.value || !rawData.value.length) {
        alert("No data available to export.");
        return;
    }

    const filename = `EnerGreen_Solar_Report_${new Date().toISOString().split('T')[0]}`;
    const exportData = [...rawData.value].reverse().map(d => ({
        label: d.date, // Standardize for export service
        value: (d.solarKwhTotal || 0).toFixed(2), // Main value for chart exports
        // Extra fields specific to this report
        grid: (d.gridKwhTotal || 0).toFixed(2),
        solar: (d.solarKwhTotal || 0).toFixed(2),
        savings: ((d.solarKwhTotal || 0) * currentRate.value).toFixed(2)
    }));

    // CSV needs custom columns, so we implement specific CSV logic or map it
    // For simplicity, reusing the logic from the page but moving towards service
    if (format === 'csv') {
        const headers = "Date,Grid Usage (kWh),Solar Gen (kWh),Savings (PHP)\n";
        const rows = exportData.map(r => `${r.label},${r.grid},${r.solar},${r.savings}`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        import("file-saver").then(m => m.saveAs(blob, `${filename}.csv`));
    }
    
    // PDF and Word can use the generic service but with custom titles
    if (format === 'pdf') {
        exportService.exportPDF(filename, exportData, "Solar Generation Report", impactStats.value.savingsValue);
    }
    if (format === 'word') {
        exportService.exportWord(filename, exportData, "Solar Generation Report", impactStats.value.savingsValue);
    }
  };

  // --- LIFECYCLE & WATCHERS ---
  
  // Watch for profile to be ready
  watch(() => userProfile.value?.deviceId, (newId) => {
      if (newId) initSolarData();
  }, { immediate: true });

  watch(activeFilter, updateCharts);
  watch(hourlyData, () => {
      if (activeFilter.value === 'Daily') updateCharts();
  });

  onUnmounted(() => {
    if (hourlyUnsubscribe) hourlyUnsubscribe();
  });

  return {
    // State
    timeFilters,
    activeFilter,
    loading,
    error,
    weather,
    solarEfficiency,
    
    // Metrics
    calculatedMetrics,
    impactStats,
    
    // Actions
    handleExport,
    updateCharts // Exposed in case of manual refresh needs
  };
}

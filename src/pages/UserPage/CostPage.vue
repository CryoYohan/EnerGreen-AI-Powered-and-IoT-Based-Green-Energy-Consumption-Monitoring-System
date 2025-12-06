<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">

    <UserHeader />

    <Heading
      title="Electric Bill Insights"
      subtitle="Track your electricity consumption patterns and cost overtime"
    />
    
    <Cost 
      :loading="loading"
      :error="error"
      :showNoDeviceMessage="showNoDeviceMessage"
      :timeFilters="timeFilters"
      :activeFilter="activeFilter"
      @update:activeFilter="activeFilter = $event"
      :userBudget="userBudget"
      @update:userBudget="userBudget = $event"
      :calculatedMetrics="calculatedMetrics"
      :breakdownStats="breakdownStats"
      :billingHistory="billingHistory"
      :chartPlotData="chartPlotData"
      :raw-data="rawData"
    />
    
    <Footer />
    
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import * as costService from '@/services/costService.js';

import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import Cost from "@/components/UserComponents/Cost/Cost.vue";

// --- STATE MANAGEMENT ---
const timeFilters = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
const activeFilter = ref('Weekly');
const loading = ref(true); // Controls the full page skeleton/spinner
const chartLoading = ref(false); // Optional: if you want a subtle spinner just for the chart
const error = ref(null);
const userBudget = ref(5000);
const showNoDeviceMessage = ref(false);

// We need to store these RAW values so we can re-use them without refetching
const rawSummaries = ref([]);
const utilityRate = ref(0);

// Display Data
const rawData = ref([]); 
const calculatedMetrics = ref([]);
const breakdownStats = ref({ gridCost: 0, solarSavings: 0 });
const billingHistory = ref([]);
const chartPlotData = ref({ xValues: [], yCost: [], yUsage: [] });

const { userProfile } = useAuth('default-app-id');

// --- 1. HEAVY LIFTING (Server Fetch) ---
const fetchInitialData = async () => {
  const profile = userProfile.value;

  if (!profile || !profile.deviceId) {
    showNoDeviceMessage.value = true;
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;
  showNoDeviceMessage.value = false;

  try {
    // Fetch data from Server ONCE
    const [rate, summaries] = await Promise.all([
      costService.getUtilityRate(profile.electricityProvider),
      costService.getDailySummaries(profile.deviceId)
    ]);
    
    // Store raw data for client-side reuse
    rawSummaries.value = summaries;
    utilityRate.value = rate;
    rawData.value = summaries; // Pass to child if needed

    if (summaries.length === 0) {
      handleEmptyData();
    } else {
      // Calculate data that DOES NOT depend on the time filter
      breakdownStats.value = costService.calculateBreakdownStats(summaries, rate);
      billingHistory.value = costService.calculateBillingHistory(summaries, rate);
      
      // Calculate data that depends on Budget
      updateBudgetMetrics();

      // Calculate data that depends on Time Filter
      updateChartData();
    }
  } catch (e) {
    console.error("Failed to fetch cost data:", e);
    error.value = "Failed to load cost data.";
  } finally {
    loading.value = false;
  }
};

// --- 2. FAST UPDATES (Client Side Calculation) ---

// Updates only the KPIs when Budget changes (Instant)
const updateBudgetMetrics = () => {
    if (rawSummaries.value.length > 0) {
        calculatedMetrics.value = costService.calculateKpiMetrics(
            rawSummaries.value, 
            utilityRate.value, 
            userBudget.value
        );
    }
};

// Updates only the Chart when Filter changes (Instant)
const updateChartData = () => {
    if (rawSummaries.value.length > 0) {
        // This runs instantly on the client, no await needed
        chartPlotData.value = costService.processDataForCharts(
            rawSummaries.value, 
            activeFilter.value, 
            utilityRate.value
        );
    }
};

const handleEmptyData = () => {
    calculatedMetrics.value = [];
    breakdownStats.value = { gridCost: 0, solarSavings: 0 };
    billingHistory.value = [];
    chartPlotData.value = { xValues: [], yCost: [], yUsage: [] };
}

// --- WATCHERS ---

// 1. Watch for Device ID (Initial Load)
watch(() => userProfile.value?.deviceId, (newDeviceId) => {
  if (newDeviceId) {
    fetchInitialData();
  }
}, { immediate: true });

// 2. Watch Filter: Only update Chart (No Loading Spinner)
watch(activeFilter, () => {
    updateChartData();
});

// 3. Watch Budget: Only update KPIs (No Loading Spinner)
watch(userBudget, () => {
    updateBudgetMetrics();
});

</script>
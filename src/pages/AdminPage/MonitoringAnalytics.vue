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
import { onMounted } from "vue";
import { useMonitoringAnalytics } from "@/composables/useMonitoringAnalytics.js";

// Components
import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue";
import FiltersCard from "@/components/AdminComponents/MonitoringAnalytics/FiltersCard.vue";
import HealthImpact from "@/components/AdminComponents/MonitoringAnalytics/HealthImpact.vue";

const {
  activePeriod,
  householdsList,
  chartData,
  currentTotalKwh,
  chartTitle,
  deviceStats,
  xAxisLabel,
  
  initMonitoringData,
  changePeriod,
  handleHouseholdChange,
  handleExport
} = useMonitoringAnalytics();

onMounted(() => {
  initMonitoringData();
});
</script>

<template>
  <div
    class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <AdminHeader />
    <Heading title="Admin Dashboard"/>
    <MetricsCard :metrics="dailyMetrics" size="large"  />
    <FirmwareEchoHeroes />
    <ReusableBarChart
      title="Electricity Usage - Trends"
      :activePeriod="activePeriod"
      @update:activePeriod="activePeriod = $event"
      :periods="['Daily', 'Weekly', 'Monthly', 'Yearly']"
      :dailyData="dailyData"
      :weeklyData="weeklyData"
      :monthlyData="monthlyData"
      :yearlyData="yearlyData"
      xAxisLabel="Time"
      tooltipUnit="kWh"
    />
    <OverviewStatus />
    <Footer />
  </div>
</template>

<script setup>
import { ref } from "vue";

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import FirmwareEchoHeroes from "@/components/AdminComponents/Home/FirmwareEchoHeroes.vue";
import OverviewStatus from "@/components/AdminComponents/Home/OverviewStatus.vue";

// Metrics data (used for MetricsCard)
const dailyMetrics = [
  {
          title: 'Total devices',
          icon: '/src/Images/Icons/devices.svg',
          cost: '1,270',
          definition: 'All Registered Units'
        },
        {
          title: 'Active Users',
          icon: '/src/Images/Icons/users.svg',
          cost: '241',
          definition: 'Users Currently Active'
        },
        {
          title: 'Energy Saved',
          icon: '/src/Images/Icons/tricity.svg',
          cost: '24.8 MWh',
          definition: 'Reduced Consumption'
        },
        {
          title: 'System Health',
          icon: '/src/Images/Icons/health.svg',
          cost: '98.5%',
          definition: 'System Running Smoothly'
        },

];


const activePeriod = ref("Weekly");

const dailyData = [
  { label: "12AM", value: 5 },
  { label: "2AM", value: 3 },
  { label: "4AM", value: 2 },
  { label: "6AM", value: 8 },
  { label: "8AM", value: 15 },
  { label: "10AM", value: 20 },
  { label: "12PM", value: 25 },
  { label: "2PM", value: 28 },
  { label: "4PM", value: 30 },
  { label: "6PM", value: 35 },
  { label: "8PM", value: 25 },
  { label: "10PM", value: 15 },
];

const weeklyData = [
  { label: "Mon", value: 20 },
  { label: "Tue", value: 25 },
  { label: "Wed", value: 22 },
  { label: "Thu", value: 18 },
  { label: "Fri", value: 24 },
  { label: "Sat", value: 27 },
  { label: "Sun", value: 19 },
];

const monthlyData = [
  { label: "Jan", value: 420 },
  { label: "Feb", value: 380 },
  { label: "Mar", value: 410 },
  { label: "Apr", value: 350 },
  { label: "May", value: 480 },
  { label: "Jun", value: 520 },
  { label: "Jul", value: 600 },
  { label: "Aug", value: 580 },
  { label: "Sep", value: 450 },
  { label: "Oct", value: 400 },
  { label: "Nov", value: 370 },
  { label: "Dec", value: 430 },
];

const yearlyData = [
  { label: "2025", value: 1450 },
  { label: "2026", value: 1520 },
  { label: "2027", value: 1390 },
  { label: "2028", value: 1500 },
];
</script>

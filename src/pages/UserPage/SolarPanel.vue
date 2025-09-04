<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">

    <UserHeader />
    <div class="flex flex-col items-center justify-between sm:flex-row">
      <Heading title="Solar Panel Integration" subtitle="Monitor and manage your solar energy system" />
      <AddPanelBtn />
    </div>
    <MetricsCard :metrics="dailyMetrics" size="large" />
    <ReusableBarChart
      title="Generation Pattern"
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
    <PanelsCard />
    <Footer />
  </div>
</template>
<script setup>
import { ref } from "vue";

import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import PanelsCard from "@/components/UserComponents/SolarPanel/PanelsCard.vue";
import AddPanelBtn from "@/components/UserComponents/SolarPanel/AddPanelBtn.vue";

// Metrics data (used for MetricsCard)
const dailyMetrics = [
  {
    title: 'Current Cost',
    icon: '/src/Images/Icons/electric.svg',
    cost: '4.2kWh',
    definition: 'Current rate'
  },
  {
    title: 'Solar Generation',
    icon: '/src/Images/Icons/sun.svg',
    cost: '1.05 kWh',
    definition: 'Today'
  },
    {
    title: 'Grid Export',
    icon: '/src/Images/Icons/grid.svg',
    cost: '1.05 kWh',
    definition: 'Today'
  },
    {
    title: 'Lifetime Savings',
    icon: '/src/Images/Icons/peso.svg',
    cost: '1.05 kWh',
    definition: 'Today'
  },
];

// Chart logic
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

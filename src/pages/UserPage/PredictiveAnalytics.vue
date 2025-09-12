<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
    <UserHeader />
    <div class="flex flex-col items-center justify-between sm:flex-row">
      <Heading title="Predictive Analysis" subtitle="Monitor your carbon emission and find ways to reduce them." />
      <BackButton />
    </div>

    <MetricsCard :metrics="dailyMetrics" size="special" />
    <EmissionDashboard :emissionSources="sources" :tips="tipsList" />
    <ReusableBarChart
      title="Predicted Carbon Emission"
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
      <Footer />
      
  </div>
</template>
<script setup>
import { ref } from "vue";


import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import ReusableBarChart from "@/components/ReusableComponents/BarChart.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import BackButton from "@/components/UserComponents/PredictiveAnalysis/BackButton.vue";
import EmissionDashboard from "@/components/ReusableComponents/EmissionCard.vue";

const sources = [
  { id: 1, name: 'Air Conditioning', percentage: 40 },
  { id: 2, name: 'Lighting', percentage: 30 },
  { id: 3, name: 'Computers', percentage: 30 }
];

const tipsList = [
  { id: 1, title: 'Use Natural Light', description: 'Open windows during the day' },
  { id: 2, title: 'Sleep Mode', description: 'Put PCs to sleep when not in use' }
];

// Metrics data (used for MetricsCard)
const dailyMetrics = [
  {
          title: 'Predicted CO₂ Emissions',
          icon: '/src/Images/Icons/conditioner.svg',
          cost: '245.8 kg CO₂',
          definition: '↓ 12% less than last month'
        },
        {
          title: 'Tress Equivalent',
          icon: '/src/Images/Icons/tree.svg',
          cost: '68 trees',
          definition: 'Needed to offset your emissions'
        },
        {
          title: 'Predicted CO₂ Savings',
          icon: '/src/Images/Icons/leaf.svg',
          cost: '156.2 kg CO₂',
          definition: '↑ Saved through solar energy'
        },
                {
          title: 'Predicted Cost',
          icon: '/src/Images/Icons/pouch.svg',
          cost: '156.2 kg CO₂',
          definition: '↑ Saved through solar energy'
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

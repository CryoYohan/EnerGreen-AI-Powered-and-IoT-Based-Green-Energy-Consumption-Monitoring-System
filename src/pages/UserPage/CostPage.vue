<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">

    <UserHeader />

    <Heading
      title="Electric Bill Insights"
      subtitle="Track your electricity consumption patterns and cost overtime"
    />
    <MetricsCard :metrics="dailyMetrics" size="large" />

    <Cost />
    
    <Footer />
    
  </div>
</template>

<script setup>
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import Cost from "@/components/UserComponents/Cost/Cost.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";


// Metrics data (used for MetricsCard)
const dailyMetrics = [
  {
    title: 'Current Month',
    icon: '/src/Images/Icons/peso.svg',
    cost: '4.2kWh',
    definition: 'Current rate'
  },
  {
    title: 'Usage (kWh)',
    icon: '/src/Images/Icons/electric.svg',
    cost: '1.05 kWh',
    definition: 'Today'
  },
    {
    title: 'Avg Daily Cost',
    icon: '/src/Images/Icons/peso.svg',
    cost: '1.05 kWh',
    definition: 'Today'
  },
    {
    title: 'Peak Hour Rate',
    icon: '/src/Images/Icons/peso.svg',
    cost: '1.05 kWh',
    definition: 'Today'
  },
];

</script>
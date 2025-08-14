<template>
  <div
    class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <AdminHeader />
    <Heading title="Hardware Management"/>
    <MetricsCard :metrics="dailyMetrics" size="large"  />
    <InventoryDevice />
    <Devices />
    <Firmware />
    <Footer />
  </div>
</template>

<script setup>

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import InventoryDevice from "@/components/AdminComponents/Hardware/InventoryDevice.vue";
import Devices from "@/components/AdminComponents/Hardware/Devices.vue";
import Firmware from "@/components/AdminComponents/Hardware/Firmware.vue";
// Metrics data (used for MetricsCard)
const dailyMetrics = [
  {
          title: 'Total devices',
          icon: '/src/Images/Icons/devices.svg',
          cost: '1,270',
          definition: 'All Registered Units'
        },
        {
          title: 'Active',
          icon: '/src/Images/Icons/active.svg',
          cost: '1,200',
          definition: 'Users Currently Active'
        },
        {
          title: 'Offline',
          icon: '/src/Images/Icons/offlline.svg',
          cost: '60',
          definition: 'Reduced Consumption'
        },
        {
          title: 'Maintenance',
          icon: '/src/Images/Icons/maintenance.svg',
          cost: '10',
          definition: 'System Running Smoothly'
        },

];

</script>

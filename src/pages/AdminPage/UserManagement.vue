<template>
  <div
    class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <AdminHeader />
    <Heading title="User Management"/>
    <MetricsCard :metrics="dailyMetrics" size="large"  />
    <Users />
    <UsersTable />
    <Footer />
  </div>
</template>

<script setup>

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import Users from "@/components/AdminComponents/Users/Users.vue";
import UsersTable from "@/components/AdminComponents/Users/UsersTable.vue";
// Metrics data (used for MetricsCard)
const dailyMetrics = [
  {
          title: 'Total Users',
          icon: '/src/Images/Icons/totalusers.svg',
          cost: '127',
        },
        {
          title: 'Active Users',
          icon: '/src/Images/Icons/users.svg',
          cost: '123',
        },
        {
          title: 'Inactive Users',
          icon: '/src/Images/Icons/inactiveusers.svg',
          cost: '4',
        },
        {
          title: 'New Users',
          icon: '/src/Images/Icons/newusers.svg',
          cost: '12',
        },

];

</script>

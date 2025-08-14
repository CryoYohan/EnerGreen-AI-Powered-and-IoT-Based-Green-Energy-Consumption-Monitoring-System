<template>
  <div
    class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <AdminHeader />
   
    <AdminProfile />
    <Footer />
  </div>
</template>
<script setup>

import Footer from "@/components/ReusableComponents/Footer.vue";
import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import AdminProfile from "@/components/AdminComponents/Profile/AdminProfile.vue";

</script>

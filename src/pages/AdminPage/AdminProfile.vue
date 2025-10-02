<template>
  <div
    class="min-h-screen dark:bg-gray-900 min-w-screen flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <AdminHeader />
   
    <ProfileComponent />
    <Footer />
  </div>
</template>
<script setup>

import Footer from "@/components/ReusableComponents/Footer.vue";
import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import ProfileComponent from "@/components/AdminComponents/Profile/AdminProfile.vue";

</script>

<template>
  <div
    class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <UserHeader />
   
    <Profile />
    <Footer />
  </div>
</template>
<script setup>


import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Profile from "@/components/UserComponents/Profile/Profile.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";

</script>

<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">    
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

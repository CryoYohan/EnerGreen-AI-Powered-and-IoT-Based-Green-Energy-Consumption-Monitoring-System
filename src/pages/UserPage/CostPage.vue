<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">

    <UserHeader />

    <Heading
      title="Electric Bill Insights"
      subtitle="Track your electricity consumption patterns and cost overtime"
    />
    
    <Cost />
    
    <Footer />
    
  </div>
</template>

<script setup>
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import Cost from "@/components/UserComponents/Cost/Cost.vue";
</script>
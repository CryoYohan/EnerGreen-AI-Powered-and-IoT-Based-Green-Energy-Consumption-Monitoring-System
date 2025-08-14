<template>
  <div
    class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <UserHeader />
    <div class="flex flex-col items-center justify-between sm:flex-row">
      <Heading title="Learning Resources" subtitle="Explore our comprehensive collection of educational 
      materials about renewable energy, sustainability, and smart home energy management." />
    </div>
    
    <VideosCard />
    <FilesCard />
    <UsefulLinks />
    <Footer />
  </div>
</template>
<script setup>


import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import VideosCard from "@/components/UserComponents/LearningResources/VideosCard.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import FilesCard from "@/components/UserComponents/LearningResources/FilesCard.vue";
import UsefulLinks from "@/components/UserComponents/LearningResources/UsefulLinks.vue";
</script>

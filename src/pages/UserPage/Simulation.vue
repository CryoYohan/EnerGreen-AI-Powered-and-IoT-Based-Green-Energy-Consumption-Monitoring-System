<template>
  <div
    class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <UserHeader />
      <Heading
        title="Simulate Solar"
        subtitle="Curious about Solar? See how much you could save. Use our simulator to preview energy and cost savings based on your usage patterns and location"
      />
      <Simulation />
      <Footer />
      
  </div>
</template>
<script setup>
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Simulation from "@/components/UserComponents/Simulation/Simulation.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";

</script>

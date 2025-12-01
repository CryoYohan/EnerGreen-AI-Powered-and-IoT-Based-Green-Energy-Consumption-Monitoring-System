<template>
  <div class="min-h-screen flex flex-col bg-[#F1F6FA] dark:bg-[#0D2535]">
    <!-- Main content rendered by Vue Router -->
    <main class="flex-1 w-full">
      <router-view />
    </main>

    <!-- Floating Agent Button -->
    <AgentButton />
    
  </div>
</template>

<script setup>
import AgentButton from '@/components/ReusableComponents/AgentButton.vue';
</script>

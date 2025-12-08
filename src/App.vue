<template>
  <div class="min-h-screen flex flex-col bg-[#F1F6FA] dark:bg-[#0D2535]">
    <!-- Main content rendered by Vue Router -->
    <main class="flex-1 w-full">
      <router-view />
    </main>

    <!-- Floating Agent Button -->
    <!-- Only show if User is logged in AND current page requires authentication -->
    <transition name="fade">
      <div v-if="shouldShowAgent">
        <AdminAgentButton v-if="isAdmin" />
        <template v-else>
          <KobeAgentButton @start-tour="startTour" />
          <KobeGuide 
            v-model:isOpen="isTourOpen" 
            :steps="activeTourSteps" 
            @complete="handleTourComplete" 
            @skip="isTourOpen = false"
          />
          <AgentButton />
        </template>
      </div>
    </transition>
    
    <ToastContainer />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';
import AgentButton from '@/components/ReusableComponents/AgentButton.vue';
import AdminAgentButton from '@/components/ReusableComponents/AdminAgentButton.vue';
import KobeAgentButton from '@/components/ReusableComponents/KobeAgentButton.vue';
import KobeGuide from '@/components/ReusableComponents/KobeGuide.vue';
import ToastContainer from '@/components/ReusableComponents/ToastContainer.vue';
import { tourSteps as allTourSteps } from '@/data/kobeTours.js';

const route = useRoute();
const { user, isAdmin, isPremium } = useAuth('default-app-id');
const isTourOpen = ref(false);

// Dynamic Tour Steps based on current page
const activeTourSteps = computed(() => {
  const pageName = route.name; // e.g., 'Home', 'Forecast', 'Appliances'
  return allTourSteps[pageName] || allTourSteps['Home']; // Fallback to Home if undefined
});

const startTour = () => {
  isTourOpen.value = true;
};

const handleTourComplete = () => {
  console.log("Tour completed!");
  isTourOpen.value = false;
};

// Computed Property for Visibility Logic
const shouldShowAgent = computed(() => {
  // Condition A: User must be authenticated
  if (!user.value) return false;

  // Condition B: Current route must be a "protected" route
  if (route.meta.requiresAuth !== true) return false;

  // Condition C: Role-based visibility
  // 1. Admins always see their agent (AdminAgentButton)
  if (isAdmin.value) return true;

  // 2. Regular users (Free OR Premium) can see Kobe/Christine
  return true;
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
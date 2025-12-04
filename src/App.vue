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
        <AgentButton v-else />
      </div>
    </transition>
    
    <ToastContainer />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';
import AgentButton from '@/components/ReusableComponents/AgentButton.vue';
import AdminAgentButton from '@/components/ReusableComponents/AdminAgentButton.vue';
import ToastContainer from '@/components/ReusableComponents/ToastContainer.vue';

const route = useRoute();
const { user, isAdmin } = useAuth('default-app-id');

// Computed Property for Visibility Logic
const shouldShowAgent = computed(() => {
  // Condition A: User must be authenticated
  if (!user.value) return false;

  // Condition B: Current route must be a "protected" route (e.g. Home, Profile)
  // This prevents it from showing on Landing Page or 401 during redirects
  return route.meta.requiresAuth === true;
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
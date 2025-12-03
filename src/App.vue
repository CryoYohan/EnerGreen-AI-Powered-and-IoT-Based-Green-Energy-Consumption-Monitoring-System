<template>
  <div class="min-h-screen flex flex-col bg-[#F1F6FA] dark:bg-[#0D2535]">
    <!-- Main content rendered by Vue Router -->
    <main class="flex-1 w-full">
      <router-view />
    </main>

    <!-- Floating Agent Button -->
    <!-- Only show if User is logged in AND current page requires authentication -->
    <transition name="fade">
      <AgentButton v-if="shouldShowAgent" />
    </transition>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { auth, onAuthStateChanged } from '@/firebase'; 
import { useRoute } from 'vue-router'; // 1. Import useRoute
import AgentButton from '@/components/ReusableComponents/AgentButton.vue';

const user = ref(null);
const route = useRoute(); // 2. Get current route object
let unsubscribe;

// 3. Computed Property for Visibility Logic
const shouldShowAgent = computed(() => {
  // Condition A: User must be authenticated
  if (!user.value) return false;

  // Condition B: Current route must be a "protected" route (e.g. Home, Profile)
  // This prevents it from showing on Landing Page or 401 during redirects
  return route.meta.requiresAuth === true;
});

onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
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
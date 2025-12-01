<template>
  <div class="min-h-screen flex flex-col bg-[#F1F6FA] dark:bg-[#0D2535]">
    <!-- Main content rendered by Vue Router -->
    <main class="flex-1 w-full">
      <router-view />
    </main>

    <!-- Floating Agent Button: Only show if user is logged in -->
    <AgentButton v-if="user" />
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { auth, onAuthStateChanged } from '@/firebase'; // Import auth services
import AgentButton from '@/components/ReusableComponents/AgentButton.vue';

const user = ref(null);
let unsubscribe; // To hold the listener cleanup function

onMounted(() => {
  // Set up a listener that fires whenever the user's auth state changes
  unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser; // Update our reactive variable
  });
});

onUnmounted(() => {
  // Clean up the listener when the component is unmounted
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <div class="grid m-4 sm:m-5 lg:m-10 grid-cols-1 md:grid-cols-2 gap-6 font-poppins dark:bg-gray-900">
    
    <Rankings 
      title="Top Eco-Heroes" 
      subtitle="Monthly Rankings" 
      :heroes="ecoHeroes" 
    />

    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 h-full">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">👋 New Users</h2>
      <p class="text-sm text-gray-500 dark:text-gray-300 mb-4">Recently joined users.</p>
      
      <div class="space-y-3 text-sm max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
        <div 
          v-for="user in recentUsers"
          :key="user.userId"
          class="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
        >
          <div class="flex items-center space-x-3">
            <img :src="user.photoURL || '/src/Images/profile/pfp.png'" class="w-10 h-10 rounded-full object-cover" />
            <div>
              <span class="text-gray-800 dark:text-gray-100 font-medium block">{{ user.name }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-300">{{ formatDate(user.createdAt) }}</span>
            </div>
          </div>
          <span 
            class="text-xs px-2 py-1 rounded-full"
            :class="user.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'"
          >
            {{ user.status }}
          </span>
        </div>
        
        <div v-if="recentUsers.length === 0" class="text-center text-gray-500 py-4">
           No recent users found.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import Rankings from '@/components/ReusableComponents/Rankings.vue';

const props = defineProps({
  users: { type: Array, default: () => [] }
});

// MOCK Heroes (Requires complex billing calculation, leave as mock for visual)
const ecoHeroes = ref([
  { name: "John Bake", co2: "29.4 kg", img: "/src/Images/profile/pfp.png" },
  { name: "Kate Lim", co2: "18 kg", img: "/src/Images/profile/pfp.png" },
  { name: "Marc Homes", co2: "13 kg", img: "/src/Images/profile/pfp.png" },
]);

// DYNAMIC Recent Users
const recentUsers = computed(() => {
  // copy array to avoid mutating prop
  const sorted = [...props.users].sort((a, b) => b.createdAt - a.createdAt);
  return sorted.slice(0, 8); // Show top 8 newest
});

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};
</script>

<style scoped>
/* Keep your scrollbar styles */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
</style>
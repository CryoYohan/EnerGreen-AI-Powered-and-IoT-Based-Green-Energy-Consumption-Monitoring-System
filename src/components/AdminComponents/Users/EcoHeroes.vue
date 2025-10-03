<template>
  <div class="p-6">
    <h2 class="text-lg font-semibold mb-4 flex items-center">
      🏆 Eco Heroes Leaderboard
    </h2>
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm divide-y">
      <div v-for="(hero, idx) in heroes" :key="hero.id" class="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
        <div class="flex items-center space-x-4">
          <img
            :src="hero.avatar || '/src/Images/default-avatar.png'"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ idx + 1 }}. {{ hero.name }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ hero.points }} pts
            </p>
          </div>
        </div>
        <span class="px-3 py-1 text-xs rounded-full font-medium"
          :class="idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'">
          {{ idx === 0 ? "🥇 Gold" : idx === 1 ? "🥈 Silver" : "🥉 Bronze" }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ heroes: Array });
</script>

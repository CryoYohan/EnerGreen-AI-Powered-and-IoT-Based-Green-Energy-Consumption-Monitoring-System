<template>
  <div class="p-6">
    <!-- Header with gradient background -->
    <div class="mb-6">
      <h2 class="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-500 dark:to-green-400 bg-clip-text text-transparent flex items-center gap-3">
        <div class="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 dark:from-yellow-300 dark:to-amber-400 rounded-xl shadow-lg">
          🏆
        </div>
        Eco Heroes Leaderboard
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-300 mt-2 ml-11">
        Top performers making a sustainable impact
      </p>
    </div>

    <!-- Leaderboard Cards -->
    <div class="space-y-3">
      <div 
        v-for="(hero, idx) in heroes" 
        :key="hero.id" 
        class="group relative transition-all duration-300 hover:scale-[1.02]"
      >
        <!-- Background glow effect for top 3 -->
        <div 
          v-if="idx < 3"
          :class="[
            'absolute inset-0 rounded-2xl blur-md opacity-60 group-hover:opacity-80 transition-opacity',
            idx === 0 ? 'bg-yellow-400/30' : 
            idx === 1 ? 'bg-gray-400/30' : 
            'bg-orange-400/30'
          ]"
        ></div>
        
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 group-hover:shadow-xl dark:group-hover:shadow-gray-900/50 transition-all duration-300">
          <div class="flex items-center justify-between p-4">
            <!-- Left Section: Rank & User Info -->
            <div class="flex items-center space-x-4">
              <!-- Rank Badge -->
              <div 
                :class="[
                  'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2',
                  idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 border-amber-300' :
                  idx === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 border-gray-300' :
                  idx === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600 border-orange-300' :
                  'bg-gradient-to-br from-blue-500 to-indigo-500 border-blue-400 dark:border-blue-300'
                ]"
              >
                <span class="text-sm drop-shadow-sm">
                  {{ idx + 1 }}
                </span>
              </div>

              <!-- User Avatar -->
              <div class="relative">
                <img
                  :src="hero.avatar || '/src/Images/default-avatar.png'"
                  class="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-gray-600 shadow-md"
                />
                <!-- Online indicator -->
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>

              <!-- User Info -->
              <div>
                <p class="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {{ hero.name }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <div class="flex items-center gap-1">
                    <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <p class="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {{ hero.points }} pts
                    </p>
                  </div>
                  <span class="text-gray-400">•</span>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Level {{ Math.floor(hero.points / 100) + 1 }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Right Section: Medal & Actions -->
            <div class="flex items-center gap-3">
              <!-- Medal Badge -->
              <span 
                class="px-4 py-2 rounded-full font-semibold text-sm shadow-md border backdrop-blur-sm"
                :class="[
                  idx === 0 ? 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700' :
                  idx === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700' :
                  'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700'
                ]"
              >
                <span class="flex items-center gap-1">
                  <span class="text-lg">
                    {{ idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉" }}
                  </span>
                  {{ idx === 0 ? "Gold" : idx === 1 ? "Silver" : "Bronze" }}
                </span>
              </span>

              <!-- View Profile Button -->
              <button class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Progress Bar (for top 3) -->
          <div v-if="idx < 3" class="px-4 pb-3">
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress to next level</span>
              <span>{{ hero.points % 100 }}/100</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                :class="[
                  'h-2 rounded-full transition-all duration-1000 ease-out',
                  idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                  idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  'bg-gradient-to-r from-orange-400 to-amber-500'
                ]"
                :style="{ width: `${(hero.points % 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!heroes || heroes.length === 0" class="text-center py-12">
      <div class="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
        🏆
      </div>
      <p class="text-gray-500 dark:text-gray-400 font-medium">No eco heroes yet</p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Users will appear here as they earn points</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ 
  heroes: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
/* Custom animations */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: color, background-color, border-color, transform, box-shadow, opacity;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced shadow on hover */
.shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.group:hover .shadow-lg {
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 15px -8px rgba(0, 0, 0, 0.1);
}

.dark .shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
}

.dark .group:hover .shadow-lg {
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 10px 15px -8px rgba(0, 0, 0, 0.3);
}
</style>
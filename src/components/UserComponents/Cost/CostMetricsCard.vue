<template>
  <div class="w-full mb-8 px-4 md:px-0">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <div 
        v-for="(metric, index) in metrics" 
        :key="index"
        class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div class="flex justify-between items-start mb-2">
          <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {{ metric.title }}
          </p>
          <div class="p-2 rounded-lg" :class="metric.bgClass">
            <component :is="metric.icon" class="w-6 h-6" :class="metric.textClass" />
          </div>
        </div>
        
        <div>
          <h3 class="text-2xl font-extrabold text-gray-900 dark:text-white">
            {{ metric.cost }}
          </h3>
          <p class="text-xs font-medium mt-2 flex items-center gap-1" :class="metric.trendClass">
            <span v-if="metric.trendIcon">{{ metric.trendIcon }}</span>
            {{ metric.definition }}
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { CurrencyDollarIcon, BoltIcon, ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/vue/24/outline';

defineProps({
  metrics: {
    type: Array,
    default: () => []
  }
});
</script>
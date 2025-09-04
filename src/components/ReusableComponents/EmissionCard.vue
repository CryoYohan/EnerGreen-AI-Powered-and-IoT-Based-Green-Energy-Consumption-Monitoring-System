<template>
  <div class="container max-w-full p-4 mx-auto lg:pr-12 lg:pl-12 font-poppins bg-[#F9FAFB] dark:bg-gray-900">
    <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{{ title }}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-md dark:shadow-gray-700">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Emission Sources</h2>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ emissionSources.length }} items</span>
        </div>
        <div class="space-y-6">
          <div v-for="(source, index) in emissionSources" :key="source.id" class="flex items-center gap-4">
            <div class="w-10 text-right bg-gray-200 dark:bg-gray-700 rounded-full p-2 flex items-center justify-center">
              <span class="font-medium text-gray-500 dark:text-gray-400">{{ index + 1 }}</span>
            </div>
            <div class="flex-1 flex items-center gap-4">
              <div class="w-24">
                <span class="font-medium text-gray-900 dark:text-gray-200">{{ source.name }}</span>
              </div>
              <div class="flex-1">
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    class="h-4 rounded-full transition-all duration-300" 
                    :class="getSourceColor(source.name)"
                    :style="{ width: source.percentage + '%' }"
                  ></div>
                </div>
              </div>
              <div class="w-12 text-right">
                <span class="font-medium text-gray-900 dark:text-gray-200">{{ source.percentage }}%</span>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-4">
              <div class="w-8"></div>
              <div class="w-24">
                <span class="font-bold text-gray-900 dark:text-white">Total</span>
              </div>
              <div class="flex-1">
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    class="bg-purple-500 h-4 rounded-full transition-all duration-300" 
                    :style="{ width: totalPercentage + '%' }"
                  ></div>
                </div>
              </div>
              <div class="w-12 text-right">
                <span class="font-bold text-gray-900 dark:text-white">{{ totalPercentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-md dark:shadow-gray-700">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Emission Reduction Tips</h2>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ tips.length }} items</span>
        </div>
        <ul class="space-y-4">
          <li v-for="(tip, index) in tips" :key="tip.id" class="flex gap-3">
            <span class="font-medium text-gray-500 dark:text-gray-400 w-10 bg-gray-200 dark:bg-gray-700 rounded-full p-2 flex items-center justify-center">{{ index + 1 }}</span>
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-200">{{ tip.title }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ tip.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
// Make sure to import the composable to get the dark mode state
import { useDarkMode } from "@/composables/useDarkMode.js";

export default {
  props: {
    title: {
      type: String,
      default: 'Emission Dashboard'
    },
    emissionSources: {
      type: Array,
      required: true
    },
    tips: {
      type: Array,
      required: true
    }
  },
  setup() {
    const { isDarkMode } = useDarkMode();
    return { isDarkMode };
  },
  computed: {
    totalPercentage() {
      if (this.emissionSources.length === 0) return 0;
      const sum = this.emissionSources.reduce((total, source) => total + source.percentage, 0);
      return Math.round(sum / this.emissionSources.length);
    }
  },
  methods: {
    getSourceColor(name) {
      const colors = {
        'Air Conditioning': 'bg-red-500',
        'Lighting': 'bg-yellow-500',
        'Electronics': 'bg-blue-500'
      };
      return colors[name] || 'bg-gray-500';
    }
  }
};
</script>
<template>
  <div 
    id="metrics" 
    class="flex flex-wrap self-center justify-around w-full gap-4 p-5 font-poppins md:gap-8"
  >
    <div 
      v-for="(metric, index) in metrics" 
      :key="index"
      :class="cardSizeClass"
      class="flex flex-col bg-white rounded-lg shadow dark:bg-gray-800 dark:shadow-md dark:shadow-gray-700"
    >
      <div class="flex items-start justify-between mb-4">
        <h3 :class="['text-gray-600', titleSizeClass, { 'dark:text-[#F8F8FF]': isDarkMode }]">{{ metric.title }}</h3>
        <img 
          :class="['dark:invert', iconSizeClass]" 
          :src="metric.icon" 
          :alt="metric.title + ' Icon'"
        >
      </div>
      <div>
        <p :class="['text-gray-800', costSizeClass, { 'dark:text-blue-400': isDarkMode }]">{{ metric.cost }}</p>
        <p :class="['text-gray-500', definitionSizeClass, { 'dark:text-[#F8F8FF]': isDarkMode }]">{{ metric.definition }}</p>
      </div>
    </div>
  </div>
</template>

<script>
// 1. Import the useDarkMode composable.
import { useDarkMode } from "@/composables/useDarkMode.js";

export default {
  name: 'MetricsCard',
  props: {
    metrics: {
      type: Array,
      required: true
    },
    size: {
      type: String,
      default: 'base' // or 'large', 'small'
    }
  },
  setup() {
    // 2. Use the composable to get the reactive state.
    const { isDarkMode } = useDarkMode();

    // 3. Return the state so it can be used in the template and computed properties.
    return { isDarkMode };
  },
  computed: {
    cardSizeClass() {
      return {
        small: 'w-full sm:w-[250px] p-4',
        base: 'w-full sm:w-[300px] p-6',
        large: 'w-full sm:w-[400px] p-8',
        extra: 'w-full sm:w-[550px] p-10',
        special: 'w-full sm:w-[400px] p-10',
      }[this.size];
    },
    titleSizeClass() {
      return {
        small: 'text-sm font-medium',
        base: 'text-base font-medium',
        large: 'text-lg font-semibold',
        extra: 'text-lg font-semibold',
        special: 'text-lg font-semibold'
      }[this.size];
    },
    iconSizeClass() {
      return {
        small: 'w-4 h-4',
        base: 'w-5 h-5',
        large: 'w-6 h-6',
        extra: 'w-7 h-7',
        special: 'w-6 h-6',
      }[this.size];
    },
    costSizeClass() {
      return {
        small: 'text-xl font-bold',
        base: 'text-2xl font-bold',
        large: 'text-3xl font-extrabold',
        extra: 'text-3xl font-extrabold',
        special: 'text-3xl font-extrabold'
      }[this.size];
    },
    definitionSizeClass() {
      return {
        small: 'text-xs',
        base: 'text-sm',
        large: 'text-base',
        extra: 'text-base text-[#059669] mt-2',
        special: 'text-base text-[#059669] mt-2',
      }[this.size];
    }
  }
}
</script>
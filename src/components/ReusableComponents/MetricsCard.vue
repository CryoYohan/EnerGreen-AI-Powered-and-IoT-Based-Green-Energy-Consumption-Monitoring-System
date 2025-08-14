<template>
  <div 
    id="metrics" 
    class="flex flex-wrap self-center justify-around w-full gap-4 p-5 font-poppins md:gap-8"
  >
    <div 
      v-for="(metric, index) in metrics" 
      :key="index"
      :class="cardSizeClass"
      class="flex flex-col bg-white rounded-lg shadow"
    >
      <div class="flex items-start justify-between mb-4">
        <h3 :class="titleSizeClass">{{ metric.title }}</h3>
        <img :class="iconSizeClass" :src="metric.icon" :alt="metric.title + ' Icon'">
      </div>
      <div>
        <p :class="costSizeClass">{{ metric.cost }}</p>
        <p :class="definitionSizeClass">{{ metric.definition }}</p>
      </div>
    </div>
  </div>
</template>

<script>
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
        small: 'text-sm font-medium text-gray-600',
        base: 'text-base font-medium text-gray-600',
        large: 'text-lg font-semibold text-gray-600',
        extra: 'text-lg font-semibold text-gray-600',
        special: 'text-lg font-semibold text-gray-600'
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
        small: 'text-xl font-bold text-gray-800',
        base: 'text-2xl font-bold text-gray-800',
        large: 'text-3xl font-extrabold text-gray-800',
        extra: 'text-3xl font-extrabold text-gray-800',
        special: 'text-3xl font-extrabold text-gray-800'
      }[this.size];
    },
    definitionSizeClass() {
      return {
        small: 'text-xs text-gray-500',
        base: 'text-sm text-gray-500',
        large: 'text-base text-gray-500',
        extra: 'text-base text-[#059669] mt-2',
        special: 'text-base text-[#059669] mt-2',
      }[this.size];
    }
  }
}
</script>

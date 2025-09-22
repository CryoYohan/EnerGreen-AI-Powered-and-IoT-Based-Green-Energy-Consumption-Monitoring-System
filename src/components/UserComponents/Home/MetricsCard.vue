<template>
  <div 
    id="metrics" 
    class="flex w-[100%] self-center flex-wrap justify-around gap-4 p-5 font-poppins md:gap-8"
  >
    <div 
      v-for="(metric, index) in metrics" 
      :key="index"
      class="flex flex-col w-full sm:w-[300px] p-6 bg-white shadow rounded-lg"
    >
      <div class="flex items-start justify-between mb-4">
        <h3 class="font-medium text-gray-600">{{ metric.title }}</h3>
        <img class="w-5 h-5" :src="metric.icon" :alt="metric.title + ' Icon'">
      </div>
      <div>
        <p class="text-2xl font-bold text-gray-800">{{ metric.cost }}</p>
        <p class="text-sm text-gray-500">{{ metric.definition }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MetricsCard",
  props: {
    metrics: {
      type: Array,
      required: true
    }
  }
}
</script>

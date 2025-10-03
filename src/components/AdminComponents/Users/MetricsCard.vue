<template>
  <div
    :class="[
      'bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6',
      size === 'large' ? 'w-full' : 'w-1/2'
    ]"
  >
    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
      Key Metrics
    </h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="(value, key) in metrics" :key="key" class="text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">{{ key }}</p>
        <p class="text-xl font-bold text-gray-900 dark:text-gray-100">
          {{ value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  metrics: { type: Object, default: () => ({}) },
  size: { type: String, default: 'small' }
});
</script>

<template>
  <div class="px-4 py-6 sm:px-6 lg:px-14">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-300 sm:text-3xl">
      {{ title }}
    </h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-300 sm:mt-2 sm:text-base">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String
})
</script>
h
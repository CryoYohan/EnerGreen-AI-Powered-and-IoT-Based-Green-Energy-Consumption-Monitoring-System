<template>
  <div class="px-4 py-6 sm:px-6 lg:px-14">
    <h1 class="text-2xl font-bold sm:text-3xl">
      <span class="bg-gradient-to-r from-green-600 via-blue-500 to-blue-600 
                   bg-clip-text text-transparent 
                   [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]
                   dark:from-green-400 dark:via-blue-300 dark:to-blue-400">
        {{ title }}
      </span>
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

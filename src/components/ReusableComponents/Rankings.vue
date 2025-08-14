<template>
  <div class="p-6 bg-white rounded-xl shadow">
    <h2 class="text-lg font-semibold text-gray-800 mb-1">🏅 {{ title }}</h2>
    <p class="text-sm text-gray-500 mb-4">{{ subtitle }}</p>
    <div class="space-y-3 text-sm">
      <div
        v-for="(hero, index) in heroes"
        :key="index"
        class="flex items-center justify-between p-3 rounded-lg"
        :class="bgColors[index] || 'bg-gray-100'"
      >
        <div class="flex items-center space-x-3">
          <img :src="hero.img" class="rounded-full" />
          <span class="text-gray-800 font-medium">{{ hero.name }}</span>
        </div>
        <span class="font-semibold text-gray-700">{{ hero.co2 }} CO₂ saved</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Rankings",
  props: {
    title: String,
    subtitle: String,
    heroes: Array,
  },
  computed: {
    bgColors() {
      return ['bg-yellow-100', 'bg-gray-100', 'bg-red-100'];
    },
  },
};
</script>

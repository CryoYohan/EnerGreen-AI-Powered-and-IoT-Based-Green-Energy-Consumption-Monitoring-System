<template>
  <div class="container max-w-full p-10 mx-auto font-poppins">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Device Cards -->
      <div
        v-for="(device) in devices"
        :key="device.id"
        @click="$emit('view-details', device)"
        class="relative p-6 bg-white rounded-lg shadow cursor-pointer"
      >
        <!-- Delete Icon (top-right corner) -->
        <button
          @click.stop="$emit('remove-device', device)"
          class="absolute p-1 transition-colors rounded-full top-4 right-4 hover:bg-gray-100"
        >
          <img src="/src/images/icons/delete.svg" alt="Delete" class="w-5 h-5" />
        </button>

        <div class="space-y-2">
          <img :src="device.icon" :alt="device.name" class="w-12 h-12" />
          <h3 class="text-lg font-bold text-gray-800">{{ device.name }}</h3>
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm text-gray-600">{{ device.location }}</p>
            <div class="mt-2">
              <span
                class="inline-block px-2 py-1 text-xs rounded-full"
                :class="
                  device.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                "
              >
                {{ device.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mt-2 mb-4">
          <span class="text-sm text-gray-600">Today's Usage:</span>
          <span class="text-sm font-semibold">{{ device.usage }} kWh</span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="h-2.5 rounded-full"
            :class="device.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'"
            :style="{ width: calculateProgress(device.usage, device.maxUsage) + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  devices: {
    type: Array,
    required: true,
  },
});

const emits = defineEmits(['remove-device', 'view-details']);

const calculateProgress = (usage, maxUsage) => {
  const progress = (usage / maxUsage) * 100;
  return Math.min(progress, 100);
};
</script>

<style scoped>
@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }
}
</style>

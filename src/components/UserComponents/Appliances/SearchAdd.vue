<template>
  <div
    v-if="showModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
  >
    <div class="bg-white w-full max-w-3xl rounded-xl p-6 relative shadow-lg">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 class="text-lg font-semibold mb-4">Appliance Signatures</h2>

      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-600">Loading AI predictions...</p>
      </div>

      <div v-for="signature in signatures" :key="signature.id">
        <p class="text-xs text-gray-500 mb-2">
          AI Suggestion: {{ signature.ai_prediction || 'Pending...' }}
          <span v-if="signature.confidence !== null">
            ({{ Math.round(signature.confidence * 100) }}%)
          </span>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { toRefs } from "vue";

defineProps({
  showModal: Boolean,
  signatures: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
});
</script>


<style scoped>
/* Spinner is handled via Tailwind animate-spin, no sonar-wave needed in child */
</style>

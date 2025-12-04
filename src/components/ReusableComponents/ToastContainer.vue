<template>
  <div class="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
    <transition-group
      name="toast-transition"
      tag="div"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="w-full max-w-sm p-4 rounded-lg shadow-lg text-white"
        :class="{
          'bg-blue-500': toast.type === 'info',
          'bg-green-500': toast.type === 'success',
          'bg-red-500': toast.type === 'error'
        }"
      >
        <p>{{ toast.message }}</p>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast.js';

const { toasts } = useToast();
</script>

<style scoped>
.toast-transition-enter-active,
.toast-transition-leave-active {
  transition: all 0.5s ease;
}
.toast-transition-enter-from,
.toast-transition-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

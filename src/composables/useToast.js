// src/composables/useToast.js
import { ref, readonly } from 'vue';

// A reactive array to hold our toast notifications
const toasts = ref([]);

// This function will be exported and used by any component that wants to show a toast
const showToast = (message, type = 'info', duration = 4000) => {
  const id = Date.now() + Math.random();
  
  // Add the new toast to our list
  toasts.value.push({
    id,
    message,
    type, // 'info', 'success', 'error'
  });

  // Automatically remove it after the duration
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, duration);
};

// The composable function
export function useToast() {
  return {
    // We make the `toasts` array readonly for components that just need to display them,
    // to prevent them from modifying the list directly.
    toasts: readonly(toasts),
    showToast,
  };
}

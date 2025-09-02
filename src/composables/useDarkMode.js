// src/composables/useDarkMode.js
import { ref, onMounted, watch } from "vue";

export function useDarkMode() {
  const isDarkMode = ref(false);

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  // Watch for changes to `isDarkMode` and save the preference
  watch(isDarkMode, (newValue) => {
    localStorage.setItem('isDarkMode', newValue);
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });

  // On component mount, load the saved preference
  onMounted(() => {
    const savedMode = localStorage.getItem('isDarkMode');
    if (savedMode !== null) {
      isDarkMode.value = savedMode === 'true';
    } else {
      isDarkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    // Apply the initial theme
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });

  return { isDarkMode, toggleDarkMode };
}
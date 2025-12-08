import { ref, computed, watch, onUnmounted } from 'vue';

/**
 * Composable to track if the system data is "stale" (not updated recently).
 * @param {import('vue').Ref<Date|null>} lastUpdateTimestampRef - A reactive reference to the last data timestamp.
 * @param {number} thresholdMinutes - How many minutes before considering data stale (default 5).
 */
export function useSystemHealth(lastUpdateTimestampRef, thresholdMinutes = 5) {
  const now = ref(Date.now());
  let timer = null;

  // update 'now' every minute to trigger reactivity
  timer = setInterval(() => {
    now.value = Date.now();
  }, 60000);

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  const timeSinceLastUpdateMs = computed(() => {
    if (!lastUpdateTimestampRef.value) return null;
    const lastTime = new Date(lastUpdateTimestampRef.value).getTime();
    return now.value - lastTime;
  });

  const isStale = computed(() => {
    if (timeSinceLastUpdateMs.value === null) return false; // No data yet isn't "stale"
    return timeSinceLastUpdateMs.value > (thresholdMinutes * 60 * 1000);
  });

  const minutesSince = computed(() => {
    if (!timeSinceLastUpdateMs.value) return 0;
    return Math.floor(timeSinceLastUpdateMs.value / 60000);
  });

  return {
    isStale,
    minutesSince
  };
}

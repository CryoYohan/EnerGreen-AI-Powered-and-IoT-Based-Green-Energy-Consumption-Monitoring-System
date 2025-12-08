import { ref } from 'vue';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSystemHealth } from '@/composables/useSystemHealth';

describe('useSystemHealth', () => {
  let lastUpdateTimestamp;

  beforeEach(() => {
    // Use fake timers to control setInterval and Date.now()
    vi.useFakeTimers();
    lastUpdateTimestamp = ref(null); // Initialize before each test
  });

  afterEach(() => {
    vi.runOnlyPendingTimers(); // Ensure any pending timers are run
    vi.restoreAllMocks();     // Restore original timers and mocks
  });

  it('should initialize with not stale and 0 minutes since if no timestamp', () => {
    const { isStale, minutesSince } = useSystemHealth(lastUpdateTimestamp);
    expect(isStale.value).toBe(false);
    expect(minutesSince.value).toBe(0);
  });

  it('should not be stale if update is within threshold', () => {
    lastUpdateTimestamp.value = new Date(Date.now() - 3 * 60 * 1000); // 3 minutes ago
    const { isStale, minutesSince } = useSystemHealth(lastUpdateTimestamp);

    // Advance timers by 1 minute (as per setInterval in composable)
    vi.advanceTimersByTime(60 * 1000); 

    expect(isStale.value).toBe(false);
    expect(minutesSince.value).toBe(4); // Should be 4 minutes now (initial 3 + 1 min advanced)
  });

  it('should become stale if update exceeds threshold', () => {
    const threshold = 5; // Default threshold is 5 minutes
    lastUpdateTimestamp.value = new Date(Date.now() - (threshold + 1) * 60 * 1000); // 6 minutes ago
    const { isStale, minutesSince } = useSystemHealth(lastUpdateTimestamp, threshold);

    // Advance timers to trigger `now` update and re-evaluate computed properties
    vi.advanceTimersByTime(60 * 1000); 

    expect(isStale.value).toBe(true);
    expect(minutesSince.value).toBe(threshold + 2); // Should be 7 minutes (initial 6 + 1 min advanced)
  });

  it('should update minutesSince as time progresses', () => {
    lastUpdateTimestamp.value = new Date(Date.now() - 1 * 60 * 1000); // 1 minute ago
    const { minutesSince } = useSystemHealth(lastUpdateTimestamp);

    expect(minutesSince.value).toBe(1);

    vi.advanceTimersByTime(60 * 1000); // Advance 1 minute
    expect(minutesSince.value).toBe(2);

    vi.advanceTimersByTime(60 * 1000); // Advance another 1 minute
    expect(minutesSince.value).toBe(3);
  });

  // Removed direct testing of onUnmounted's `effect.stop()` due to it not being a public API
  // and requiring a component wrapper for proper lifecycle testing.
  // We trust that `onUnmounted` will correctly call `clearInterval` when the composable is used
  // within a Vue component and that component unmounts.
});

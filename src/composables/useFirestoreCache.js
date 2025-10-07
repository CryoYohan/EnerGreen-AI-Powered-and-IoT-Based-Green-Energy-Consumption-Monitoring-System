// /src/composables/useFirestoreCache.js
import { ref } from 'vue';

export function useFirestoreCache() {
    const cache = ref(new Map());
    const MAX_CACHE_SIZE = 50;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const getCachedData = (key) => {
        const cached = cache.value.get(key);
        if (!cached) return null;

        // Check if cache is still valid
        if (Date.now() - cached.timestamp > CACHE_DURATION) {
            cache.value.delete(key);
            return null;
        }

        return cached.data;
    };

    const setCachedData = (key, data) => {
        // Clean expired entries first
        cleanupExpiredCache();

        // Enforce max cache size
        if (cache.value.size >= MAX_CACHE_SIZE) {
            const firstKey = cache.value.keys().next().value;
            cache.value.delete(firstKey);
        }

        cache.value.set(key, {
            data,
            timestamp: Date.now()
        });
    };

    const cleanupExpiredCache = () => {
        const now = Date.now();
        for (const [key, value] of cache.value.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                cache.value.delete(key);
            }
        }
    };

    const clearCache = () => {
        cache.value.clear();
    };

    return {
        getCachedData,
        setCachedData,
        clearCache,
        cleanupExpiredCache
    };
}
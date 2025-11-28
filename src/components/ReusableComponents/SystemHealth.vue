<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700">
    
    <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      {{ title }}
    </h2>
    <p class="text-sm text-gray-500 dark:text-gray-300 mb-4">{{ subtitle }}</p>

    <div class="mb-6 p-4 rounded-lg text-center" :class="overallStatusClass.bg">
      <p class="text-3xl font-bold" :class="overallStatusClass.text">{{ overallStatusText }}</p>
      <p class="text-xs mt-1" :class="overallStatusClass.subtext">{{ healthyCount }} / {{ totalSystems }} Components Nominal</p>
    </div>

    <div class="space-y-3 text-sm">
      <div
        v-for="(system, index) in systems"
        :key="index"
        class="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 transition-colors duration-200"
        :class="getSystemStatusClasses(system.status).cardBg"
      >
        <div class="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" :class="getSystemStatusClasses(system.status).iconColor" viewBox="0 0 20 20" fill="currentColor">
            <path v-if="system.status === 'Operational'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            <path v-else-if="system.status === 'Degraded'" fill-rule="evenodd" d="M8.257 3.099c.765-1.3 2.653-1.3 3.417 0l2.66 4.549a1.5 1.5 0 01-.832 2.263l-2.66 1.33a1.5 1.5 0 01-1.341 0l-2.66-1.33a1.5 1.5 0 01-.832-2.263l2.66-4.549zM10 15a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            <path v-else-if="system.status === 'Offline'" fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
          </svg>
          <span class="text-gray-800 dark:text-gray-100 font-medium">{{ system.name }}</span>
        </div>
        
        <span class="font-bold text-xs px-2 py-1 rounded-full" :class="getSystemStatusClasses(system.status).badgeBg">
          {{ system.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SystemHealthStatus",
  props: {
    title: { type: String, default: "System Health Overview" },
    subtitle: { type: String, default: "Real-time status of critical infrastructure components." },
    systems: {
      type: Array, // Changed from 'heroes' to 'systems'
      default: () => [
        // Example fallback data
        { name: "API Service", status: "Operational" },
        { name: "Database Cluster", status: "Degraded" },
        { name: "Storage Service", status: "Offline" },
      ]
    },
  },
  methods: {
    getSystemStatusClasses(status) {
      switch (status) {
        case 'Operational':
          return {
            cardBg: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30',
            badgeBg: 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200',
            iconColor: 'text-green-600 dark:text-green-400'
          };
        case 'Degraded':
          return {
            cardBg: 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
            badgeBg: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
            iconColor: 'text-yellow-600 dark:text-yellow-400'
          };
        case 'Offline':
          return {
            cardBg: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30',
            badgeBg: 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200',
            iconColor: 'text-red-600 dark:text-red-400'
          };
        default:
          return {
            cardBg: 'bg-gray-50 dark:bg-gray-700/50',
            badgeBg: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300',
            iconColor: 'text-gray-500 dark:text-gray-400'
          };
      }
    }
  },
  computed: {
    totalSystems() {
      return this.systems.length;
    },
    healthyCount() {
      return this.systems.filter(s => s.status === 'Operational').length;
    },
    isDegraded() {
      return this.systems.some(s => s.status === 'Degraded');
    },
    isOffline() {
      return this.systems.some(s => s.status === 'Offline');
    },
    overallStatusText() {
      if (this.isOffline) return "Major Outage";
      if (this.isDegraded) return "Performance Degraded";
      if (this.totalSystems === 0) return "No Data";
      return "All Systems Operational";
    },
    overallStatusClass() {
      if (this.isOffline) return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', subtext: 'text-red-600 dark:text-red-300' };
      if (this.isDegraded) return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', subtext: 'text-yellow-600 dark:text-yellow-300' };
      return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', subtext: 'text-green-600 dark:text-green-300' };
    }
  }
};
</script>
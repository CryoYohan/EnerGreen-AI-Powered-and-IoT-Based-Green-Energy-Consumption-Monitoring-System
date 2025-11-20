<template>
  <div class="grid m-4 sm:m-5 lg:m-10 grid-cols-1 md:grid-cols-2 gap-6 font-poppins dark:bg-gray-900">
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
      <div class="flex items-center gap-2 mb-4">
        <img src="/src/Images/icons/health.svg" alt="System Health" class="w-6 h-6">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">System Health</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-left border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="pb-2 font-medium text-gray-600 dark:text-gray-300">Metric</th>
              <th class="pb-2 font-medium text-gray-600 dark:text-gray-300">Current Value</th>
              <th class="pb-2 font-medium text-gray-600 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            
            <tr>
              <td class="py-3 text-gray-900 dark:text-gray-100">Fleet Availability</td>
              <td class="py-3 text-gray-900 dark:text-gray-100">{{ stats.uptime }}%</td>
              <td class="py-3">
                <span v-if="Number(stats.uptime) > 90" class="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                  Optimal
                </span>
                <span v-else class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  Degraded
                </span>
              </td>
            </tr>

            <tr>
              <td class="py-3 text-gray-900 dark:text-gray-100">Active IoT Devices</td>
              <td class="py-3 text-gray-900 dark:text-gray-100">{{ stats.active }} / {{ stats.total }}</td>
              <td class="py-3">
                <span v-if="stats.active === stats.total && stats.total > 0" class="text-green-600 dark:text-green-400">All Online</span>
                <span v-else-if="stats.total === 0" class="text-gray-500">No Devices</span>
                <span v-else class="text-amber-600 dark:text-amber-400">{{ stats.total - stats.active }} Offline</span>
              </td>
            </tr>

            <tr>
              <td class="py-3 text-gray-900 dark:text-gray-100">Energy Monitored</td>
              <td class="py-3 text-gray-900 dark:text-gray-100">{{ totalKwh.toFixed(2) }} kWh</td>
              <td class="py-3"><span class="text-green-600 dark:text-green-400">Live</span></td>
            </tr>

            <tr>
              <td class="py-3 text-gray-900 dark:text-gray-100">Firestore Latency</td>
              <td class="py-3 text-gray-900 dark:text-gray-100">{{ stats.latency }} ms</td>
              <td class="py-3">
                <span v-if="stats.latency < 200" class="inline-flex items-center gap-1 text-green-600 dark:text-green-400">Fast</span>
                <span v-else-if="stats.latency < 800" class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">Moderate</span>
                <span v-else class="inline-flex items-center gap-1 text-red-600 dark:text-red-400">Slow</span>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
      <div class="flex items-center gap-2 mb-6">
        <img src="/src/Images/icons/leaf.svg" alt="Environmental Impact" class="w-6 h-6">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Environmental Impact</h3>
      </div>
      
      <div class="flex flex-col items-center justify-center mb-6">
        <div class="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
          {{ (totalKwh * 0.7122).toFixed(1) }}
        </div>
        <div class="text-gray-600 dark:text-gray-300 text-center">
          kg CO₂ Emissions Tracked
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <img src="/src/Images/icons/tree.svg" alt="Trees" class="w-5 h-5">
            <span class="font-medium dark:text-gray-100 text-sm">Trees Equivalent</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ ((totalKwh * 0.7122) / 1.6).toFixed(1) }}
          </div>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <img src="/src/Images/icons/car.svg" alt="Car" class="w-5 h-5">
            <span class="font-medium dark:text-gray-100 text-sm">Km Driven</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ ((totalKwh * 0.7122) / 0.2).toFixed(0) }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
defineProps({
  totalKwh: { type: Number, default: 0 },
  stats: { 
    type: Object, 
    default: () => ({ 
      total: 0, 
      active: 0, 
      offline: 0, 
      uptime: 100, 
      latency: 0 
    }) 
  }
});
</script>
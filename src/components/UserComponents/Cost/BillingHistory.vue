<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full">
    <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
      <div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Billing History</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">Monthly summary of your energy costs</p>
      </div>
    </div>
    
    <div class="overflow-x-auto flex-grow">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
          <tr>
            <th class="px-6 py-3 font-semibold">Month</th>
            <th class="px-6 py-3 font-semibold">Consumption</th>
            <th class="px-6 py-3 font-semibold">Total Bill</th>
            <th class="px-6 py-3 font-semibold text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr v-for="(record, index) in history" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ record.month }}</td>
            <td class="px-6 py-4 text-gray-600 dark:text-gray-300">{{ record.kwh }} kWh</td>
            <td class="px-6 py-4 font-bold text-gray-900 dark:text-white">₱{{ record.cost }}</td>
            <td class="px-6 py-4 text-right">
              <span 
                class="px-2 py-1 rounded-full text-xs font-semibold"
                :class="record.cost > budget ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'"
              >
                {{ record.cost > budget ? 'High' : 'Good' }}
              </span>
            </td>
          </tr>
          <tr v-if="history.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-gray-500">No history available yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  history: Array,
  budget: Number
});
</script>
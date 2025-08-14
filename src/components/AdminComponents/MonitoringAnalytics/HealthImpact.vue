<template>
  <div class="grid m-4 sm:m-5 lg:m-10 grid-cols-1 md:grid-cols-2 gap-6 font-poppins">
    <!-- System Health Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center gap-2 mb-4">
        <img src="/src/Images/icons/health.svg" alt="System Health" class="w-6 h-6">
        <h3 class="text-lg font-semibold text-gray-800">System Health</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-left border-b border-gray-200">
            <tr>
              <th class="pb-2 font-medium text-gray-600">Metric</th>
              <th class="pb-2 font-medium text-gray-600">Current Value</th>
              <th class="pb-2 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr>
              <td class="py-3">System Uptime</td>
              <td class="py-3">99.98%</td>
              <td class="py-3">
                <span class="inline-flex items-center gap-1 text-green-600">
                  Optimal
                </span>
              </td>
            </tr>
            <tr>
              <td class="py-3">Active IoT Devices</td>
              <td class="py-3">1,247</td>
              <td class="py-3">
                <span class="inline-flex items-center gap-1 text-yellow-600">
                  Warning (10 offline)
                </span>
              </td>
            </tr>
            <tr>
              <td class="py-3">Energy Consumption</td>
              <td class="py-3">4.2 MW</td>
              <td class="py-3">
                <span class="inline-flex items-center gap-1 text-green-600">
                  Optimal
                </span>
              </td>
            </tr>
            <tr>
              <td class="py-3">Network Latency (Avg.)</td>
              <td class="py-3">28 ms</td>
              <td class="py-3">
                <span class="inline-flex items-center gap-1 text-green-600">
                  Optimal
                </span>
              </td>
            </tr>
            <tr>
              <td class="py-3">CPU Utilization</td>
              <td class="py-3">67%</td>
              <td class="py-3">
                <span class="inline-flex items-center gap-1 text-yellow-600">
                  Warning
                </span>
              </td>
            </tr>
            <tr>
              <td class="py-3">Memory Usage</td>
              <td class="py-3">54%</td>
              <td class="py-3">
                <span class="inline-flex items-center gap-1 text-green-600">
                  Optimal
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Environmental Impact Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center gap-2 mb-6">
        <img src="/src/Images/icons/leaf.svg" alt="Environmental Impact" class="w-6 h-6">
        <h3 class="text-lg font-semibold text-gray-800">Environmental Impact</h3>
      </div>
      
      <div class="flex flex-col items-center justify-center mb-6">
        <div class="text-5xl font-bold text-green-600 mb-2">58.3</div>
        <div class="text-gray-600">kg CO₂ avoided this month</div>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <img src="/src/Images/icons/tree.svg" alt="Trees" class="w-5 h-5">
            <span class="font-medium">Trees Equivalent</span>
          </div>
          <div class="text-2xl font-bold">2.6</div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <img src="/src/Images/icons/car.svg" alt="Miles" class="w-5 h-5">
            <span class="font-medium">Miles Not Driven</span>
          </div>
          <div class="text-2xl font-bold">147</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component logic if needed
</script>
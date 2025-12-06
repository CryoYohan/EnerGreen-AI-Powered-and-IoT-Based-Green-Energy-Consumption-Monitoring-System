<template>
  <div
    class="min-h-screen dark:bg-gray-900 min-w-screen  flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <AdminHeader />
    <Heading title="Hardware Management" subtitle="Monitor EnerGreen Hardware Performance performance"/>
    
    <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="(metric, index) in dynamicMetrics" 
          :key="index"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ metric.title }}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ metric.cost }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ metric.definition }}</p>
            </div>
            <div 
              class="p-3 rounded-full"
              :class="{
                'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400': metric.title === 'Total devices',
                'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': metric.title === 'Active',
                'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400': metric.title === 'Offline',
                'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400': metric.title === 'Maintenance'
              }"
            >
              <svg 
                v-if="metric.title === 'Total devices'" 
                class="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <svg 
                v-else-if="metric.title === 'Active'" 
                class="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <svg 
                v-else-if="metric.title === 'Offline'" 
                class="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <svg 
                v-else-if="metric.title === 'Maintenance'" 
                class="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              
            </div>
          </div>
        </div>
      </div>
    </div>
    <InventoryDevice :devices="devices" />
    
    <Devices :devices="devices" :users="users" />
    
    <Firmware />
    <Footer />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useHardware } from '@/composables/useHardware.js';

// Components
import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import InventoryDevice from "@/components/AdminComponents/Hardware/InventoryDevice.vue";
import Devices from "@/components/AdminComponents/Hardware/Devices.vue";
import Firmware from "@/components/AdminComponents/Hardware/Firmware.vue";

const {
  devices,
  users,
  dynamicMetrics,
  initHardwareListeners,
  cleanupHardwareListeners
} = useHardware();

onMounted(() => {
  initHardwareListeners();
});

onUnmounted(() => {
  cleanupHardwareListeners();
});
</script>

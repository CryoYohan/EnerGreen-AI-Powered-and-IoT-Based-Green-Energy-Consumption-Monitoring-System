<template>
  <div class="m-4 sm:m-5 lg:m-10 font-poppins dark:bg-gray-900">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div class="relative w-full md:w-full">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search Devices (by ID, User, or Type)"
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
        >
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <select v-model="selectedType" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <option value="">All Types</option>
          <option v-for="type in uniqueTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        
        <select v-model="selectedStatus" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <option value="">All Status</option>
          <option v-for="status in uniqueStatuses" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th v-for="header in headers" :key="header.key" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ header.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="device in filteredDevices" :key="device.deviceId">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ device.deviceId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ device.userId || 'Unassigned' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ device.type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="statusClasses(device.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ device.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ device.firmware }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ formatLastSync(device.lastSync) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDarkMode } from '@/composables/useDarkMode.js';

// Accept the devices list from the parent
const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  }
});

const { isDarkMode } = useDarkMode();

// --- Filters and Search ---
const searchTerm = ref("");
const selectedType = ref("");
const selectedStatus = ref("");

// --- Table Headers ---
const headers = [
  { key: "deviceId", label: "Device ID" },
  { key: "userId", label: "Assigned User" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "firmware", label: "Firmware" },
  { key: "lastSync", label: "Last Sync" },
];

// --- Status Styling ---
const statusClasses = (status) => {
  const isDark = isDarkMode.value;
  // Fallback for null/undefined status
  const safeStatus = status || 'Inactive'; 
  
  return {
    'bg-green-700 text-green-100': safeStatus === 'Active' && isDark,
    'bg-red-700 text-red-100': safeStatus === 'Offline' && isDark,
    'bg-yellow-700 text-yellow-10Signature': safeStatus === 'Maintenance' && isDark,
    'bg-gray-700 text-gray-100': safeStatus === 'Inactive' && isDark,
    'bg-green-100 text-green-800': safeStatus === 'Active' && !isDark,
    'bg-red-100 text-red-800': safeStatus === 'Offline' && !isDark,
    'bg-yellow-100 text-yellow-800': safeStatus === 'Maintenance' && !isDark,
    'bg-gray-100 text-gray-800': safeStatus === 'Inactive' && !isDark,
  };
};

// --- Computed Properties for Filtering (THE FIX IS HERE) ---
const uniqueTypes = computed(() => {
  // Add '|| "Unknown"' to handle null or missing types
  return [...new Set(props.devices.map(device => device.type || "Unknown"))];
});

const uniqueStatuses = computed(() => {
  // Add '|| "Unknown"' to handle null or missing statuses
  return [...new Set(props.devices.map(device => device.status || "Unknown"))];
});

const filteredDevices = computed(() => {
  return props.devices.filter((device) => {
    const search = searchTerm.value.toLowerCase();
    
    // Use optional chaining (?.) and nullish coalescing (??)
    // to prevent errors on null/undefined properties.
    const matchesSearch =
      (device.deviceId?.toLowerCase().includes(search) ?? false) ||
      (device.userId?.toLowerCase().includes(search) ?? false) ||
      (device.type?.toLowerCase().includes(search) ?? false);

    const matchesType = selectedType.value === "" || device.type === selectedType.value;
    const matchesStatus = selectedStatus.value === "" || device.status === selectedStatus.value;

    return matchesSearch && matchesType && matchesStatus;
  });
});

// --- Helper Function ---
const formatLastSync = (timestamp) => {
  if (!timestamp) return 'N/A';
  // Check if timestamp is a Firebase Timestamp object
  if (timestamp && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  // Fallback for other date/string formats
  try {
    return new Date(timestamp).toLocaleString();
  } catch (e) {
    return 'Invalid Date';
  }
};
</script>
<template>
  <div class="m-4 sm:m-5 lg:m-10 font-poppins dark:bg-gray-900">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div class="relative w-full md:w-full">
        <input v-model="searchTerm" type="text" placeholder="Search Devices..." class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <select v-model="selectedType" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <option value="">All Types</option>
          <option v-for="type in uniqueTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <select v-model="selectedStatus" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <option value="">All Status</option>
          <option v-for="status in uniqueStatuses" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th v-for="header in headers" :key="header.key" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ header.label }}</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="device in filteredDevices" :key="device.deviceId">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ device.deviceId }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                 {{ getUserName(device.userId) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ device.type }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="statusClasses(device.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">{{ device.status }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ device.firmware }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ formatLastSync(device.lastSync) }}</td>
              
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openEditModal(device)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">Edit</button>
                
                <button 
                  @click="toggleDeviceStatus(device)" 
                  :class="device.status === 'Inactive' 
                    ? 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300' 
                    : 'text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300'"
                >
                  {{ device.status === 'Inactive' ? 'Activate' : 'Deactivate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Device: {{ editingDevice.deviceId }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Assigned User</label>
            <select v-model="editForm.userId" class="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm p-2 border">
              <option value="">Unassigned</option>
              <option v-for="user in users" :key="user.uid" :value="user.uid">
                {{ user.fullName }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select v-model="editForm.status" class="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm p-2 border">
              <option>Active</option>
              <option>Inactive</option>
              <option>Maintenance</option>
              <option>Offline</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <input v-model="editForm.location" type="text" class="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm p-2 border">
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button @click="closeEditModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</button>
          <button @click="saveDeviceChanges" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">Save Changes</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { db } from '@/firebase.js';
import { doc, updateDoc } from 'firebase/firestore';
import { useDarkMode } from '@/composables/useDarkMode.js';
import Swal from 'sweetalert2';

const props = defineProps({
  devices: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] } 
});

const { isDarkMode } = useDarkMode();
const searchTerm = ref("");
const selectedType = ref("");
const selectedStatus = ref("");

const headers = [
  { key: "deviceId", label: "Device ID" },
  { key: "userId", label: "Assigned User" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "firmware", label: "Firmware" },
  { key: "lastSync", label: "Last Sync" },
];

// --- FILTERING ---
const uniqueTypes = computed(() => [...new Set(props.devices.map(d => d.type || "Unknown"))]);
const uniqueStatuses = computed(() => [...new Set(props.devices.map(d => d.status || "Unknown"))]);

const filteredDevices = computed(() => {
  return props.devices.filter((device) => {
    const search = searchTerm.value.toLowerCase();
    const userIdMatch = getUserName(device.userId).toLowerCase().includes(search);
    
    const matchesSearch =
      (device.deviceId?.toLowerCase().includes(search) ?? false) ||
      (device.userId?.toLowerCase().includes(search) ?? false) ||
      (device.type?.toLowerCase().includes(search) ?? false) ||
      userIdMatch;

    const matchesType = selectedType.value === "" || device.type === selectedType.value;
    const matchesStatus = selectedStatus.value === "" || device.status === selectedStatus.value;

    return matchesSearch && matchesType && matchesStatus;
  });
});

// --- HELPERS ---
const getUserName = (uid) => {
  if (!uid) return 'Unassigned';
  const user = props.users.find(u => u.uid === uid);
  return user ? user.fullName : uid; 
};

// --- EDIT LOGIC ---
const showEditModal = ref(false);
const editingDevice = ref({});
const editForm = reactive({ userId: '', status: '', location: '' });

const openEditModal = (device) => {
  editingDevice.value = device;
  editForm.userId = device.userId || '';
  editForm.status = device.status || 'Inactive';
  editForm.location = device.location || '';
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingDevice.value = {};
};

const saveDeviceChanges = async () => {
  if (!editingDevice.value.deviceId) return;
  try {
    const deviceRef = doc(db, 'devices', editingDevice.value.deviceId);
    const selectedUser = props.users.find(u => u.uid === editForm.userId);
    const userName = selectedUser ? selectedUser.fullName : 'Unassigned';
    await updateDoc(deviceRef, {
      userId: editForm.userId || null,
      ownerName:userName,
      status: editForm.status,
      location: editForm.location
    });
    closeEditModal();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Device updated', showConfirmButton: false, timer: 3000 });
  } catch (error) {
    Swal.fire('Error', error.message, 'error');
  }
};

// --- TOGGLE STATUS LOGIC (Activate / Deactivate) ---
const toggleDeviceStatus = async (device) => {
  // Determine current state
  const isInactive = device.status === 'Inactive';
  
  // Define new state and UI text based on current status
  const newStatus = isInactive ? 'Active' : 'Inactive';
  const actionVerb = isInactive ? 'Activate' : 'Deactivate';
  const confirmColor = isInactive ? '#10B981' : '#F59E0B'; // Green or Amber
  
  const result = await Swal.fire({
    title: `${actionVerb} Device?`,
    text: `Are you sure you want to ${actionVerb.toLowerCase()} ${device.deviceId}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: confirmColor,
    cancelButtonColor: '#6B7280',
    confirmButtonText: `Yes, ${actionVerb.toLowerCase()} it`
  });

  if (result.isConfirmed) {
    try {
      await updateDoc(doc(db, 'devices', device.deviceId), {
        status: newStatus
      });
      
      Swal.fire(
        `${actionVerb}d!`,
        `The device is now ${newStatus}.`,
        'success'
      );
    } catch (error) {
      console.error(`Error ${actionVerb.toLowerCase()}ing device:`, error);
      Swal.fire('Error', `Failed to ${actionVerb.toLowerCase()} device.`, 'error');
    }
  }
};

const statusClasses = (status) => {
  const isDark = isDarkMode.value;
  const safeStatus = status || 'Inactive'; 
  return {
    'bg-green-700 text-green-100': safeStatus === 'Active' && isDark,
    'bg-red-700 text-red-100': safeStatus === 'Offline' && isDark,
    'bg-yellow-700 text-yellow-100': safeStatus === 'Maintenance' && isDark,
    'bg-gray-700 text-gray-100': safeStatus === 'Inactive' && isDark,
    'bg-green-100 text-green-800': safeStatus === 'Active' && !isDark,
    'bg-red-100 text-red-800': safeStatus === 'Offline' && !isDark,
    'bg-yellow-100 text-yellow-800': safeStatus === 'Maintenance' && !isDark,
    'bg-gray-100 text-gray-800': safeStatus === 'Inactive' && !isDark,
  };
};

const formatLastSync = (timestamp) => {
  if (timestamp && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return 'N/A';
};
</script>
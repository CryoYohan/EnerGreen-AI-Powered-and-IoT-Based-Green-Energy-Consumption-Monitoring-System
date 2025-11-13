<template>
  <div class="grid m-4 sm:m-5 lg:m-10 grid-cols-1 md:grid-cols-2 gap-6 font-poppins dark:bg-gray-900">
    
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700">
      <div class="flex flex-row gap-2 items-center mb-4">
        <img src="/src/Images/icons/inventory.svg" alt="">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">Inventory Overview</h2>
      </div>

      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-500">
          <span class="text-gray-800 dark:text-gray-100 font-medium">Smart Plugs</span>
          <span class="font-semibold text-gray-700 dark:text-gray-300">{{ smartPlugCount }}</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg">
          <span class="text-gray-800 dark:text-gray-100 font-medium">Solar Panels</span>
          <span class="font-semibold text-gray-700 dark:text-gray-300">{{ solarPanelCount }}</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-500">
          <span class="text-gray-800 dark:text-gray-100 font-medium">Smart Meters</span>
          <span class="font-semibold text-gray-700 dark:text-gray-300">{{ smartMeterCount }}</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg">
          <span class="text-gray-800 dark:text-gray-100 font-medium">Sensors</span>
          <span class="font-semibold text-gray-700 dark:text-gray-300">{{ sensorCount }}</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-500">
          <span class="text-gray-800 dark:text-gray-100 font-medium">Batteries</span>
          <span class="font-semibold text-gray-700 dark:text-gray-300">{{ batteryCount }}</span>
        </div>
      </div>
    </div>

    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700">
      <div class="flex flex-row items-center gap-2 mb-4">
        <img src="/src/Images/icons/plusdevice.svg" alt="">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">Device Registration</h2>
      </div>
      
      <form @submit.prevent="registerDevice" class="space-y-3 text-sm">
        <input
          v-model="newDeviceId"
          type="text"
          placeholder="Device ID (e.g., SM-001)"
          required
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
        <select
          v-model="newDeviceType"
          required
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="" disabled>Select Device Type</option>
          <option>Smart Plug</option>
          <option>Solar Panel</option>
          <option>Smart Meter</option>
          <option>Sensor</option>
          <option>Battery</option>
        </select>
        <input
          v-model="newLocation"
          type="text"
          placeholder="Location (e.g., Warehouse A)"
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
        <select
          v.model="newStatus"
          required
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="Inactive" disabled>Initial Status</option>
          <option value="Inactive">Inactive</option>
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
        </select>
        
        <button 
          type="submit" 
          :disabled="isRegistering"
          class="w-full p-2.5 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 disabled:opacity-50">
          {{ isRegistering ? 'Registering...' : 'Register Device' }}
        </button>
        <p v-if="regError" class="text-red-500 text-xs">{{ regError }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { db } from '@/firebase.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Accept the devices list from the parent
const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  }
});

// --- PART 1: OVERVIEW LOGIC ---
const getCount = (type) => computed(() => props.devices.filter(d => d.type === type).length);
const smartPlugCount = getCount('Smart Plug');
const solarPanelCount = getCount('Solar Panel');
const smartMeterCount = getCount('Smart Meter');
const sensorCount = getCount('Sensor');
const batteryCount = getCount('Battery');

// --- PART 2: REGISTRATION LOGIC ---
const newDeviceId = ref('');
const newDeviceType = ref('');
const newLocation = ref('');
const newStatus = ref('Inactive'); // Default to Inactive
const isRegistering = ref(false);
const regError = ref('');

const registerDevice = async () => {
  if (!newDeviceId.value || !newDeviceType.value) {
    regError.value = "Device ID and Type are required.";
    return;
  }
  
  isRegistering.value = true;
  regError.value = '';
  
  const deviceRef = doc(db, 'devices', newDeviceId.value.trim());

  try {
    // Check if device already exists
    const docSnap = await getDoc(deviceRef);
    if (docSnap.exists()) {
      throw new Error("A device with this ID already exists.");
    }
    
    // Create the new device data
    const newDeviceData = {
      deviceId: newDeviceId.value.trim(),
      type: newDeviceType.value,
      location: newLocation.value,
      status: newStatus.value,
      firmware: 'v1.0.0', // Assign a default firmware
      lastSync: null,
      userId: null // Unassigned by default
    };
    
    // Set the new document
    await setDoc(deviceRef, newDeviceData);
    
    // Clear the form
    newDeviceId.value = '';
    newDeviceType.value = '';
    newLocation.value = '';
    newStatus.value = 'Inactive';
    
  } catch (error) {
    console.error("Error registering device:", error);
    regError.value = error.message;
  } finally {
    isRegistering.value = false;
  }
};
</script>
<template>
  <div class="grid m-4 sm:m-5 lg:m-8 grid-cols-1 md:grid-cols-2 gap-6 font-poppins dark:bg-gray-900">
    
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div class="flex flex-row gap-3 items-center mb-6">
        <div class="w-2 h-8 bg-emerald-500 rounded-full"></div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Inventory Overview</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Device counts by type</p>
        </div>
      </div>

      <div class="space-y-2 text-sm">
        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span class="text-gray-700 dark:text-gray-300 font-medium">Smart Plugs</span>
          </div>
          <span class="font-semibold text-gray-900 dark:text-gray-100">{{ smartPlugCount }}</span>
        </div>
        
        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="text-gray-700 dark:text-gray-300 font-medium">Solar Panels</span>
          </div>
          <span class="font-semibold text-gray-900 dark:text-gray-100">{{ solarPanelCount }}</span>
        </div>
        
        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span class="text-gray-700 dark:text-gray-300 font-medium">Smart Meters</span>
          </div>
          <span class="font-semibold text-gray-900 dark:text-gray-100">{{ smartMeterCount }}</span>
        </div>
        
        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span class="text-gray-700 dark:text-gray-300 font-medium">Sensors</span>
          </div>
          <span class="font-semibold text-gray-900 dark:text-gray-100">{{ sensorCount }}</span>
        </div>
        
        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 bg-rose-500 rounded-full"></div>
            <span class="text-gray-700 dark:text-gray-300 font-medium">Batteries</span>
          </div>
          <span class="font-semibold text-gray-900 dark:text-gray-100">{{ batteryCount }}</span>
        </div>
      </div>
    </div>

    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div class="flex flex-row gap-3 items-center mb-6">
        <div class="w-2 h-8 bg-blue-500 rounded-full"></div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Device Registration</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Add new devices to inventory</p>
        </div>
      </div>
      
      <form @submit.prevent="registerDevice" class="space-y-4 text-sm">
        <div>
          <input
            v-model="newDeviceId"
            type="text"
            placeholder="Device ID (e.g., SM-001)"
            required
            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        
        <div>
          <select
            v-model="newDeviceType"
            required
            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
          >
            <option value="" disabled>Select Device Type</option>
            <option>Smart Plug</option>
            <option>Solar Panel</option>
            <option>Smart Meter</option>
            <option>Sensor</option>
            <option>Battery</option>
          </select>
        </div>
        
        <div>
          <input
            v-model="newLocation"
            type="text"
            placeholder="Location (e.g., Warehouse A)"
            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        
        <div>
          <select
            v-model="newStatus"
            required
            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
          >
            <option value="Inactive" disabled>Initial Status</option>
            <option value="Inactive">Inactive</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          :disabled="isRegistering"
          class="w-full p-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {{ isRegistering ? 'Registering...' : 'Register Device' }}
        </button>
      </form>
    </div>

    <transition name="fade">
      <div v-if="showPopup" 
        :class="['fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold z-[100] flex items-center gap-2', 
          popupType === 'info' ? 'bg-blue-500' : popupType === 'success' ? 'bg-green-500' : 'bg-red-500']">
        <span v-if="popupType === 'success'">✅</span>
        <span v-else-if="popupType === 'error'">⚠️</span>
        <span v-else>ℹ️</span>
        {{ popupMessage }}
      </div>
    </transition>

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
const newStatus = ref('Inactive');
const isRegistering = ref(false);

// ✅ Notification State
const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("success"); 

// ✅ Helper Function for Notifications
const showNotification = (message, type = 'success') => {
  popupMessage.value = message;
  popupType.value = type;
  showPopup.value = true;
  // Auto hide after 3 seconds
  setTimeout(() => {
    showPopup.value = false;
  }, 3000);
};

const registerDevice = async () => {
  if (!newDeviceId.value || !newDeviceType.value) {
    showNotification("Device ID and Type are required.", 'error');
    return;
  }
  
  isRegistering.value = true;
  
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
      firmware: 'v1.0.0',
      lastSync: null,
      userId: null
    };
    
    // Set the new document
    await setDoc(deviceRef, newDeviceData);
    
    // ✅ Show Success Notification
    showNotification(`Device ${newDeviceId.value} registered successfully!`, 'success');

    // Clear the form
    newDeviceId.value = '';
    newDeviceType.value = '';
    newLocation.value = '';
    newStatus.value = 'Inactive';
    
  } catch (error) {
    console.error("Error registering device:", error);
    // ✅ Show Error Notification
    showNotification(error.message, 'error');
  } finally {
    isRegistering.value = false;
  }
};
</script>

<style scoped>
/* ✅ Transition Styles for the popup */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
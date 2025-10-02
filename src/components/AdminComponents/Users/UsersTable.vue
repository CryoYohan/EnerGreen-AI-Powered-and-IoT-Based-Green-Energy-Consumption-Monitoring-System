<template>
  <div class="m-4 sm:m-5 lg:m-10 font-poppins dark:bg-gray-900">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div class="relative w-full md:w-1/3">
        <input v-model="searchTerm" type="text" placeholder="Search by ID, Name, Location"
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400">
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <select v-model="selectedLocation"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <option value="">All Location</option>
          <option v-for="location in uniqueLocations" :key="location" :value="location">
            {{ location }}
          </option>
        </select>

        <select v-model="selectedStatus"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
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
              <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th v-for="header in headers" :key="header.key"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ header.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in filteredUsers" :key="user.userId">
              <td class="px-6 py-4">
                <input type="checkbox" v-model="selectedUsers" :value="user.userId" />
              </td>
              <td class="px-6 py-4 text-sm">{{ user.userId }}</td>
              <td class="px-6 py-4 text-sm">{{ user.name }}</td>
              <td class="px-6 py-4 text-sm">{{ user.location }}</td>
              <td class="px-6 py-4 text-sm">{{ user.smartMeterID }}</td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="statusClasses(user.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ capitalize(user.status) }}
                </span>
              </td>
              
              <td class="px-6 py-4 flex gap-3 text-sm">
                <button class="text-green-600 dark:text-green-400 hover:underline" @click="openModal(user)">View</button>

                <button
                    v-if="user.status.toLowerCase() === 'active'"
                    class="text-yellow-600 dark:text-yellow-400 hover:underline"
                    @click="confirmAction('suspend', user)">
                    Suspend
                </button>
                
                <button
                    v-else
                    class="text-blue-600 dark:text-blue-400 hover:underline"
                    @click="$emit('enable', user)">
                    Enable
                </button>

                <button class="text-red-600 dark:text-red-400 hover:underline" @click="confirmAction('delete', user)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="closeModal">
        <Transition
          enter-active-class="transition ease-out duration-300 transform"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-200 transform"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="showModal" class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl dark:shadow-gray-700">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">User Details</h2>
              <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">✕</button>
            </div>
            <div class="space-y-4">
              <div class="w-full flex justify-center">
                <img class="w-20 h-20 rounded-full" src="/src/Images/profile/pfp.png" alt="User Profile">
              </div>
              <div v-for="field in ['userId','name','location','smartMeterID','status']" :key="field">
                <label class="block text-sm font-medium mb-1">{{ field }}</label>
                <input v-model="selectedUser[field]" :readonly="field==='userId'" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"/>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button @click="closeModal" class="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
              <button @click="confirmAction('delete', selectedUser)" class="px-4 py-2 bg-red-600 text-white rounded-md">Remove</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showConfirmModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="showConfirmModal = false">
        <Transition
          enter-active-class="transition ease-out duration-300 transform"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-200 transform"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="showConfirmModal" class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-xl dark:shadow-gray-700 text-center">
            <h3 class="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">
              Confirm {{ capitalize(pendingAction) }}
            </h3>
            <p class="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to **{{ pendingAction }}** the account for user **{{ confirmUser.name }}** (ID: {{ confirmUser.userId }})? This action cannot be undone.
            </p>
            <div class="flex justify-center gap-4">
              <button @click="showConfirmModal = false" class="px-4 py-2 bg-gray-200 rounded-md text-gray-800 dark:bg-gray-700 dark:text-white">
                Cancel
              </button>
              <button @click="executeAction" 
                      :class="{'bg-red-600 hover:bg-red-700': pendingAction === 'delete', 'bg-yellow-600 hover:bg-yellow-700': pendingAction === 'suspend'}"
                      class="px-4 py-2 text-white rounded-md transition duration-150">
                Yes, {{ capitalize(pendingAction) }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
// The script block remains the same as the logic is not affected by the transition
import { ref, computed, defineEmits } from "vue";
const props = defineProps({ users: { type: Array, required: true } });
const emit = defineEmits(['suspend', 'enable', 'delete']);

// Helper to capitalize the first letter
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

// --- Existing State ---
const searchTerm = ref("");
const selectedLocation = ref("");
const selectedStatus = ref("");
const selectAll = ref(false);
const selectedUsers = ref([]);
const showModal = ref(false);
const selectedUser = ref({});

// --- Corrected Confirmation State ---
const showConfirmModal = ref(false);
const pendingAction = ref(''); // 'delete' or 'suspend'
const confirmUser = ref({});

// --- Configuration ---
const headers = [
  { key: "userId", label: "User ID" },
  { key: "name", label: "Name" },
  { key: "location", label: "Location" },
  { key: "smartMeterID", label: "Smart Meter ID" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action" },
];

// --- Computed Properties ---
const uniqueLocations = computed(() => [...new Set(props.users.map(u => u.location))]);
const uniqueStatuses = computed(() => [...new Set(props.users.map(u => u.status))]);

const filteredUsers = computed(() =>
  props.users.filter(u => {
    const matchesSearch =
      u.userId.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      u.smartMeterID?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      u.location?.toLowerCase().includes(searchTerm.value.toLowerCase());

    const matchesLocation = !selectedLocation.value || u.location === selectedLocation.value;
    const matchesStatus = !selectedStatus.value || u.status === selectedStatus.value;

    return matchesSearch && matchesLocation && matchesStatus;
  })
);

// --- General Functions ---

const toggleSelectAll = () => {
  selectedUsers.value = selectAll.value ? props.users.map(u => u.userId) : [];
};

const openModal = (user) => { selectedUser.value = { ...user }; showModal.value = true; };
const closeModal = () => { showModal.value = false; };

const statusClasses = (status) => ({
  'bg-green-100 text-green-800': status.toLowerCase() === 'active',
  'bg-red-100 text-red-800': status.toLowerCase() === 'inactive',
  'bg-yellow-100 text-yellow-800': status.toLowerCase() === 'pending',
  'bg-blue-100 text-blue-800': status.toLowerCase() === 'maintenance',
});

// --- Confirmation Functions ---

const confirmAction = (action, user) => {
    // If the main details modal is open, close it first
    if (showModal.value) {
        closeModal();
    }
    // Set the action type and user data
    pendingAction.value = action;
    confirmUser.value = user;
    showConfirmModal.value = true;
};

const executeAction = () => {
    // Close the confirmation modal
    showConfirmModal.value = false;

    // Emit the corresponding action with the user data
    if (pendingAction.value === 'delete') {
        emit('delete', confirmUser.value);
    } else if (pendingAction.value === 'suspend') {
        emit('suspend', confirmUser.value);
    }
    
    // Clear state
    pendingAction.value = '';
    confirmUser.value = {};
};
</script>
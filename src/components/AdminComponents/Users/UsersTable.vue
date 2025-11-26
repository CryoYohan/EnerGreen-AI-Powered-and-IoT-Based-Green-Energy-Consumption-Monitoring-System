<template>
  <div class="m-4 sm:m-5 lg:m-10 font-poppins dark:bg-gray-900 dark:text-gray-100">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div class="relative w-full md:w-1/3">
        <input v-model.lazy="searchTerm" type="text" placeholder="Search by Name, Email, ID"
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400">
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <select v-model="selectedRole" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select v-model.lazy="selectedStatus" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <option value="" class="dark:bg-gray-800">All Status</option>
          <option v-for="status in uniqueStatuses" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" v-if="filteredUsers.length > 0">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in filteredUsers" :key="user.userId">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-full object-cover" :src="user.photoURL || '/src/Images/profile/pfp.png'" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm capitalize">
                <span :class="user.role === 'admin' ? 'text-purple-600 font-bold' : 'text-gray-600 dark:text-gray-400'">{{ user.role }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{{ user.location }}</td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{{ user.smartMeterID }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="statusClasses(user.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">{{ user.status }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-green-600 dark:text-green-400 hover:underline mr-3" @click="openModal(user)">Edit</button>
                
                <button v-if="user.status && user.status.toLowerCase() === 'active'" 
                        @click="confirmAction('suspend', user)" 
                        class="text-amber-600 dark:text-amber-400 hover:underline mr-3">Suspend</button>
                <button v-else 
                        @click="confirmAction('enable', user)" 
                        class="text-blue-600 dark:text-blue-400 hover:underline mr-3">Enable</button>
                
                <button @click="confirmAction('delete', user)" class="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="text-center py-16 px-4">
          <div class="max-w-md mx-auto">
            <div class="text-6xl mb-4">🔍</div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Users Found!</h3>
            <div class="flex justify-center gap-3 mt-6">
              <button @click="clearFilters" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Clear Filters</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="closeModal">
        <div class="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg p-6 w-full max-w-md shadow-xl dark:shadow-gray-700">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit User</h2>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">✕</button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-500">User ID</label>
              <input :value="selectedUser.userId" readonly class="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed" />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
              <input v-model="selectedUser.name" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
              <select v-model="selectedUser.role" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location</label>
              <input v-model="selectedUser.location" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Smart Meter Device</label>
              <select v-model="selectedUser.smartMeterID" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="None">None / Unassigned</option>
                <option v-for="device in devices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.deviceId }} ({{ device.location || 'No Loc' }})
                </option>
              </select>
            </div>

          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeModal" class="px-4 py-2 bg-gray-200 rounded-md text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white">Cancel</button>
            <button @click="saveChanges" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showConfirmModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="showConfirmModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-xl text-center">
          <h3 class="text-xl font-semibold mb-4" :class="{'text-red-600': pendingAction === 'delete', 'text-amber-600': pendingAction === 'suspend', 'text-blue-600': pendingAction === 'enable'}">
            Confirm {{ capitalize(pendingAction) }}
          </h3>
          <p class="mb-6 text-gray-700 dark:text-gray-300">
            Are you sure you want to <strong>{{ pendingAction }}</strong> user <strong>{{ confirmUser.name }}</strong>?
          </p>
          <div class="flex justify-center gap-4">
            <button @click="showConfirmModal = false" class="px-4 py-2 bg-gray-200 rounded-md text-gray-800 dark:bg-gray-700 dark:text-white">Cancel</button>
            <button @click="executeAction" :class="{'bg-red-600 hover:bg-red-700': pendingAction === 'delete', 'bg-amber-600 hover:bg-amber-700': pendingAction === 'suspend', 'bg-blue-600 hover:bg-blue-700': pendingAction === 'enable'}" class="px-4 py-2 text-white rounded-md transition duration-150">
              Yes, {{ capitalize(pendingAction) }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, defineEmits } from "vue";

// 1. Accept 'devices' prop
const props = defineProps({ 
  users: { type: Array, required: true },
  devices: { type: Array, default: () => [] } 
});

const emit = defineEmits(['update-status', 'delete', 'edit-user']);

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

// State
const searchTerm = ref("");
const selectedLocation = ref("");
const selectedStatus = ref("");
const selectedRole = ref("");
const selectAll = ref(false);
const selectedUsers = ref([]);
const showModal = ref(false);
const selectedUser = ref({});
const showConfirmModal = ref(false);
const pendingAction = ref('');
const confirmUser = ref({});

// Headers (No changes)
const headers = [
  { key: "user", label: "User" },
  { key: "role", label: "Role" },
  { key: "location", label: "Location" },
  { key: "smartMeterID", label: "Device" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action" },
];

// Computed (No changes)
const uniqueLocations = computed(() => [...new Set(props.users.map(u => u.location || "Unknown"))]);
const uniqueStatuses = computed(() => [...new Set(props.users.map(u => u.status || "Unknown"))]);

const filteredUsers = computed(() => {
  const search = searchTerm.value.toLowerCase();
  return props.users.filter(u => {
    const matchesSearch = 
      (u.name?.toLowerCase().includes(search) ?? false) ||
      (u.email?.toLowerCase().includes(search) ?? false) ||
      (u.userId?.toLowerCase().includes(search) ?? false) ||
      (u.smartMeterID?.toLowerCase().includes(search) ?? false);

    const matchesRole = selectedRole.value === "" || u.role === selectedRole.value;
    const matchesLocation = selectedLocation.value === "" || u.location === selectedLocation.value;
    const matchesStatus = selectedStatus.value === "" || u.status === selectedStatus.value;

    return matchesSearch && matchesRole && matchesLocation && matchesStatus;
  });
});

// Actions
const toggleSelectAll = () => {
  selectedUsers.value = selectAll.value ? props.users.map(u => u.userId) : [];
};

const openModal = (user) => { 
  selectedUser.value = { ...user }; 
  showModal.value = true; 
};
const closeModal = () => { showModal.value = false; };

const saveChanges = () => {
  emit('edit-user', selectedUser.value);
  closeModal();
};

const clearFilters = () => {
  searchTerm.value = "";
  selectedLocation.value = "";
  selectedStatus.value = "";
  selectedRole.value = "";
};

const statusClasses = (status) => {
  const s = status ? status.toLowerCase() : '';
  return {
    'bg-green-100 text-green-800': s === 'active',
    'bg-red-100 text-red-800': s === 'inactive' || s === 'suspended',
    'bg-gray-100 text-gray-800': s === 'deleted',
    'bg-amber-100 text-amber-800': s === 'pending',
  };
};

// Confirmation Logic
const confirmAction = (action, user) => {
  if (showModal.value) closeModal(); // Close edit modal if open
  pendingAction.value = action;
  confirmUser.value = user;
  showConfirmModal.value = true;
};

const executeAction = () => {
  showConfirmModal.value = false;
  if (pendingAction.value === 'delete') {
    emit('delete', confirmUser.value);
  } else {
    const newStatus = pendingAction.value === 'suspend' ? 'inactive' : 'active';
    emit('update-status', { user: confirmUser.value, status: newStatus });
  }
  pendingAction.value = '';
  confirmUser.value = {};
};
</script>
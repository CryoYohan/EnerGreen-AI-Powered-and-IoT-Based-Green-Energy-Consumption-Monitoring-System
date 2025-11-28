<template>
  <div class="m-4 sm:m-5 lg:m-8 font-poppins dark:bg-gray-900 dark:text-gray-100">
    
    <!-- Filters & Search -->
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

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" v-if="filteredUsers.length > 0">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subscription</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Provider</th>
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
                    <img class="h-10 w-10 rounded-full object-cover" :src="user.photoURL || defaultProfilePicUrl" />
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
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="user.subscriptionTier === 'Premium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'">
                  {{ user.subscriptionTier || 'Free' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 uppercase">{{ user.electricityProvider || 'veco' }}</td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{{ user.location }}</td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ user.smartMeterID }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="statusClasses(user.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">{{ user.status }}</span>
              </td>
              
              <!-- ✅ MODIFIED ACTIONS COLUMN -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <!-- If Deleted, show VIEW only -->
                <div v-if="user.status && user.status.toLowerCase() === 'deleted'">
                  <button class="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer" @click="$emit('edit-user', user)">View</button>
                </div>
                <!-- Else show Edit/Suspend/Delete -->
                <div v-else>
                  <button class="text-green-600 dark:text-green-400 hover:underline mr-3" @click="$emit('edit-user', user)">Edit</button>
                  
                  <button v-if="user.status && user.status.toLowerCase() === 'active'" 
                          @click="confirmAction('suspend', user)" 
                          class="text-amber-600 dark:text-amber-400 hover:underline mr-3">Suspend</button>
                  <button v-else 
                          @click="confirmAction('enable', user)" 
                          class="text-blue-600 dark:text-blue-400 hover:underline mr-3">Enable</button>
                  
                  <button @click="confirmAction('delete', user)" class="text-red-600 hover:underline">Delete</button>
                </div>
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

    <!-- Confirm Modal -->
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
import { ref, computed, defineEmits, onMounted } from "vue";
import { getStorage, ref as storageRef, getDownloadURL } from "firebase/storage";
import { auth } from "@/firebase.js";
import { onAuthStateChanged } from "firebase/auth";

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
const showConfirmModal = ref(false);
const pendingAction = ref('');
const confirmUser = ref({});
const defaultProfilePicUrl = ref('/src/Images/profile/pfp.png'); 

const fetchDefaultProfilePic = async () => {
  try {
    const storage = getStorage();
    const pathReference = storageRef(storage, 'gs://energreen-ai-powered-iot-based.firebasestorage.app/profile_pictures/Default/pfp.png');
    defaultProfilePicUrl.value = await getDownloadURL(pathReference);
  } catch (error) { }
};

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) await fetchDefaultProfilePic();
  });
});

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
    const matchesStatus = selectedStatus.value === "" || u.status === selectedStatus.value;

    return matchesSearch && matchesRole && matchesStatus;
  });
});

const clearFilters = () => {
  searchTerm.value = "";
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

const confirmAction = (action, user) => {
  pendingAction.value = action;
  confirmUser.value = user;
  showConfirmModal.value = true;
};

const executeAction = () => {
  showConfirmModal.value = false;
  if (pendingAction.value === 'delete') {
    emit('delete', confirmUser.value);
  } else {
    const newStatus = pendingAction.value === 'suspend' ? 'Inactive' : 'Active';
    emit('update-status', { user: confirmUser.value, status: newStatus });
  }
  pendingAction.value = '';
  confirmUser.value = {};
};
</script>
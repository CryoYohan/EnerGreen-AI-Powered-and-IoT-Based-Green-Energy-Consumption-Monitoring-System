<template> 
  <div class="m-4 sm:m-5 lg:m-10 font-poppins dark:bg-gray-900">
    
    <!-- 🔍 Search + Filters + Bulk Actions -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      
      <!-- Search -->
      <div class="relative w-full md:w-1/3">
        <input v-model="searchTerm" type="text" placeholder="Search by ID, Name, Location"
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400">
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Filters -->
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

      <!-- Bulk Actions Toolbar -->
      <div class="flex flex-wrap gap-3">
        <button @click="bulkSuspend"
          class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">
          Suspend Selected
        </button>
        <button @click="bulkDelete"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          Delete Selected
        </button>
        <button @click="sendNotification"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Notify Selected
        </button>
        <button
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>
    </div>

    <!-- 📋 User Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
                <th v-for="header in headers" :key="header.key" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                    {{ user.status }}
                    </span>
                </td>
                <!-- 🔥 Action column -->
                <td class="px-6 py-4 flex gap-3 text-sm">
                    <button class="text-green-600 dark:text-green-400 hover:underline" @click="openModal(user)">View</button>
                    <button class="text-yellow-600 dark:text-yellow-400 hover:underline" @click="suspendUser(user)">Suspend</button>
                    <button class="text-blue-600 dark:text-blue-400 hover:underline" @click="notifyUser(user)">Notify</button>
                    <button class="text-red-600 dark:text-red-400 hover:underline" @click="removeUser(user)">Delete</button>
                </td>
                </tr>
            </tbody>
            </table>
        </div>
    </div>

    <!-- Modal (View/Edit User) -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl dark:shadow-gray-700">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">User Details</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            ✕
          </button>
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
          <button @click="removeUser(selectedUser)" class="px-4 py-2 bg-red-600 text-white rounded-md">Remove</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
  props: {
    users: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const searchTerm = ref("");
    const selectedLocation = ref("");
    const selectedStatus = ref("");
    const selectAll = ref(false);
    const selectedUsers = ref([]);

    const headers = [
      { key: "userId", label: "User ID" },
      { key: "name", label: "Name" },
      { key: "location", label: "Location" },
      { key: "smartMeterID", label: "Smart Meter ID" },
      { key: "status", label: "Status" },
      { key: "action", label: "Action" },
    ];

    const uniqueLocations = computed(() => [...new Set(props.users.map(u => u.location))]);
    const uniqueStatuses = computed(() => [...new Set(props.users.map(u => u.status))]);

    const filteredUsers = computed(() => {
      return props.users.filter((u) => {
        const matchesSearch =
          u.userId.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          u.name?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          u.smartMeterId?.toLowerCase().includes(searchTerm.value.toLowerCase())
          u.location?.toLowerCase().includes(searchTerm.value.toLowerCase());

        const matchesLocation = !selectedLocation.value || u.location === selectedLocation.value;
        const matchesStatus = !selectedStatus.value || u.status === selectedStatus.value;

        return matchesSearch && matchesLocation && matchesStatus;
      });
    });

    const suspendUser = (user) => {
        console.log("Suspend user:", user);
        // 🔹 Future: call Firestore update or API
    };

    const notifyUser = (user) => {
        console.log("Notify user:", user);
        // 🔹 Future: send notification logic here
    };


    const toggleSelectAll = () => {
      selectedUsers.value = selectAll.value ? props.users.map(u => u.userId) : [];
    };

    const showModal = ref(false);
    const selectedUser = ref({});
    const openModal = (user) => { selectedUser.value = { ...user }; showModal.value = true; };
    const closeModal = () => { showModal.value = false; };
    const removeUser = (user) => console.log("Remove user:", user);

    const statusClasses = (status) => ({
      'bg-green-100 text-green-800': status === 'Active',
      'bg-red-100 text-red-800': status === 'Inactive',
      'bg-yellow-100 text-yellow-800': status === 'Pending',
      'bg-blue-100 text-blue-800': status === 'Maintenance',
    });

    return {
        searchTerm, selectedLocation, selectedStatus, uniqueLocations, uniqueStatuses,
        filteredUsers, headers, showModal, selectedUser, openModal, closeModal,
        removeUser, suspendUser, notifyUser, 
        selectAll, selectedUsers, toggleSelectAll,
        statusClasses
    };

  }
};
</script>


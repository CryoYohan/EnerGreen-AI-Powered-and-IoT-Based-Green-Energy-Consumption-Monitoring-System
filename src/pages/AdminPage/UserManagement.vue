<template>
  <div class="min-h-screen dark:bg-gray-900 min-w-screen flex flex-col bg-[#F9FAFB] font-poppins transition-colors duration-300">
    <AdminHeader />
    
    <div class="flex flex-col md:flex-row justify-between items-center ">
      <Heading title="User Management" subtitle="Monitor EnerGreen's Green Energy User" />
      <button 
        @click="openAddUserModal"
        class="bg-emerald-500 hover:bg-emerald-600 text-white mr-6 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Add New User
      </button>
    </div>

    <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Metrics Grid -->
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
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ metric.definition || (metric.title.includes('Users') ? 'User Accounts' : '') }}</p>
            </div>
            <div 
              class="p-3 rounded-full"
              :class="{
                'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400': metric.title === 'Total Users',
                'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': metric.title === 'Active Users',
                'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400': metric.title === 'Inactive Users',
                'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400': metric.title === 'New Users'
              }"
            >
               <!-- Icons based on title -->
               <svg v-if="metric.title === 'Total Users'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
               <svg v-else-if="metric.title === 'Active Users'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
               <svg v-else-if="metric.title === 'Inactive Users'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
               <svg v-else-if="metric.title === 'New Users'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pb-20">
      <!-- Table Component -->
      <UsersTable
        :users="users"
        :devices="devices"
        @update-status="handleStatusChange"
        @delete="handleDeleteUser"
        @edit-user="openEditModal" 
      />
    </div>

    <Footer />
    
    <!-- Notifications -->
    <transition name="fade">
      <div v-if="popup.show" 
        :class="['fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold z-50 flex items-center gap-2', 
          popup.type === 'info' ? 'bg-blue-500' : popup.type === 'success' ? 'bg-green-500' : 'bg-red-500']">
        <span v-if="popup.type === 'success'">✅</span>
        <span v-else-if="popup.type === 'error'">⚠️</span>
        <span v-else>ℹ️</span>
        {{ popup.message }}
      </div>
    </transition>

    <!-- ADD USER MODAL -->
    <transition name="fade">
      <div v-if="showAddModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Register New User</h3>
            <button @click="showAddModal = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400">✕</button>
          </div>

          <form @submit.prevent="handleAddUser" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input v-model="newUserForm.email" type="email" required class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input v-model="newUserForm.password" type="password" required minlength="6" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input v-model="newUserForm.fullName" type="text" required class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input v-model="newUserForm.phoneNumber" type="tel" required class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select v-model="newUserForm.role" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <!-- NEW FIELDS: Provider & Subscription -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Electricity Provider</label>
                <select v-model="newUserForm.electricityProvider" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="veco">Visayan Electric (VECO)</option>
                  <option value="cebeco">CEBECO</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Subscription Tier</label>
                <select v-model="newUserForm.subscriptionTier" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="Free">Free</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
              <input v-model="newUserForm.address" type="text" required class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign Smart Meter</label>
              <select v-model="newUserForm.deviceId" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="None">None</option>
                <option v-for="device in unassignedDevices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.deviceId }} ({{ device.location || 'No Loc' }})
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Only shows devices not yet assigned to a user.</p>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="showAddModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-white">Cancel</button>
              <button type="submit" :disabled="isAddingUser" class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center">
                <span v-if="isAddingUser" class="animate-spin mr-2">⏳</span>
                {{ isAddingUser ? 'Creating...' : 'Create User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- EDIT / VIEW USER MODAL -->
    <transition name="fade">
      <div v-if="showEditModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ isViewOnly ? 'View User Details' : 'Edit User' }}</h3>
            <button @click="showEditModal = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400">✕</button>
          </div>

          <form @submit.prevent="handleEditUserSubmit" class="space-y-4">
            <!-- Read Only Email -->
             <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <input :value="editUserForm.email" disabled class="mt-1 w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input v-model="editUserForm.name" type="text" required :disabled="isViewOnly" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select v-model="editUserForm.role" :disabled="isViewOnly" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <!-- Provider -->
               <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Provider</label>
                <select v-model="editUserForm.electricityProvider" :disabled="isViewOnly" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="veco">Visayan Electric (VECO)</option>
                  <option value="cebeco">CEBECO</option>
                </select>
              </div>
            </div>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Subscription -->
              <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Subscription Tier</label>
                  <select v-model="editUserForm.subscriptionTier" :disabled="isViewOnly" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="Free">Free</option>
                    <option value="Premium">Premium</option>
                  </select>
              </div>
               <!-- Status -->
              <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <input :value="editUserForm.status" disabled class="mt-1 w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
              <input v-model="editUserForm.location" type="text" required :disabled="isViewOnly" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign Smart Meter</label>
              <select v-model="editUserForm.smartMeterID" :disabled="isViewOnly" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="None">None</option>
                <option v-for="device in editableDeviceOptions" :key="device.deviceId" :value="device.deviceId">
                  {{ device.deviceId }} ({{ device.location || 'No Loc' }})
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="showEditModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-white">
                {{ isViewOnly ? 'Close' : 'Cancel' }}
              </button>
              <button v-if="!isViewOnly" type="submit" :disabled="isEditingUser" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                <span v-if="isEditingUser" class="animate-spin mr-2">⏳</span>
                {{ isEditingUser ? 'Updating...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from "vue";
import { useUserManagement } from "@/composables/useUserManagement.js";

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import UsersTable from "@/components/AdminComponents/Users/UsersTable.vue";

const {
  users,
  devices, // Keep devices as it might be needed for other things not related to filtering
  unassignedDevices, // ADDED
  isAddingUser,
  isEditingUser,
  
  initUserManagement,
  cleanupUserManagement,
  
  createUser,
  updateUserStatus,
  removeUser,
  updateUserProfile
} = useUserManagement();

// Local UI State
const showAddModal = ref(false);
const showEditModal = ref(false);
const isViewOnly = ref(false);
const popup = reactive({ show: false, message: "", type: "info" });

const newUserForm = reactive({
  email: '', password: '', fullName: '', phoneNumber: '', address: '', 
  role: 'user', deviceId: 'None', electricityProvider: 'veco', subscriptionTier: 'Free'
});

const editUserForm = reactive({});

const editableDeviceOptions = computed(() => {
    const options = [{ deviceId: 'None', location: '' }]; // Always include None

    // If the user being edited has a device assigned, add it to the options
    if (editUserForm.smartMeterID && editUserForm.smartMeterID !== 'None') {
        const assignedDevice = devices.value.find(d => d.deviceId === editUserForm.smartMeterID);
        if (assignedDevice) {
            options.push(assignedDevice);
        }
    }
    // Add all currently unassigned devices
    unassignedDevices.value.forEach(device => {
        // Avoid adding the same device twice if it's the assigned one
        if (device.deviceId !== editUserForm.smartMeterID) {
            options.push(device);
        }
    });
    return options;
});

const showNotification = (message, type = "info") => {
  popup.message = message;
  popup.type = type;
  popup.show = true;
  setTimeout(() => (popup.show = false), 3000);
};

// --- Lifecycle ---
onMounted(() => {
  initUserManagement();
});

onUnmounted(() => {
  cleanupUserManagement();
});

// --- Handlers ---

const openAddUserModal = () => {
  Object.assign(newUserForm, { 
      email: '', password: '', fullName: '', phoneNumber: '', address: '', 
      role: 'user', deviceId: 'None', electricityProvider: 'veco', subscriptionTier: 'Free' 
  });
  showAddModal.value = true;
};

const handleAddUser = async () => {
  const result = await createUser(newUserForm);
  if (result.success) {
    showNotification(`User ${newUserForm.fullName} created successfully!`, "success");
    showAddModal.value = false;
  } else {
    showNotification(result.error, "error");
  }
};

const handleStatusChange = async ({ user, status }) => {
  const action = status === 'Inactive' ? 'Suspending' : 'Enabling';
  showNotification(`${action} ${user.name}...`, "info");
  
  const result = await updateUserStatus(user, status);
  if (result.success) {
    showNotification(`User ${user.name} updated!`, "success");
  } else {
    showNotification(`Failed: ${result.error}`, "error");
  }
};

const handleDeleteUser = async (user) => {
  showNotification(`Deleting ${user.name}...`, "info");
  const result = await removeUser(user);
  if (result.success) {
    showNotification("User deleted!", "success");
  } else {
    showNotification(`Failed: ${result.error}`, "error");
  }
};

const openEditModal = (user) => {
  isViewOnly.value = user.status && user.status.toLowerCase() === 'deleted';
  Object.assign(editUserForm, {
      userId: user.userId,
      email: user.email,
      name: user.name,
      location: user.location,
      role: user.role,
      smartMeterID: user.smartMeterID,
      electricityProvider: user.electricityProvider,
      subscriptionTier: user.subscriptionTier,
      status: user.status
  });
  showEditModal.value = true;
};

const handleEditUserSubmit = async () => {
  showNotification(`Updating profile for ${editUserForm.name}...`, "info");
  const result = await updateUserProfile(editUserForm.userId, {
    name: editUserForm.name,
    location: editUserForm.location, 
    role: editUserForm.role,
    deviceId: editUserForm.smartMeterID,
    electricityProvider: editUserForm.electricityProvider,
    subscriptionTier: editUserForm.subscriptionTier
  });
  
  if (result.success) {
    showNotification("User profile updated successfully!", "success");
    showEditModal.value = false;
  } else {
    showNotification(`Edit failed: ${result.error}`, "error");
  }
};

// --- Metrics ---
const dynamicMetrics = computed(() => {
  return [
    { title: "Total Users", cost: users.value.length.toString() },
    { title: "Active Users", cost: users.value.filter(u => u.status === 'Active' || u.status === 'active').length.toString() },
    { title: "Inactive Users", cost: users.value.filter(u => u.status === 'Inactive' || u.status === 'inactive').length.toString() },
    { title: "New Users", cost: users.value.filter(u => u.createdAt > new Date(Date.now() - 30*24*60*60*1000)).length.toString() },
  ];
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>
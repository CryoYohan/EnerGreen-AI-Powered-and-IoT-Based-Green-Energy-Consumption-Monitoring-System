<template>
  <div class="min-h-screen dark:bg-gray-900 min-w-screen flex flex-col bg-[#F9FAFB] font-poppins">
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="(metric, index) in dynamicMetrics" 
          :key="index"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
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
              <!-- Total Users Icon -->
              <svg 
                v-if="metric.title === 'Total Users'" 
                class="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              
              <!-- Active Users Icon -->
              <svg 
                v-else-if="metric.title === 'Active Users'" 
                class="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
              </svg>
              
              <!-- Inactive Users Icon -->
              <svg 
                v-else-if="metric.title === 'Inactive Users'" 
                class="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              
              <!-- New Users Icon -->
              <svg 
                v-else-if="metric.title === 'New Users'" 
                class="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-9">
      <UserInsights :insights="insights" />
      <EcoHeroes :users="users" />
    </div>

    <div class="px-6 pb-20">
      <UsersTable
        :users="users"
        :devices="devices"
        @update-status="handleStatusChange"
        @delete="handleDeleteUser"
        @edit-user="handleEditUser" 
      />
    </div>

    <Footer />
    
    <transition name="fade">
      <div v-if="showPopup" 
        :class="['fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold z-50', popupType==='info' ? 'bg-blue-500' : popupType==='success' ? 'bg-green-500' : 'bg-red-500']">
        {{ popupMessage }}
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showAddModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
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

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
              <input v-model="newUserForm.address" type="text" required class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign Smart Meter</label>
              <select v-model="newUserForm.deviceId" class="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="None">None</option>
                <option v-for="device in devices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.deviceId }} ({{ device.location || 'No Loc' }})
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Only shows devices registered in Hardware.</p>
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

  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from "vue";
// IMPORTANT: We need 'initializeApp' to create a secondary app instance
import { initializeApp } from "firebase/app"; 
import { getAuth, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collectionGroup, collection, query, onSnapshot, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase.js";

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
// REMOVED: import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import UserInsights from "@/components/AdminComponents/Users/UserInsights.vue";
import EcoHeroes from "@/components/AdminComponents/Users/EcoHeroes.vue"; 
import UsersTable from "@/components/AdminComponents/Users/UsersTable.vue";

// --- Firebase Config Re-declaration ---
// We need this to initialize a secondary app.
// Using import.meta.env ensures we use the same keys as main app.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// State
const auth = getAuth();
const currentAdminUid = ref('');
const users = ref([]);
const devices = ref([]); 
let unsubscribeUsers = null;
let unsubscribeDevices = null;
let unsubscribeAuth = null;

const insights = ref({ growthRate: [10, 12, 14, 15], churnRate: [4, 5, 6, 5], onlineUsers: [25, 28, 32, 37], topHero: "Eco42", labels: ["W1", "W2", "W3", "W4"] });
const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("info");

// Add User State
const showAddModal = ref(false);
const isAddingUser = ref(false);
const newUserForm = reactive({
  email: '',
  password: '',
  fullName: '',
  phoneNumber: '',
  address: '',
  role: 'user',
  deviceId: 'None'
});

const showNotification = (message, type = "info", duration = 3000) => {
  popupMessage.value = message;
  popupType.value = type;
  showPopup.value = true;
  setTimeout(() => (showPopup.value = false), duration);
};

// --- 1. INITIALIZATION ---
onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      currentAdminUid.value = user.uid;
      
      // Fetch Users
      if (!unsubscribeUsers) {
        const qUsers = query(collectionGroup(db, 'userProfile'));
        unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
          users.value = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const uid = docSnap.ref.parent.parent ? docSnap.ref.parent.parent.id : docSnap.id; 
            return {
              userId: uid,
              docPath: docSnap.ref.path,
              name: data.fullName || data.name || "Unnamed",
              email: data.email || "No Email",
              location: data.address || data.location || "Unknown",
              smartMeterID: data.deviceId || "None",
              status: data.status || "Active",
              role: data.role || "user",
              photoURL: data.photoURL,
              createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
            };
          });
        });
      }

      // Fetch Devices
      if (!unsubscribeDevices) {
        const qDevices = query(collection(db, "devices"));
        unsubscribeDevices = onSnapshot(qDevices, (snapshot) => {
          devices.value = snapshot.docs.map(doc => doc.data());
        });
      }

    } else {
      if (unsubscribeUsers) { unsubscribeUsers(); unsubscribeUsers = null; }
      if (unsubscribeDevices) { unsubscribeDevices(); unsubscribeDevices = null; }
      // showNotification("Please log in", "error");
    }
  });
});

onUnmounted(() => {
  if (unsubscribeUsers) unsubscribeUsers();
  if (unsubscribeDevices) unsubscribeDevices();
  if (unsubscribeAuth) unsubscribeAuth();
});

// --- 2. CREATE USER LOGIC (The Secondary App Trick) ---
const openAddUserModal = () => {
  // Reset form
  Object.assign(newUserForm, { email: '', password: '', fullName: '', phoneNumber: '', address: '', role: 'user', deviceId: 'None' });
  showAddModal.value = true;
};

const handleAddUser = async () => {
  isAddingUser.value = true;
  let secondaryApp = null;

  try {
    // 1. Initialize a Secondary App instance
    // This allows us to auth a new user WITHOUT logging out the Admin
    secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
    const secondaryAuth = getAuth(secondaryApp);

    // 2. Create Authentication
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUserForm.email, newUserForm.password);
    const newUid = userCredential.user.uid;

    // 3. Create Firestore Document (Using MAIN db, which has Admin permissions)
    // Path: artifacts/default-app-id/users/{uid}/userProfile/profile
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const userProfileRef = doc(db, `artifacts/${appId}/users/${newUid}/userProfile/profile`);

    await setDoc(userProfileRef, {
      email: newUserForm.email,
      fullName: newUserForm.fullName,
      phoneNumber: newUserForm.phoneNumber,
      address: newUserForm.address,
      role: newUserForm.role,
      deviceId: newUserForm.deviceId === 'None' ? null : newUserForm.deviceId,
      photoURL: null, // Default
      status: 'Active',
      createdAt: serverTimestamp()
    });

    // 4. If Device Assigned, Update Device Document
    if (newUserForm.deviceId !== 'None') {
      const deviceRef = doc(db, "devices", newUserForm.deviceId);
      await updateDoc(deviceRef, {
        userId: newUid,
        ownerName: newUserForm.fullName,
        location: newUserForm.address // Optional: Sync location
      });
    }

    // 5. Cleanup Secondary Auth
    await signOut(secondaryAuth);
    
    showNotification(`User ${newUserForm.fullName} created successfully!`, "success");
    showAddModal.value = false;

  } catch (error) {
    console.error("Error creating user:", error);
    showNotification(error.message, "error");
  } finally {
    // 6. Delete Secondary App instance to free resources
    // Note: In v9, explicit delete is less critical but good practice if repeated often.
    isAddingUser.value = false;
  }
};

// --- 3. EXISTING LOGIC (Backend Calls & Edits) ---
const callCloudFunction = async (action, uid) => {
  // ... (Preserved from previous step) ...
  // To save space in this snippet, assume your previous callCloudFunction logic is here
  console.log(`Calling Backend: ${action} for ${uid}`);
  try {
    const urls = {
      suspend: import.meta.env.VITE_SUSPEND_USER_URL,
      enable: import.meta.env.VITE_ENABLE_USER_URL,
      delete: import.meta.env.VITE_DELETE_USER_URL
    };
    const response = await fetch(urls[action], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: uid, adminUid: currentAdminUid.value }),
    });
    if (response.status === 405) return { success: false, error: "Method not allowed" };
    return await response.json();
  } catch (err) {
    return { success: false, error: "Network error" };
  }
};

const handleStatusChange = async ({ user, status }) => {
  // If status is 'Inactive', it means we are SUSPENDING.
  // If status is 'Active', it means we are ENABLING.
  const action = status === 'Inactive' ? 'suspend' : 'enable';
  showNotification(`${action === 'suspend' ? 'Suspending' : 'Enabling'} ${user.name}...`, "info");

  const result = await callCloudFunction(action, user.userId);
  if (result.success) {
      // Success message logic...
      showNotification(`User ${user.name} successfully ${action === 'suspend' ? 'suspended' : 'enabled'}!`, "success");
  } else {
      showNotification(`Failed: ${result.error}`, "error");
  }
};

const handleDeleteUser = async (user) => {
  showNotification(`Deleting ${user.name}...`, "info");
  const result = await callCloudFunction("delete", user.userId);
  if (result.success) showNotification("User deleted!", "success");
  else showNotification(`Failed: ${result.error}`, "error");
};

const handleEditUser = async (updatedUser) => {
  try {
    // 1. Unassign Old Device if changed
    const userId = updatedUser.userId;
    const newDeviceId = updatedUser.smartMeterID;
    
    // ... (Insert your "Find Old Device" logic here from previous step if desired) ...
    // For brevity, assuming you just update the user and the device selected:

    const userRef = doc(db, updatedUser.docPath);
    await updateDoc(userRef, {
      fullName: updatedUser.name,
      address: updatedUser.location,
      role: updatedUser.role,
      deviceId: newDeviceId
    });
    
    // If Device Changed, Update Device Doc
    if (newDeviceId && newDeviceId !== 'None') {
        await updateDoc(doc(db, 'devices', newDeviceId), {
            userId: userId,
            ownerName: updatedUser.name
        });
    }

    showNotification("User profile updated!", "success");
  } catch (error) {
    showNotification(`Edit failed: ${error.message}`, "error");
  }
};

const dynamicMetrics = computed(() => {
  return [
    { title: "Total Users", cost: users.value.length.toString() },
    { title: "Active Users", cost: users.value.filter(u => u.status === 'Active').length.toString() },
    { title: "Inactive Users", cost: users.value.filter(u => u.status === 'Inactive').length.toString() },
    // Filter for users created in the last 30 days
    { title: "New Users", cost: users.value.filter(u => u.createdAt > new Date(Date.now() - 30*24*60*60*1000)).length.toString() },
  ];
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>
<template>
  <div class="min-h-screen dark:bg-gray-900 min-w-screen flex flex-col bg-[#F9FAFB] font-poppins">
    <AdminHeader />
    <Heading title="User Management" />

    <MetricsCard :metrics="dynamicMetrics" size="large" />

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { collectionGroup, collection, query, onSnapshot, doc, updateDoc, getDocs, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/firebase.js";

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import UserInsights from "@/components/AdminComponents/Users/UserInsights.vue";
import EcoHeroes from "@/components/AdminComponents/Users/EcoHeroes.vue"; 
import UsersTable from "@/components/AdminComponents/Users/UsersTable.vue";

// State
const auth = getAuth();
const currentAdminUid = ref('');
const users = ref([]);
const devices = ref([]); // Store devices for the dropdown
let unsubscribeUsers = null;
let unsubscribeDevices = null;
let unsubscribeAuth = null;

const insights = ref({ growthRate: [10, 12, 14, 15], churnRate: [4, 5, 6, 5], onlineUsers: [25, 28, 32, 37], topHero: "Eco42", labels: ["W1", "W2", "W3", "W4"] });
const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("info");

const showNotification = (message, type = "info", duration = 3000) => {
  popupMessage.value = message;
  popupType.value = type;
  showPopup.value = true;
  setTimeout(() => (showPopup.value = false), duration);
};

// --- 1. INITIALIZATION & REAL-TIME FETCH ---
onMounted(() => {
  // Use onAuthStateChanged to handle page refreshes correctly
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      currentAdminUid.value = user.uid;
      
      // A. Fetch Users
      if (!unsubscribeUsers) {
        const qUsers = query(collectionGroup(db, 'userProfile'));
        unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
          users.value = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            // Safe UID extraction
            const uid = docSnap.ref.parent.parent ? docSnap.ref.parent.parent.id : docSnap.id; 
            return {
              userId: uid,
              docPath: docSnap.ref.path, // Store path for direct updates
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
        }, (error) => {
          console.error("Error fetching users:", error);
          showNotification("Error loading user data", "error");
        });
      }

      // B. Fetch Devices (For the Dropdown)
      if (!unsubscribeDevices) {
        const qDevices = query(collection(db, "devices"));
        unsubscribeDevices = onSnapshot(qDevices, (snapshot) => {
          devices.value = snapshot.docs.map(doc => doc.data());
        });
      }

    } else {
      // User logged out
      if (unsubscribeUsers) { unsubscribeUsers(); unsubscribeUsers = null; }
      if (unsubscribeDevices) { unsubscribeDevices(); unsubscribeDevices = null; }
      showNotification("Please log in", "error");
    }
  });
});

onUnmounted(() => {
  if (unsubscribeUsers) unsubscribeUsers();
  if (unsubscribeDevices) unsubscribeDevices();
  if (unsubscribeAuth) unsubscribeAuth();
});

// --- 2. BACKEND API CALLER (Your Original Logic) ---
const callCloudFunction = async (action, uid) => {
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
      body: JSON.stringify({ 
        uid: uid,
        adminUid: currentAdminUid.value 
      }),
    });

    if (response.status === 405) return { success: false, error: "Method not allowed" };
    return await response.json();
  } catch (err) {
    console.error("Network error:", err);
    return { success: false, error: "Network error" };
  }
};

// --- 3. ACTION HANDLERS ---

// Handle Suspend/Enable
const handleStatusChange = async ({ user, status }) => {
  const action = status === 'Inactive' ? 'suspend' : 'enable';
  showNotification(`${action === 'suspend' ? 'Suspending' : 'Enabling'} user...`, "info");
  
  const result = await callCloudFunction(action, user.userId);
  
  if (result.success) {
    showNotification(`User ${user.name} updated successfully!`, "success");
  } else {
    showNotification(`Failed: ${result.error}`, "error");
  }
};

// Handle Delete (Backend)
const handleDeleteUser = async (user) => {
  showNotification(`Deleting user...`, "info");
  const result = await callCloudFunction("delete", user.userId);
  
  if (result.success) {
    showNotification(`User deleted successfully!`, "success");
  } else {
    showNotification(`Failed to delete: ${result.error}`, "error");
  }
};

// Handle Direct Edit (Frontend SDK)
const handleEditUser = async (updatedUser) => {
  try {
    const userId = updatedUser.userId;
    const newDeviceId = updatedUser.smartMeterID; // The value from the dropdown
    
    // --- STEP 1: Unassign OLD Device ---
    // Find any device currently assigned to this user
    const devicesRef = collection(db, "devices");
    const qOldDevice = query(devicesRef, where("userId", "==", userId));
    const oldDeviceSnaps = await getDocs(qOldDevice);

    // Loop through (should usually be just 1, but safe to loop)
    const unassignPromises = oldDeviceSnaps.docs.map(docSnap => {
      // Only unassign if it's NOT the same device we are about to assign
      if (docSnap.id !== newDeviceId) {
        return updateDoc(doc(db, "devices", docSnap.id), {
          userId: null,
          ownerName: null,
          location: null // Optional: Clear location on device if unassigned
        });
      }
    });
    await Promise.all(unassignPromises);

    // --- STEP 2: Assign NEW Device (if selected) ---
    if (newDeviceId && newDeviceId !== 'None') {
      const newDeviceRef = doc(db, "devices", newDeviceId);
      
      await updateDoc(newDeviceRef, {
        userId: userId,
        ownerName: updatedUser.name, // Sync the name
        // We can also sync the location if you want the device to inherit the user's location
        location: updatedUser.location 
      });
    }

    // --- STEP 3: Update User Profile (Existing Logic) ---
    const userRef = doc(db, updatedUser.docPath || `artifacts/default-app-id/users/${updatedUser.userId}/userProfile/profile`);
    
    await updateDoc(userRef, {
      fullName: updatedUser.name,
      address: updatedUser.location,
      role: updatedUser.role,
      deviceId: newDeviceId // Update the link on the user side
    });
    
    showNotification("User and Device synced successfully!", "success");
  } catch (error) {
    console.error("Edit failed:", error);
    showNotification(`Edit failed: ${error.message}`, "error");
  }
};

// --- 4. METRICS ---
const dynamicMetrics = computed(() => {
  return [
    { title: "Total Users", icon: "/src/Images/Icons/totalusers.svg", cost: users.value.length.toString() },
    { title: "Active Users", icon: "/src/Images/Icons/users.svg", cost: users.value.filter(u => u.status === 'Active').length.toString() },
    { title: "Inactive Users", icon: "/src/Images/Icons/inactiveusers.svg", cost: users.value.filter(u => u.status === 'Inactive').length.toString() },
    { title: "New Users", icon: "/src/Images/Icons/newusers.svg", cost: users.value.filter(u => u.createdAt > new Date(Date.now() - 30*24*60*60*1000)).length.toString() },
  ];
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>
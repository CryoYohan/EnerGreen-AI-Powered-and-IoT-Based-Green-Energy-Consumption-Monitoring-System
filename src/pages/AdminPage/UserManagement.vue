<template>
  <div class="min-h-screen dark:bg-gray-900 min-w-screen flex flex-col bg-[#F9FAFB] font-poppins">
    <AdminHeader />
    <Heading title="User Management" />

    <!-- Metrics -->
    <MetricsCard :metrics="dailyMetrics" size="large" />

    <!-- Insights + Eco Heroes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <UserInsights :insights="insights" />
      <EcoHeroes :heroes="ecoHeroes" />
    </div>

    <!-- Users Table -->
    <div class="px-6 pb-20">
      <UsersTable
        :users="filteredUsers"
        @suspend="suspendUser"
        @enable="enableUser"
        @delete="deleteUser"
      />
    </div>

    <Footer />
    
    <!-- Pop-up Notification -->
    <transition name="fade">
      <div v-if="showPopup" 
           :class="[
             'fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold z-50',
             popupType==='info' ? 'bg-blue-500' :
             popupType==='success' ? 'bg-green-500' :
             'bg-red-500'
           ]">
        {{ popupMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { collectionGroup, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase";

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import UserInsights from "@/components/AdminComponents/Users/UserInsights.vue";
import EcoHeroes from "@/components/AdminComponents/Users/EcoHeroes.vue";
import UsersTable from "@/components/AdminComponents/Users/UsersTable.vue";

// Get current admin user
const auth = getAuth();
const currentAdminUid = ref('');

// Metrics
const dailyMetrics = [
  { title: "Total Users", icon: "/src/Images/Icons/totalusers.svg", cost: "127" },
  { title: "Active Users", icon: "/src/Images/Icons/users.svg", cost: "123" },
  { title: "Inactive Users", icon: "/src/Images/Icons/inactiveusers.svg", cost: "4" },
  { title: "New Users", icon: "/src/Images/Icons/newusers.svg", cost: "12" },
];

const insights = ref({});
const ecoHeroes = ref([]);
const users = ref([]);

// Filters
const filters = ref({ search: "", role: "", status: "" });
const filteredUsers = computed(() =>
  users.value.filter(u => {
    const matchesSearch =
      !filters.value.search ||
      u.name?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      u.location?.toLowerCase().includes(filters.value.search.toLowerCase());

    const matchesRole = !filters.value.role || u.role === filters.value.role;
    const matchesStatus = !filters.value.status || u.status === filters.value.status;

    return matchesSearch && matchesRole && matchesStatus;
  })
);

// Pop-up notification state
const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("info");

const showNotification = (message, type = "info", duration = 3000) => {
  popupMessage.value = message;
  popupType.value = type;
  showPopup.value = true;
  setTimeout(() => (showPopup.value = false), duration);
};

// Generic proxy route caller
const callCloudFunction = async (action, uid) => {
    console.log('Sending request with:', {
        uid: uid,
        adminUid: currentAdminUid.value
    });
    
    try {
        // --- START OF CRITICAL CHANGE ---
        // Change: Use the secure internal proxy routes instead of environment variables
        const proxyRoutes = {
            suspend: '/api/admin/suspend-user',
            enable: '/api/admin/enable-user',
            delete: '/api/admin/delete-user'
        };

        const url = proxyRoutes[action];
        
        // You should also get and include the Firebase ID Token here for authorization!
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) {
             return { success: false, error: 'Authorization token missing' };
        }
        // --- END OF CRITICAL CHANGE ---

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
      body: JSON.stringify({ 
        uid: uid,
        adminUid: currentAdminUid.value 
      }),
    });

    // Check for 405 Method Not Allowed
    if (response.status === 405) {
      console.warn("405 Method Not Allowed detected. Ignoring response.");
      return { success: false, error: "Method not allowed" };
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error("Network error:", err);
    return { success: false, error: "Network error" };
  }
};

// Suspend user
const suspendUser = async (user) => {
  showNotification(`Suspending ${user.name}...`, "info");
  const result = await callCloudFunction("suspend", user.userId);
  
  if (result.success) {
    // Update local user status
    const userIndex = users.value.findIndex(u => u.userId === user.userId);
    if (userIndex !== -1) {
      users.value[userIndex].status = "Inactive";
    }
    showNotification(`User ${user.name} suspended successfully!`, "success");
  } else {
    showNotification(`Failed to suspend user: ${result.error}`, "error");
  }
};

// Delete user
const deleteUser = async (user) => {
  showNotification(`Deleting ${user.name}...`, "info");
  const result = await callCloudFunction("delete", user.userId);
  
  if (result.success) {
    // Remove user from local array
    users.value = users.value.filter(u => u.userId !== user.userId);
    showNotification(`User ${user.name} deleted successfully!`, "success");
  } else {
    showNotification(`Failed to delete user: ${result.error}`, "error");
  }
};

// Enable user
const enableUser = async (user) => {
  showNotification(`Enabling ${user.name}...`, "info");
  const result = await callCloudFunction("enable", user.userId);
  
  if (result.success) {
    // Update local user status
    const userIndex = users.value.findIndex(u => u.userId === user.userId);
    if (userIndex !== -1) {
      users.value[userIndex].status = "Active";
    }
    showNotification(`User ${user.name} enabled successfully!`, "success");
  } else {
    showNotification(`Failed to enable user: ${result.error}`, "error");
  }
};

// Fetch users
onMounted(async () => {
  try {
    // Get current admin UID
    const user = auth.currentUser;
    if (user) {
      currentAdminUid.value = user.uid;
    } else {
      showNotification("Please log in to manage users", "error");
      return;
    }

    const profilesQuery = collectionGroup(db, "userProfile");
    const profilesSnap = await getDocs(profilesQuery);

    const loadedUsers = profilesSnap.docs.map(docSnap => {
      const profileData = docSnap.data();
      const uid = docSnap.ref.parent.parent.id;

      return {
        userId: uid,
        name: profileData.fullName || profileData.name || "Unnamed",
        location: profileData.address || profileData.location || "Unknown",
        smartMeterID: profileData.deviceId || 0,
        status: profileData.status || "Active",
        ...profileData,
      };
    });

    users.value = loadedUsers;
  } catch (err) {
    console.error("Error fetching user profiles:", err);
    showNotification("Error loading users", "error");
  }
});
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { db } from "@/firebase.js";
import { collection, query, onSnapshot, collectionGroup } from "firebase/firestore";
import { adminService } from "@/services/adminService";

/**
 * Composable for Sales Management Logic.
 * Handles fetching Devices and Users to calculate Sales KPIs.
 */
export function useSalesAnalytics() {
  const devices = ref([]);
  const users = ref([]);
  
  // Notification State
  const popup = ref({
    show: false,
    message: "",
    type: "info"
  });

  const showNotification = (msg, type = 'info') => {
    popup.value = { show: true, message: msg, type };
    setTimeout(() => popup.value.show = false, 3000);
  };

  let unsubDevices = null;
  let unsubUsers = null;

  const initSalesListeners = () => {
    // 1. Listen to Devices
    const qDevices = query(collection(db, 'devices'));
    unsubDevices = onSnapshot(qDevices, (snap) => {
      devices.value = snap.docs.map(doc => ({ deviceId: doc.id, ...doc.data() }));
    }, (error) => console.error("Devices Error:", error));

    // 2. Listen to Users
    const qUsers = query(collectionGroup(db, 'userProfile'));
    unsubUsers = onSnapshot(qUsers, (snap) => {
      users.value = snap.docs.map(doc => {
          const d = doc.data();
          const uid = doc.ref.parent.parent ? doc.ref.parent.parent.id : doc.id;
          return { 
              userId: uid, 
              name: d.fullName || d.name || 'User', 
              email: d.email || 'No Email',
              subscriptionTier: d.subscriptionTier || 'Free',
              ...d 
          };
      });
    }, (error) => console.error("Users Error:", error));
  };

  const cleanupSalesListeners = () => {
    if (unsubDevices) unsubDevices();
    if (unsubUsers) unsubUsers();
  };

  // Computed
  const soldDevices = computed(() => devices.value.filter(d => d.ownerName && d.ownerName.trim() !== ''));
  const inventoryDevices = computed(() => devices.value.filter(d => !d.ownerName || d.ownerName.trim() === ''));
  const premiumUsers = computed(() => users.value.filter(u => u.subscriptionTier === 'Premium'));
  const freeUsersCount = computed(() => users.value.length - premiumUsers.value.length);

  // Actions
  const updateUserSubscription = async (userId, tier) => {
    try {
      const response = await adminService.updateSubscription(userId, tier);
      if (response.data.success) {
        showNotification(`User updated to ${tier}`, 'success');
        return true;
      }
    } catch (e) {
      const msg = e.response?.data?.error || e.message;
      showNotification(`Update failed: ${msg}`, 'error');
    }
    return false;
  };

  return {
    devices,
    users,
    popup,
    soldDevices,
    inventoryDevices,
    premiumUsers,
    freeUsersCount,
    
    initSalesListeners,
    cleanupSalesListeners,
    updateUserSubscription
  };
}

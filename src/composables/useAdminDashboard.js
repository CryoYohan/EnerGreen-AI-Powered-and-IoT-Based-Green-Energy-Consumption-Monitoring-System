import { ref, computed, onMounted, onUnmounted, reactive } from "vue";
import { db, auth } from "@/firebase.js";
import { collection, query, onSnapshot, collectionGroup, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Composable for Admin Dashboard (Home) Logic.
 * Handles real-time listeners for Users, Devices, and Firmware.
 */
export function useAdminDashboard() {
  const stats = reactive({
    totalUsers: 0,
    totalDevices: 0,
    activeDevices: 0,
    systemHealth: 100
  });

  const firmwareReleases = ref([]);
  const ecoHeroes = ref([]);
  const devices = ref([]);
  const users = ref([]); 
  const recentDevices = ref([]);
  const attentionDevices = ref([]);

  let unsubscribeAuth = null;
  let unsubscribeUsers = null;
  let unsubscribeDevices = null;
  let unsubscribeFirmware = null;

  const initListeners = () => {
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // A. Users
        unsubscribeUsers = onSnapshot(query(collectionGroup(db, 'userProfile')), (snap) => {
          stats.totalUsers = snap.size;
          users.value = snap.docs.map(doc => {
              const d = doc.data();
              return {
                  ...d,
                  subscriptionTier: d.subscriptionTier || 'Free'
              };
          });
          
          // Mock Heroes
          ecoHeroes.value = [
             { name: "John Bake", co2: "29.4 kg", img: "/src/Images/profile/pfp.png" },
             { name: "Kate Lim", co2: "18 kg", img: "/src/Images/profile/pfp.png" },
             { name: "Marc Homes", co2: "13 kg", img: "/src/Images/profile/pfp.png" },
          ];
        });

        // B. Devices
        unsubscribeDevices = onSnapshot(collection(db, 'devices'), (snap) => {
          const allDevices = snap.docs.map(d => d.data());
          devices.value = allDevices;
          
          stats.totalDevices = allDevices.length;
          stats.activeDevices = allDevices.filter(d => d.status === 'Active').length;
          
          if (stats.totalDevices > 0) {
            stats.systemHealth = ((stats.activeDevices / stats.totalDevices) * 100).toFixed(1);
          }

          attentionDevices.value = allDevices.filter(d => 
            d.status === 'Offline' || d.status === 'Maintenance'
          );

          const sorted = [...allDevices].sort((a, b) => {
             const dateA = a.lastSync?.seconds || 0;
             const dateB = b.lastSync?.seconds || 0;
             return dateB - dateA;
          });
          recentDevices.value = sorted.slice(0, 5);
        });

        // C. Firmware
        const qFirmware = query(collection(db, 'firmware_releases'), orderBy('uploadedAt', 'desc'), limit(5));
        unsubscribeFirmware = onSnapshot(qFirmware, (snap) => {
          firmwareReleases.value = snap.docs.map(d => d.data());
        });
      }
    });
  };

  const cleanupListeners = () => {
    if (unsubscribeUsers) unsubscribeUsers();
    if (unsubscribeDevices) unsubscribeDevices();
    if (unsubscribeFirmware) unsubscribeFirmware();
    if (unsubscribeAuth) unsubscribeAuth();
  };

  // Computed Metrics
  const premiumUsers = computed(() => users.value.filter(u => u.subscriptionTier === 'Premium'));
  const soldDevices = computed(() => devices.value.filter(d => d.ownerName && d.ownerName.trim() !== ''));

  const dailyMetrics = computed(() => {
     const monthlyRevenue = premiumUsers.value.length * 599;
     const hardwareRevenue = soldDevices.value.length * 4999; 
     const totalRevenue = monthlyRevenue + hardwareRevenue;

     return [
      { 
         title: 'Total devices', 
         cost: stats.totalDevices.toString(), 
         definition: 'All Registered Units' 
      },
      { 
         title: 'Active Users', 
         cost: stats.totalUsers.toString(), 
         definition: 'Registered Accounts' 
      },
      { 
         title: 'System Health', 
         cost: stats.systemHealth + '%', 
         definition: 'Fleet Availability' 
      },
      { 
         title: 'Latest Firmware', 
         cost: firmwareReleases.value[0]?.version || 'v0.0.0', 
         definition: 'Current Release' 
      },
      { 
         title: 'Total Revenue', 
         cost: `₱${totalRevenue.toLocaleString()}`, 
         definition: `MRR: ₱${monthlyRevenue.toLocaleString()} + Hardware: ₱${hardwareRevenue.toLocaleString()}` 
      },
     ];
  });

  const firmwareChartData = computed(() => {
    const latest = firmwareReleases.value[0]?.version || 'v1.0.0';
    return {
      labels: [latest, "Older Versions"],
      datasets: [{
        data: [85, 15], // Mock ratio for now
        backgroundColor: ["#22C55E", "#60A5FA"],
        borderWidth: 0,
        cutout: "60%"
      }]
    };
  });

  const lastFirmwareDate = computed(() => {
    const date = firmwareReleases.value[0]?.uploadedAt?.toDate();
    return date ? date.toLocaleDateString() : 'N/A';
  });

  const inventoryChartData = computed(() => {
    const plugs = devices.value.filter(d => d.type === 'Smart Plug').length;
    const panels = devices.value.filter(d => d.type === 'Solar Panel').length;
    const meters = devices.value.filter(d => d.type === 'Smart Meter').length;
    const others = devices.value.length - (plugs + panels + meters);
    
    return {
      labels: ["Smart Plugs", "Solar Panels", "Smart Meters", "Others"],
      datasets: [{
        data: [plugs, panels, meters, others],
        backgroundColor: ["#22C55E", "#60A5FA", "#EAA552", "#EA52C4"],
        borderWidth: 0,
        cutout: "60%"
      }]
    };
  });

  const statusCounts = computed(() => ({
    active: stats.activeDevices,
    offline: devices.value.filter(d => d.status === 'Offline').length,
    maintenance: devices.value.filter(d => d.status === 'Maintenance').length
  }));

  return {
    // State
    stats,
    devices,
    users,
    recentDevices,
    attentionDevices,
    firmwareReleases,
    ecoHeroes,
    
    // Computed
    dailyMetrics,
    firmwareChartData,
    lastFirmwareDate,
    inventoryChartData,
    statusCounts,

    // Methods
    initListeners,
    cleanupListeners
  };
}

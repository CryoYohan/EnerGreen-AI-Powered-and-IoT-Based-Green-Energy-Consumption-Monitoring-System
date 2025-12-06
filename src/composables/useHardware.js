import { ref, onMounted, onUnmounted, computed } from 'vue';
import { db, auth } from '@/firebase.js'; 
import { collection, query, onSnapshot, collectionGroup } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; 
import { useRouter } from 'vue-router';

/**
 * Composable for Hardware Page Logic.
 * Manages device inventory and user dropdown lists.
 */
export function useHardware() {
  const devices = ref([]);
  const users = ref([]);
  const loading = ref(true);
  const router = useRouter(); 

  let unsubscribeDevices = null;
  let unsubscribeUsers = null;
  let unsubscribeAuth = null; 

  const initHardwareListeners = () => {
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 2. Fetch Devices
        if (!unsubscribeDevices) { 
          const devicesQuery = query(collection(db, "devices"));
          unsubscribeDevices = onSnapshot(devicesQuery, (querySnapshot) => {
            devices.value = querySnapshot.docs.map(doc => doc.data());
            loading.value = false;
          }, (error) => {
            console.error("Error fetching devices:", error);
            loading.value = false;
          });
        }

        // 3. Fetch Users (For assignment dropdowns)
        if (!unsubscribeUsers) {
          const usersQuery = query(collectionGroup(db, 'userProfile'));
          unsubscribeUsers = onSnapshot(usersQuery, (querySnapshot) => {
            users.value = querySnapshot.docs.map(doc => ({
              uid: doc.ref.parent.parent.id, 
              ...doc.data()
            }));
          });
        }

      } else {
        cleanupHardwareListeners();
        router.push('/');
      }
    });
  };

  const cleanupHardwareListeners = () => {
    if (unsubscribeDevices) unsubscribeDevices();
    if (unsubscribeDevices = null);
    if (unsubscribeUsers) unsubscribeUsers();
    if (unsubscribeUsers = null);
    if (unsubscribeAuth) unsubscribeAuth();
  };

  const dynamicMetrics = computed(() => {
    return [
      {
        title: 'Total devices',
        cost: devices.value.length.toString(),
        definition: 'All Registered Units'
      },
      {
        title: 'Active',
        cost: devices.value.filter(d => d.status === 'Active').length.toString(),
        definition: 'Devices Currently Online'
      },
      {
        title: 'Offline',
        cost: devices.value.filter(d => d.status === 'Offline').length.toString(),
        definition: 'Devices Currently Offline'
      },
      {
        title: 'Maintenance',
        cost: devices.value.filter(d => d.status === 'Maintenance').length.toString(),
        definition: 'Devices in Maintenance'
      },
    ];
  });

  return {
    devices,
    users,
    loading,
    dynamicMetrics,
    initHardwareListeners,
    cleanupHardwareListeners
  };
}

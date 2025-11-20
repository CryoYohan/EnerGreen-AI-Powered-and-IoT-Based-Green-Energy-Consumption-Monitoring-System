<template>
  <div
    class="min-h-screen dark:bg-gray-900 min-w-screen flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <AdminHeader />
    <Heading title="Hardware Management"/>
    
    <MetricsCard :metrics="dynamicMetrics" size="large"  />
    
    <InventoryDevice :devices="devices" />
    
    <Devices :devices="devices" :users="users" />
    
    <Firmware />
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '@/firebase.js'; 
// UPDATE: Added 'collectionGroup' to fetch all users
import { collection, query, onSnapshot, collectionGroup } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; 

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import InventoryDevice from "@/components/AdminComponents/Hardware/InventoryDevice.vue";
import Devices from "@/components/AdminComponents/Hardware/Devices.vue";
import Firmware from "@/components/AdminComponents/Hardware/Firmware.vue";

const devices = ref([]);
const users = ref([]); // New: Store users here
const loading = ref(true);
const router = useRouter(); 

let unsubscribeDevices = null;
let unsubscribeUsers = null; // New: Listener for users
let unsubscribeAuth = null; 

onMounted(() => {
  // 1. Auth Listener (Gatekeeper)
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      // --- LOGGED IN ---
      
      // 2. Fetch Devices (if not already fetching)
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

      // 3. Fetch Users (New Logic for Dropdowns)
      if (!unsubscribeUsers) {
        // collectionGroup queries all 'userProfile' collections in the DB
        const usersQuery = query(collectionGroup(db, 'userProfile'));
        unsubscribeUsers = onSnapshot(usersQuery, (querySnapshot) => {
          users.value = querySnapshot.docs.map(doc => ({
            // The parent ID is the User UID
            uid: doc.ref.parent.parent.id, 
            ...doc.data()
          }));
        });
      }

    } else {
      // --- LOGGED OUT ---
      // Clean up everything immediately
      if (unsubscribeDevices) {
        unsubscribeDevices();
        unsubscribeDevices = null;
      }
      if (unsubscribeUsers) {
        unsubscribeUsers();
        unsubscribeUsers = null;
      }
      // Router guard handles redirect, but this is a safe fallback
      router.push('/');
    }
  });
});

// Cleanup when leaving the page
onUnmounted(() => {
  if (unsubscribeDevices) unsubscribeDevices();
  if (unsubscribeUsers) unsubscribeUsers();
  if (unsubscribeAuth) unsubscribeAuth();
});

const dynamicMetrics = computed(() => {
  return [
    {
      title: 'Total devices',
      icon: '/src/Images/Icons/devices.svg',
      cost: devices.value.length.toString(),
      definition: 'All Registered Units'
    },
    {
      title: 'Active',
      icon: '/src/Images/Icons/active.svg',
      cost: devices.value.filter(d => d.status === 'Active').length.toString(),
      definition: 'Devices Currently Online'
    },
    {
      title: 'Offline',
      icon: '/src/Images/Icons/offlline.svg',
      cost: devices.value.filter(d => d.status === 'Offline').length.toString(),
      definition: 'Devices Currently Offline'
    },
    {
      title: 'Maintenance',
      icon: '/src/Images/Icons/maintenance.svg',
      cost: devices.value.filter(d => d.status === 'Maintenance').length.toString(),
      definition: 'Devices in Maintenance'
    },
  ];
});

</script>
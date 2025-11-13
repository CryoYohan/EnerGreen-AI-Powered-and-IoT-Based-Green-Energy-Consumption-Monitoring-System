<template>
  <div
    class="min-h-screen dark:bg-gray-900 min-w-screen flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <AdminHeader />
    <Heading title="Hardware Management"/>
    
    <MetricsCard :metrics="dynamicMetrics" size="large"  />
    
    <InventoryDevice :devices="devices" />
    
    <Devices :devices="devices" />
    
    <Firmware />
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '@/firebase.js'; // Make sure auth is imported
import { collection, query, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // Make sure this is imported

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";
import InventoryDevice from "@/components/AdminComponents/Hardware/InventoryDevice.vue";
import Devices from "@/components/AdminComponents/Hardware/Devices.vue";
import Firmware from "@/components/AdminComponents/Hardware/Firmware.vue";

const devices = ref([]);
const loading = ref(true);
const router = useRouter(); 

let unsubscribeDevices = null;
let unsubscribeAuth = null; // We need this to hold the auth listener

// Fetch all devices with a real-time listener
onMounted(() => {
  // Set up an auth listener that CONTROLS the device listener
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      // --- User is LOGGED IN ---
      // Start the device listener ONLY if we are logged in
      if (!unsubscribeDevices) { // Only start if it's not already running
        const devicesQuery = query(collection(db, "devices"));
        
        unsubscribeDevices = onSnapshot(devicesQuery, (querySnapshot) => {
          devices.value = querySnapshot.docs.map(doc => doc.data());
          loading.value = false;
        }, (error) => {
          console.error("Error fetching devices:", error);
          loading.value = false;
          // An error while logged in might mean permissions are wrong
          router.push('/adminhome'); // Send to a safe admin page
        });
      }
    } else {
      // --- User is LOGGED OUT ---
      // Stop the device listener IMMEDIATELY
      if (unsubscribeDevices) {
        console.log("Auth is null, stopping device listener.");
        unsubscribeDevices();
        unsubscribeDevices = null;
      }
      // The router guard will handle redirection, but we can be safe
      // and redirect from here too.
      router.push('/');
    }
  });
});

// This code runs when the component is unmounted (i.e., when you navigate away)
onUnmounted(() => {
  if (unsubscribeDevices) {
    console.log("Hardware.vue unmounting, stopping device listener.");
    unsubscribeDevices(); 
  }
  // Also clean up the auth listener
  if (unsubscribeAuth) {
    console.log("Hardware.vue unmounting, stopping auth listener.");
    unsubscribeAuth();
  }
});

// The metrics card is now computed from the live data
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
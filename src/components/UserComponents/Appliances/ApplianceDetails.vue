<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] font-sans">
    <div class="container max-w-full p-4 mx-auto lg:px-12">
      <button 
        @click="$emit('go-back')"
        class="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Appliances
      </button>

      <div class="p-6 bg-white rounded-lg shadow-md mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ device.name }}</h2>
        <p class="text-sm text-gray-500">Appliance ID: {{ device.id }}</p>
      </div>

      <!-- Loading and Error States -->
      <div v-if="loading" class="flex justify-center items-center h-48">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-blue-500 border-opacity-25"></div>
        <p class="ml-4 text-gray-600">Loading appliance signature data...</p>
      </div>
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <p class="font-bold">Error!</p>
        <p>{{ error }}</p>
      </div>

      <!-- Dynamic Chart -->
      <div v-if="signatureData && !loading" class="p-6 bg-white rounded-lg shadow-md mb-6">
        <h3 class="text-xl font-semibold text-gray-700 mb-4">Power Consumption (Watts)</h3>
        <Line :data="chartData" :options="chartOptions" />
      </div>

      <!-- Dynamic Details -->
      <div v-if="signatureData && !loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <!-- Status Card -->
        <div class="p-6 bg-white rounded-lg shadow-md flex items-center gap-4">
          <div class="flex-shrink-0 p-3 rounded-full bg-green-100 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Predicted Appliance</p>
            <p class="text-lg font-semibold text-gray-800">{{ signatureData.predictedAppliance || 'Unknown' }}</p>
          </div>
        </div>

        <!-- Location Card -->
        <div class="p-6 bg-white rounded-lg shadow-md flex items-center gap-4">
          <div class="flex-shrink-0 p-3 rounded-full bg-blue-100 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Device ID</p>
            <p class="text-lg font-semibold text-gray-800">{{ signatureData.deviceId }}</p>
          </div>
        </div>

        <!-- Current Usage Card -->
        <div class="p-6 bg-white rounded-lg shadow-md flex items-center gap-4">
          <div class="flex-shrink-0 p-3 rounded-full bg-purple-100 text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L10.5 21.75l1.5-9h-8.25z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Current Usage</p>
            <p class="text-lg font-semibold text-gray-800">{{ signatureData.currentAmp.toFixed(2) }} A</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { collection, onSnapshot, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'vue-chartjs';
import { db, auth } from '../../../firebase.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps({
  device: Object
});
const emit = defineEmits(['go-back']);

const signatureData = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(() => {
  const unsubscribeAuth = auth.onAuthStateChanged((user) => {
    if (!user) {
      error.value = "User not authenticated.";
      loading.value = false;
      return;
    }
    
    // Now that we have a user and Firestore is initialized, we can safely set up the watcher.
    // This watcher will run immediately and then again whenever the device ID changes.
    watch(() => props.device.id, (newId) => {
      // Reset state when the device ID changes
      loading.value = true;
      error.value = null;
      signatureData.value = null;

      if (!db || !newId) {
        error.value = "Firestore or device ID is missing.";
        loading.value = false;
        return;
      }

      // Reference the specific subcollection for appliance signatures based on the image provided
      const signaturesRef = collection(db, `devices/${newId}/appliance_signatures`);

      // Create a query to get the most recent signature document
      const q = query(signaturesRef, orderBy('timestamp', 'desc'), limit(1));

      // Listen to the query in real-time
      onSnapshot(q, (snapshot) => {
        loading.value = false;
        if (snapshot.docs.length > 0) {
          signatureData.value = snapshot.docs[0].data();
        } else {
          error.value = `No signature documents found for device ID: ${newId}`;
        }
      }, (err) => {
        loading.value = false;
        error.value = `Error fetching document: ${err.message}`;
        console.error("Error fetching document:", err);
      });
    }, { immediate: true });
    
    // Unsubscribe from the auth listener once we've set up the watcher
    unsubscribeAuth();
  });
});

const chartData = computed(() => {
  if (!signatureData.value || !signatureData.value.signature_data) {
    return { labels: [], datasets: [] };
  }
  const labels = signatureData.value.signature_data.map(item => item.timestamp);
  const powerData = signatureData.value.signature_data.map(item => item.powerWatt);

  return {
    labels: labels,
    datasets: [{
      label: 'Power (Watts)',
      data: powerData,
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      tension: 0.2,
      pointRadius: 3,
      pointHoverRadius: 5,
    }]
  };
});

const chartOptions = reactive({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          family: 'Inter, sans-serif'
        }
      }
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y.toFixed(2) + ' W';
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Power (Watts)'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Time (Timestamp)'
      }
    }
  }
});
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
.font-sans {
  font-family: 'Inter', sans-serif;
}
</style>

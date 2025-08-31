<template>
  <div class="container max-w-full p-4 mx-auto lg:pr-12 lg:pl-12 font-poppins">
    <div class="grid gap-6 grid-cols-v1 lg:grid-cols-2">
      <div class="p-6 bg-white rounded-lg shadow">
        <h2 class="mb-4 text-xl font-bold text-gray-800">
          Energy Source Breakdown
        </h2>
        <div class="flex flex-col items-center md:flex-row">
          <div class="w-64 h-64 mx-auto md:mr-8 lg:w-72 lg:h-72">
            <DoughnutChart 
              :chartData="energySourceData" 
              :chartOptions="doughnutOptions" 
            />
          </div>
          <div class="flex-1 mt-6 md:mt-0">
            <div class="space-y-3">
              <div class="flex items-center">
                <div class="w-4 h-4 mr-3 bg-green-500 rounded-full"></div>
                <span class="text-gray-700">Solar ({{ solarPercentage.toFixed(0) }}%)</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 mr-3 bg-blue-500 rounded-full"></div>
                <span class="text-gray-700">Grid ({{ gridPercentage.toFixed(0) }}%)</span>
              </div>
            </div>

            <div class="p-4 mt-6 rounded-lg bg-gray-50">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-600">Energy consumed today:</span>
                <span class="font-semibold">{{ totalKwh.toFixed(2) }} kWh</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Estimated Savings:</span>
                <span class="font-semibold">₱ {{ estimatedSavings.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white rounded-lg shadow">
        <h2 class="mb-4 text-xl font-bold text-gray-800">
          Top Energy Consumers
        </h2>
        <div v-if="loadingConsumers" class="pr-2 overflow-y-auto h-80 flex items-center justify-center">
            <p class="text-gray-500">Loading appliances...</p>
        </div>
        <div v-else-if="topConsumers.length > 0" class="pr-2 overflow-y-auto h-80">
          <div
            v-for="(consumer, index) in topConsumers"
            :key="index"
            class="flex items-center justify-between px-3 py-4 transition-colors rounded-lg hover:bg-gray-50"
          >
            <div class="flex items-center space-x-4">
              <div
                class="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full shrink-0"
              >
                <span class="text-gray-500">{{ index + 1 }}</span>
              </div>
              <span class="text-gray-800">{{ consumer.name }}</span>
            </div>
            <span class="font-semibold text-gray-700"
              >{{ consumer.usage.toFixed(2) }} kWh</span
            >
          </div>
        </div>
        <div v-else class="pr-2 overflow-y-auto h-80 flex flex-col items-center justify-center text-center">
            <p class="text-gray-500 mb-4">You don't have individual appliances being monitored.</p>
            <p class="text-gray-700 font-semibold">Consider buying a smart plug to get a more detailed breakdown.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DoughnutChart from '@/components/ReusableComponents/DoughnutChart.vue';
import { onAuthStateChanged } from 'firebase/auth'; // Correct import
import { onSnapshot, collection, query, doc } from 'firebase/firestore'; // Correct import
import { db, auth } from '../../../firebase.js';
import { ref, computed, onMounted } from 'vue';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export default {
  components: {
    DoughnutChart
  },
  setup() {
    const gridKwh = ref(0);
    const solarKwh = ref(0);
    const topConsumers = ref([]);
    const loadingConsumers = ref(true);

    const energySourceData = computed(() => {
      const total = gridKwh.value + solarKwh.value;
      const gridPercentage = total > 0 ? (gridKwh.value / total) * 100 : 0;
      const solarPercentage = total > 0 ? (solarKwh.value / total) * 100 : 0;
      
      return {
        labels: ["Solar", "Grid"],
        datasets: [
          {
            data: [solarPercentage, gridPercentage],
            backgroundColor: ["#10B981", "#3B82F6"],
            borderWidth: 0,
            cutout: "60%",
          },
        ],
      };
    });

    const doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.raw.toFixed(2)}%`,
          },
        },
      },
    };

    const totalKwh = computed(() => gridKwh.value + solarKwh.value);
    const solarPercentage = computed(() => totalKwh.value > 0 ? (solarKwh.value / totalKwh.value) * 100 : 0);
    const gridPercentage = computed(() => totalKwh.value > 0 ? (gridKwh.value / totalKwh.value) * 100 : 0);
    const estimatedSavings = computed(() => {
      // Assuming a rough rate of ₱10 per kWh for the grid
      const gridRate = 10;
      return solarKwh.value * gridRate;
    });

    const fetchEnergyData = (deviceId) => {
      // Fetch energy source data
      const readingsQuery = query(
        collection(db, `devices/${deviceId}/realtime_readings`)
      );

      onSnapshot(readingsQuery, (querySnapshot) => {
        let newGridKwh = 0;
        let newSolarKwh = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.energySource === "Grid") {
            newGridKwh += data.kwhConsumed || 0;
          } else if (data.energySource === "Solar") {
            newSolarKwh += data.kwhConsumed || 0;
          }
        });
        gridKwh.value = newGridKwh;
        solarKwh.value = newSolarKwh;
      }, (error) => {
        console.error("Error fetching energy source data:", error);
      });

      // Fetch top consumers data
      loadingConsumers.value = true;
      const consumersQuery = query(
        collection(db, `devices/${deviceId}/appliances`)
      );

      onSnapshot(consumersQuery, (querySnapshot) => {
        const fetchedAppliances = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedAppliances.push({
            id: doc.id,
            name: data.name || 'Unknown Appliance',
            usage: data.kwhConsumed || 0,
          });
        });

        // Sort by kwh consumed in descending order
        fetchedAppliances.sort((a, b) => b.usage - a.usage);
        topConsumers.value = fetchedAppliances;
        loadingConsumers.value = false;
      }, (error) => {
        console.error("Error fetching top consumers:", error);
        loadingConsumers.value = false;
        topConsumers.value = [];
      });
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile/profile`);
          onSnapshot(userProfileRef, (profileSnap) => {
            if (profileSnap.exists() && profileSnap.data().deviceId) {
              fetchEnergyData(profileSnap.data().deviceId);
            } else {
              gridKwh.value = 1;
              solarKwh.value = 0;
              loadingConsumers.value = false;
              topConsumers.value = [];
            }
          }, (error) => {
            console.error("Error listening to user profile:", error);
          });
        } else {
          gridKwh.value = 1;
          solarKwh.value = 0;
          loadingConsumers.value = false;
          topConsumers.value = [];
        }
      });
    });

    return {
      energySourceData,
      doughnutOptions,
      totalKwh,
      solarPercentage,
      gridPercentage,
      estimatedSavings,
      topConsumers,
      loadingConsumers
    };
  }
};
</script>

<style scoped>
/* You can add component-specific styles here if needed */
</style>

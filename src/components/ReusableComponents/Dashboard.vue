<template>
  <div class="dashboard">
    <h1>EnerGreen Real-Time Dashboard</h1>
   
    <div v-if="loading">Loading real-time data...</div>

    <div v-else-if="latestReading" class="card">
      <h2>Latest Reading</h2>
      <p><strong>Device ID:</strong> {{ latestReading.deviceId }}</p>
      <p><strong>Timestamp:</strong> {{ new Date(latestReading.timestamp * 1000).toLocaleString() }}</p>
      <p><strong>Voltage:</strong> {{ latestReading.voltageVolt }} V</p>
      <p><strong>Current:</strong> {{ latestReading.currentAmp }} A</p>
      <p><strong>Power:</strong> {{ latestReading.powerWatt }} W</p>
      <p><strong>Energy Consumed:</strong> {{ latestReading.kwhConsumed }} kWh</p>
      <p><strong>Frequency:</strong> {{ latestReading.frequencyHz }} Hz</p>
      <p><strong>Power Factor:</strong> {{ latestReading.powerFactor }}</p>
    </div>

    <div v-else>No data available yet. Please check your ESP32 connection.</div>

  </div>
</template>

<script>
import { db, collection, onSnapshot, query, orderBy, limit } from '../../firebase';

export default {
  name: 'EnergreenDashboard',
  data() {
    return {
      latestReading: null,
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchLatestReading();
  },
  methods: {
    fetchLatestReading() {
      // Create a query to get the latest reading
      // Assumes your Cloud Function adds a timestamp field.
      // We'll order by timestamp in descending order and only get the first one.
      const q = query(
        collection(db, 'devices', 'energreen_esp32_001', 'realtime_readings'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      // Set up a real-time listener with onSnapshot
      onSnapshot(q, (querySnapshot) => {
        this.loading = false; // Data has been received
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            this.latestReading = doc.data();
            console.log("New data received:", this.latestReading);
          });
        } else {
          this.latestReading = null;
          console.log("No data found in Firestore.");
        }
      }, (error) => {
        this.loading = false;
        this.error = "Failed to fetch data: " + error.message;
        console.error("Firestore error:", error);
      });
    },
  },
};
</script>

<style scoped>
.dashboard {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  text-align: left;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.card p {
  margin: 8px 0;
}
</style>
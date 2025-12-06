// src/data/carbonRepository.js
import { db } from '@/firebase.js';
import { doc, collection, query, orderBy, limit, getDocs, where, Timestamp, onSnapshot } from 'firebase/firestore';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

/**
 * Fetches the latest carbon rate factor from Firestore.
 * @returns {Promise<number>} The carbon rate in kg/kWh.
 */
export async function getCarbonRate() {
  try {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/carbon_emission_rates`),
      orderBy("date_updated", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data().carbonRateKg || 0.7; // Default fallback
    }
    return 0.7;
  } catch (err) {
    console.error("Error fetching carbon rate:", err);
    return 0.7; // Return fallback on error
  }
}

/**
 * Fetches historical daily summaries for a given device.
 * @param {string} deviceId The ID of the device.
 * @param {number} days The number of days to fetch.
 * @returns {Promise<Array<Object>>}
 */
export async function getDailySummaries(deviceId, days = 365) {
  if (!deviceId) return [];
  const summariesQuery = query(
    collection(db, `devices/${deviceId}/daily_summaries`),
    orderBy("date", "desc"),
    limit(days)
  );
  const querySnapshot = await getDocs(summariesQuery);
  return querySnapshot.docs.map(doc => doc.data());
}

/**
 * Sets up a real-time listener for today's readings to calculate hourly data.
 * @param {string} deviceId The ID of the device to monitor.
 * @param {function} callback Function to be called with the hourly data whenever it updates.
 * @returns {function} An unsubscribe function to stop the listener.
 */
export function listenToHourlyReadings(deviceId, callback) {
  if (!deviceId) {
    callback({ data: [], error: "No device ID provided." });
    return () => {};
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = Timestamp.fromDate(today);

  const readingsQuery = query(
    collection(db, `devices/${deviceId}/realtime_readings`),
    where("timestamp", ">=", startOfDay),
    orderBy("timestamp", "asc")
  );

  const unsubscribe = onSnapshot(readingsQuery, (snapshot) => {
    const readings = snapshot.docs.map(doc => doc.data());
    callback({ data: readings, error: null });
  }, (err) => {
    console.error("Error listening to hourly readings:", err);
    callback({ error: `Failed to fetch hourly data: ${err.message}` });
  });

  return unsubscribe;
}

// src/data/solarRepository.js
import { db } from '@/firebase.js';
import { doc, collection, query, orderBy, limit, getDocs, getDoc, where, Timestamp, onSnapshot } from 'firebase/firestore';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

/**
 * Fetches the user's utility rate.
 * @param {string} providerId The user's electricity provider.
 * @returns {Promise<number>}
 */
export async function getUtilityRate(providerId) {
    const effectiveProviderId = providerId || 'veco';
    try {
        const rateRef = doc(db, `artifacts/${appId}/public/data/utility_rates/${effectiveProviderId}`);
        const rateSnap = await getDoc(rateRef);
        return rateSnap.exists() ? rateSnap.data().kwhRate || 12.0 : 12.0;
    } catch (e) {
        console.error("Error fetching utility rate:", e);
        return 12.0;
    }
}

/**
 * Fetches the global carbon rate.
 * @returns {Promise<number>}
 */
export async function getCarbonRate() {
    try {
        const q = query(collection(db, `artifacts/${appId}/public/data/carbon_emission_rates`), orderBy("date_updated", "desc"), limit(1));
        const snapshot = await getDocs(q);
        return snapshot.empty ? 0.71 : snapshot.docs[0].data().carbonRateKg;
    } catch (err) {
        console.error("Error fetching carbon rate:", err);
        return 0.71;
    }
}

/**
 * Fetches historical daily summaries.
 * @param {string} deviceId The device ID.
 * @returns {Promise<Array<Object>>}
 */
export async function getDailySummaries(deviceId) {
    if (!deviceId) return [];
    const q = query(collection(db, `devices/${deviceId}/daily_summaries`), orderBy('date', 'desc'), limit(365));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
}

/**
 * Sets up a real-time listener for today's hourly readings.
 * @param {string} deviceId The device ID.
 * @param {function} callback The function to call with updated data.
 * @returns {function} The unsubscribe function.
 */
export function listenToHourlyReadings(deviceId, callback) {
  if (!deviceId) {
    callback([]);
    return () => {};
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = Timestamp.fromDate(today);
  const q = query(
    collection(db, `devices/${deviceId}/realtime_readings`),
    where("timestamp", ">=", startOfDay),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const readings = snapshot.docs.map(doc => doc.data());
    callback(readings);
  }, (err) => {
    console.error("Error fetching hourly readings:", err);
    callback([]);
  });
}

// src/data/deviceRepository.js
import { db } from '@/firebase.js';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';

/**
 * Fetches the most recent daily summary for a given device.
 * @param {string} deviceId The ID of the device.
 * @returns {Promise<Object|null>}
 */
export async function getTodaysSummary(deviceId) {
  const todayDate = new Date().toISOString().slice(0, 10);
  const summaryRef = doc(db, `devices/${deviceId}/daily_summaries/${todayDate}`);
  const docSnap = await getDoc(summaryRef);
  return docSnap.exists() ? docSnap.data() : null;
}

/**
 * Fetches historical daily summaries for a given device.
 * @param {string} deviceId The ID of the device.
 * @param {number} days The number of days to fetch.
 * @returns {Promise<Array<Object>>}
 */
export async function getDailySummaries(deviceId, days = 365) {
  const summariesQuery = query(
    collection(db, `devices/${deviceId}/daily_summaries`),
    orderBy("date", "desc"),
    limit(days)
  );
  const querySnapshot = await getDocs(summariesQuery);
  return querySnapshot.docs.map(doc => doc.data());
}

/**
 * Fetches today's realtime readings for a given device.
 * @param {string} deviceId The ID of the device.
 * @returns {Promise<Array<Object>>}
 */
export async function getTodaysReadings(deviceId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = Timestamp.fromDate(today);

    const readingsQuery = query(
        collection(db, `devices/${deviceId}/realtime_readings`),
        where("timestamp", ">=", startOfDay),
        orderBy("timestamp", "asc")
    );
    const querySnapshot = await getDocs(readingsQuery);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), timestamp: doc.data().timestamp.toDate() }));
}

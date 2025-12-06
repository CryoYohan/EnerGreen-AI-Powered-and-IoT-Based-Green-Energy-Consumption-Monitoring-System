import { db } from "@/firebase.js";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";

/**
 * Service for fetching monitoring and analytics data.
 * Decouples Firestore logic from the UI/Composable layer.
 */
export const monitoringService = {
  /**
   * Fetches daily summaries for a specific device.
   * @param {string} deviceId 
   * @param {number} limitCount 
   * @returns {Promise<Array>} List of summary documents
   */
  async fetchDeviceDailySummaries(deviceId, limitCount) {
    const q = query(
      collection(db, `devices/${deviceId}/daily_summaries`),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  },

  /**
   * Fetches all devices to generate the households list.
   * @returns {Promise<Array>} List of device objects
   */
  async fetchAllDevices() {
    const snapshot = await getDocs(collection(db, "devices"));
    return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }));
  }
};

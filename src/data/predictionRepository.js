// src/data/predictionRepository.js
import { db } from '@/firebase.js';
import { doc, collection, query, orderBy, limit, onSnapshot, getDoc } from 'firebase/firestore';

/**
 * Sets up a real-time listener for the latest prediction documents for a given device.
 * @param {string} deviceId The ID of the device to monitor.
 * @param {function} callback Function to be called with the prediction data whenever it updates.
 * @returns {function} An unsubscribe function to stop the listener.
 */
export function listenToPredictions(deviceId, callback) {
  if (!deviceId) {
    callback({ error: "No device ID provided." });
    return () => {}; // Return an empty unsubscribe function
  }

  const predictionsQuery = query(
    collection(db, `devices/${deviceId}/predictions`),
    orderBy("timestamp", "desc"),
    limit(2) // We get the latest 2 to compare metrics
  );

  const unsubscribe = onSnapshot(
    predictionsQuery,
    (snapshot) => {
      if (snapshot.empty) {
        callback({ data: [], error: null });
        return;
      }
      
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback({ data: docs, error: null });
    },
    (err) => {
      console.error("Error listening to predictions:", err);
      callback({ error: `Failed to fetch predictions: ${err.message}` });
    }
  );

  return unsubscribe;
}

/**
 * Fetches the user profile to get the associated device ID.
 * @param {string} userId The UID of the logged-in user.
 * @returns {Promise<Object|null>}
 */
export async function getUserProfile(userId) {
    if (!userId) return null;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`);
    const snap = await getDoc(userProfileRef);
    return snap.exists() ? snap.data() : null;
}

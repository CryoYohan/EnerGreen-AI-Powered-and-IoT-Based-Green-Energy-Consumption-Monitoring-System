// src/data/costRepository.js
import { db } from '@/firebase.js';
import { doc, collection, query, orderBy, limit, getDocs, getDoc } from 'firebase/firestore';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

/**
 * Fetches the utility rate for a specific provider.
 * @param {string} providerId The ID of the electricity provider (e.g., 'veco').
 * @returns {Promise<number>} The rate per kWh.
 */
export async function getUtilityRate(providerId) {
    // Fallback to a default provider if none is specified
    const effectiveProviderId = providerId || 'veco';
    try {
        const rateRef = doc(db, `artifacts/${appId}/public/data/utility_rates/${effectiveProviderId}`);
        const rateSnap = await getDoc(rateRef);
        if (rateSnap.exists()) {
            // Use the generic 'kwhRate' field which is more robust
            return rateSnap.data().kwhRate || 12.0;
        }
        console.warn(`No rate document found for provider: ${effectiveProviderId}. Using fallback rate.`);
        return 12.0;
    } catch (e) {
        console.error("Error fetching utility rate:", e);
        return 12.0; // Return fallback on error
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
        orderBy('date', 'desc'),
        limit(days)
    );
    const querySnapshot = await getDocs(summariesQuery);
    return querySnapshot.docs.map(doc => doc.data());
}
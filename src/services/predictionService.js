// src/services/predictionService.js
import { ref } from 'vue';
import { db, doc, onSnapshot, collection, query, orderBy, limit, getDocs, getDoc } from '@/firebase.js';
import * as predictionRepo from '@/data/predictionRepository.js';
import api from '@/services/api.js';

// --- Reactive State for shared data ---
const currentRate = ref(0);
const carbonRateKg = ref(0.7);

/**
 * Fetches the latest utility and carbon rates based on the user's provider.
 * @param {string} providerId The user's electricity provider (e.g., 'veco').
 */
export async function loadContextualRates(providerId) {
    try {
        // Utility Rate (Dynamic)
        if (providerId) {
            const rateRef = doc(db, `artifacts/default-app-id/public/data/utility_rates/${providerId}`);
            const rateSnap = await getDoc(rateRef);
            if (rateSnap.exists()) {
                currentRate.value = rateSnap.data().kwhRate || 0;
            } else {
                console.warn(`No rate document found for provider: ${providerId}`);
                currentRate.value = 0;
            }
        } else {
            console.warn("No providerId given to loadContextualRates.");
            currentRate.value = 0;
        }

        // Carbon Rate (Remains global)
        const q = query(
            collection(db, "artifacts/default-app-id/public/data/carbon_emission_rates"),
            orderBy("date_updated", "desc"),
            limit(1)
        );
        const carbonSnap = await getDocs(q);
        if (!carbonSnap.empty) {
            carbonRateKg.value = carbonSnap.docs[0].data().carbonRateKg;
        }
    } catch (err) {
        console.error("Error fetching contextual rates:", err);
    }
}

/**
 * Processes raw prediction documents into a structured format for the UI.
 * @param {Array<Object>} docs Raw documents from Firestore.
 */
export function processPredictionData(docs) {
    if (!docs || docs.length === 0) {
        return {
            latestPredictionTimestamp: null,
            rawPredictions: { lightgbm: [], prophet: [] },
            anomalies: [],
            overviewMetrics: []
        };
    }

    const latest = docs[0];
    const previous = docs[1];

    // Helper to add hours logic
    const addHours = (preds) => (preds || []).map(p => {
        let hours = 0;
        switch (p.interval) {
            case "Immediate": hours = 1 / 60; break;
            case "Next Hour": hours = 1; break;
            case "Next Day": hours = 24; break;
            case "Next Week": hours = 24 * 7; break;
            case "Next Month": hours = 24 * 30; break;
        }
        return { ...p, hours_in_interval: hours };
    });

    const rawPredictions = {
        lightgbm: addHours(latest.predictions?.lightgbm),
        prophet: addHours(latest.predictions?.prophet)
    };

    let overviewMetrics = [];
    if (latest.metrics) {
        const m = latest.metrics;
        const prev = previous?.metrics || {};
        overviewMetrics = [
            {
                label: "Baseline Consumption",
                value: `${m.baseline_consumption?.toFixed(2)} kWh`,
                trend: prev.baseline_consumption ? `${((m.baseline_consumption - prev.baseline_consumption) / prev.baseline_consumption * 100).toFixed(2)}% vs last run` : null
            },
            { label: "Model Accuracy (LightGBM)", value: `${((m.lightgbm_accuracy ?? 0) * 100).toFixed(2)}%` },
            { label: "Model Accuracy (Prophet)", value: `${((m.prophet_accuracy ?? 0) * 100).toFixed(2)}%` },
            { label: "Carbon Rate", value: `${carbonRateKg.value.toFixed(2)} kg/kWh` },
            { label: "Utility Rate", value: new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(currentRate.value) }
        ];
    }
    
    return {
        latestPredictionTimestamp: latest.timestamp,
        rawPredictions,
        anomalies: latest.anomalies || [],
        overviewMetrics
    };
}

/**
 * Triggers the AI prediction process via the backend API.
 * @param {string} deviceId The device to run the prediction for.
 */
export async function triggerPredictionRun(deviceId) {
    if (!deviceId) {
        throw new Error("Device ID is required to run analysis.");
    }
    console.log("Triggering prediction run for:", deviceId);
    
    try {
        const response = await api.post('/api/user/predict', { deviceId });
        return response.data;
    } catch (err) {
        console.error("Error triggering prediction run:", err);
        throw err; // Re-throw to be handled by the component
    }
}

// Export repository functions to be used by the service
export const listenToPredictions = predictionRepo.listenToPredictions;
export const getUserProfile = predictionRepo.getUserProfile;

// Export reactive rates for components to use
export { currentRate, carbonRateKg };

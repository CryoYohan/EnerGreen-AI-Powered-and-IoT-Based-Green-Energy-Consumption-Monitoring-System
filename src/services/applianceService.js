// src/services/applianceService.js
import * as applianceRepo from '@/data/applianceRepository.js';
import api from '@/services/api.js';

const PREDICT_URL = import.meta.env.VITE_PREDICT_URL;
const CLUSTER_URL = import.meta.env.VITE_CLUSTER_URL;

/**
 * Fetches and processes both labeled appliances and suggested clusters.
 * @param {string} deviceId The user's device ID.
 * @returns {Promise<Object>} An object containing labeled and suggested appliances.
 */
export async function getAppliances(deviceId) {
    if (!deviceId) return { labeled: [], suggested: [] };

    const [signatures, clusters] = await Promise.all([
        applianceRepo.getApplianceSignatures(deviceId),
        applianceRepo.getClusters(deviceId)
    ]);

    const labeled = signatures
        .filter(s => s.status === "confirmed" && (s.confirmed_label || s.label))
        .map(s => ({
            id: s.id,
            name: s.confirmed_label || s.label,
            location: "N/A", // This can be enhanced if location data is stored
            status: "Active",
            usage: 0, // Usage might come from a different source or be calculated
            maxUsage: 1,
            icon: "/src/images/icons/ref.svg",
        }));

    const suggested = clusters.map(c => ({
        id: c.id,
        user_label: c.user_label || "",
        status: c.status || "unlabeled",
        summary: c.summary || {},
        tempLabel: c.user_label || c.ai_suggestion || "",
    }));

    return { labeled, suggested };
}

/**
 * Fetches all signatures and calculates ON/OFF/Total counts.
 * @param {string} deviceId The user's device ID.
 * @returns {Promise<Object>}
 */
export async function getApplianceCounts(deviceId) {
    if (!deviceId) return { total: 0, on: 0, off: 0 };

    const signatures = await applianceRepo.getApplianceSignatures(deviceId);
    let onCount = 0;
    let offCount = 0;
    signatures.forEach(sig => {
        if (sig.event_type === "ON") onCount++;
        else if (sig.event_type === "OFF") offCount++;
    });
    return { total: signatures.length, on: onCount, off: offCount };
}


/**
 * Calls the backend API to scan for new, unlabeled signatures.
 * @param {string} deviceId The user's device ID.
 * @returns {Promise<Array<Object>>} A list of newly identified, unlabeled signatures.
 */
export async function scanForNewSignatures(deviceId) {
    if (!deviceId) throw new Error("Device ID is required for scanning.");

    const signatures = await applianceRepo.getApplianceSignatures(deviceId);
    const unidentified = signatures.filter(s => s.status === 'unidentified');

    const predictionPromises = unidentified.map(async (signature) => {
        const response = await fetch(PREDICT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ device_id: deviceId, signature: signature.signature || [] }),
        });
        const result = await response.json();
        
        // Update Firestore in the background
        await applianceRepo.updateSignatureLabel(deviceId, signature.id, result.predicted_label);

        return {
            id: signature.id,
            tempLabel: "",
            ai_prediction: result.predicted_label,
            confidence: result.predicted_probabilities?.[result.predicted_label] || null,
        };
    });

    return Promise.all(predictionPromises);
}

/**
 * Calls the backend API to trigger signature clustering.
 * @param {string} deviceId The user's device ID.
 * @returns {Promise<Object>} The result from the clustering service.
 */
export async function triggerClustering(deviceId) {
    if (!deviceId) throw new Error("Device ID is required for clustering.");

    const response = await fetch(CLUSTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: deviceId })
    });
    return response.json();
}

/**
 * Saves a user-defined label for a suggested appliance cluster.
 * @param {string} deviceId The user's device ID.
 * @param {Object} cluster The cluster object to label.
 */
export async function confirmClusterLabel(deviceId, cluster) {
    if (!cluster.tempLabel) throw new Error("Label cannot be empty.");

    await applianceRepo.updateClusterLabel(deviceId, cluster.id, cluster.tempLabel);
    await applianceRepo.confirmApplianceFromCluster(deviceId, {
        ...cluster,
        user_label: cluster.tempLabel // Ensure the correct label is passed
    });
}

/**
 * Deletes an appliance signature.
 * @param {string} deviceId The user's device ID.
 * @param {string} signatureId The ID of the signature to delete.
 */
export async function deleteAppliance(deviceId, signatureId) {
    if (!deviceId || !signatureId) throw new Error("Device ID and Signature ID are required.");
    await applianceRepo.deleteSignature(deviceId, signatureId);
}

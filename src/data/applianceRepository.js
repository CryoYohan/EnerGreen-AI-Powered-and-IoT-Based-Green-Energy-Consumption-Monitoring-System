// src/data/applianceRepository.js
import { db } from '@/firebase.js';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Fetches all appliance prediction documents for a given device.
 * @param {string} deviceId The device ID.
 * @returns {Promise<Array<Object>>}
 */
export async function getApplianceSignatures(deviceId) {
    if (!deviceId) return [];
    const predictionsRef = collection(db, `devices/${deviceId}/appliance_predictions`);
    const q = query(predictionsRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetches all cluster documents for a given device.
 * @param {string} deviceId The device ID.
 * @returns {Promise<Array<Object>>}
 */
export async function getClusters(deviceId) {
    if (!deviceId) return [];
    const clustersRef = collection(db, `devices/${deviceId}/clusters`);
    const snapshot = await getDocs(clustersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Updates the label and status of a signature document.
 * @param {string} deviceId The device ID.
 * @param {string} signatureId The ID of the signature document.
 * @param {string} newLabel The new user-provided label.
 */
export async function updateSignatureLabel(deviceId, signatureId, newLabel) {
    const signatureRef = doc(db, `devices/${deviceId}/appliance_predictions`, signatureId);
    await updateDoc(signatureRef, {
        status: "confirmed",
        confirmed_label: newLabel,
        confirmed_at: serverTimestamp()
    });
}

/**
 * Updates the label and status of a cluster document.
 * @param {string} deviceId The device ID.
 * @param {string} clusterId The ID of the cluster document.
 * @param {string} newLabel The new user-provided label.
 */
export async function updateClusterLabel(deviceId, clusterId, newLabel) {
    const clusterRef = doc(db, `devices/${deviceId}/clusters`, clusterId);
    await updateDoc(clusterRef, {
        user_label: newLabel,
        status: "labeled",
    });
}

/**
 * Creates a new document in the 'confirmed_appliances' subcollection.
 * @param {string} deviceId The device ID.
 * @param {Object} cluster The cluster data to confirm.
 */
export async function confirmApplianceFromCluster(deviceId, cluster) {
    const confirmedRef = doc(db, `devices/${deviceId}/confirmed_appliances`, cluster.id);
    await setDoc(confirmedRef, {
        cluster_id: cluster.id,
        user_label: cluster.user_label,
        centroid: cluster.summary?.centroid || [],
        summary: cluster.summary || {},
        created_at: cluster.created_at || serverTimestamp(),
        confirmed_at: serverTimestamp(),
    });
}

/**
 * Deletes an appliance signature document.
 * @param {string} deviceId The device ID.
 * @param {string} signatureId The ID of the signature document to delete.
 */
export async function deleteSignature(deviceId, signatureId) {
    const signatureRef = doc(db, `devices/${deviceId}/appliance_predictions`, signatureId);
    await deleteDoc(signatureRef);
}

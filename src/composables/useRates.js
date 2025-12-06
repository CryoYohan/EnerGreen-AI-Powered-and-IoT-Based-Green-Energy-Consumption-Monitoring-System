import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue';
import { db } from '@/firebase.js';
import { doc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { adminService } from '@/services/adminService';

/**
 * Composable for Rates Management Logic.
 * Handles real-time listeners for utility/carbon rates and updates via Admin Service.
 */
export function useRates() {
  // State
  const loadingUtility = ref(false);
  const loadingCarbon = ref(false);
  const currentRates = ref({});
  const lastUpdatedMap = ref({});
  const currentCarbonRate = ref('---');
  const lastUpdatedCarbon = ref(null);

  // Notifications
  const popup = reactive({
    show: false,
    message: "",
    type: "info"
  });

  const showNotification = (message, type = "info") => {
    popup.message = message;
    popup.type = type;
    popup.show = true;
    setTimeout(() => (popup.show = false), 3000);
  };

  // --- Listeners ---
  let unsubUtility = null;
  let unsubCarbon = null;

  const subscribeToProvider = (providerId) => {
    if (unsubUtility) {
        unsubUtility();
        unsubUtility = null;
    }

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const rateRef = doc(db, `artifacts/${appId}/public/data/utility_rates`, providerId);
    
    unsubUtility = onSnapshot(rateRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const val = data.kwhRate || data.vecoKwhRate || 0;
            currentRates.value[providerId] = val;
            lastUpdatedMap.value[providerId] = data.date_updated || data.lastUpdated;
        } else {
            currentRates.value[providerId] = 0;
            lastUpdatedMap.value[providerId] = null;
        }
    }, (error) => console.error("Error listening to utility rate:", error));
  };

  const subscribeToCarbon = () => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const carbonQuery = query(
      collection(db, `artifacts/${appId}/public/data/carbon_emission_rates`),
      orderBy("date_updated", "desc"),
      limit(1)
    );
    
    unsubCarbon = onSnapshot(carbonQuery, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        currentCarbonRate.value = data.carbonRateKg;
        lastUpdatedCarbon.value = data.date_updated;
      }
    }, (error) => console.error("Error listening to carbon rate:", error));
  };

  const cleanupRates = () => {
    if (unsubUtility) unsubUtility();
    if (unsubCarbon) unsubCarbon();
  };

  // --- Actions ---
  const updateUtility = async (form) => {
    if (!form.rate) return;
    loadingUtility.value = true;
    try {
      const response = await adminService.updateUtilityRate(
        form.providerId, 
        // Helper to get name
        (form.providerId === 'veco' ? 'Visayan Electric' : 'CEBECO'), 
        form.rate
      );
      
      if (response.data.success) {
        showNotification(response.data.message, 'success');
        return true; // Success signal
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      showNotification(msg, 'error');
    } finally {
      loadingUtility.value = false;
    }
    return false;
  };

  const updateCarbon = async (rate) => {
    if (!rate) return;
    loadingCarbon.value = true;
    try {
      const response = await adminService.updateCarbonRate(rate);
      if (response.data.success) {
        showNotification(response.data.message, 'success');
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      showNotification(msg, 'error');
    } finally {
      loadingCarbon.value = false;
    }
    return false;
  };

  return {
    // State
    loadingUtility,
    loadingCarbon,
    currentRates,
    lastUpdatedMap,
    currentCarbonRate,
    lastUpdatedCarbon,
    popup,
    
    // Methods
    subscribeToProvider,
    subscribeToCarbon,
    cleanupRates,
    updateUtility,
    updateCarbon
  };
}

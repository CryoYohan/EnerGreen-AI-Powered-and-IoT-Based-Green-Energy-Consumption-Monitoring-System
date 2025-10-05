<template>
  <Transition name="modal">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div class="relative w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center p-4">

        <div class="hidden lg:block lg:w-1/2 lg:flex lg:justify-end lg:items-end pr-8">
          <img :src="currentWizardImage" alt="EnerWizard" class="max-w-xs xl:max-w-sm h-auto object-contain">
        </div>

        <div class="flex flex-col items-center justify-center w-full lg:w-1/2 p-4">

          <div class="block lg:hidden w-full flex flex-row items-end justify-start mb-6">
            <div class="w-32 h-32 mr-4 flex-shrink-0">
              <img :src="currentWizardImage" alt="EnerWizard" class="w-full h-full object-contain">
            </div>

            <Transition name="tip-bubble" mode="out-in">
              <div v-if="currentTip" :key="currentTipIndex"
                class="relative bg-gray-800 dark:bg-gray-700 mb-10 text-white p-4 rounded-2xl shadow-lg max-w-xs"
                style="border-bottom-left-radius: 4px;">
                <p class="text-sm dark:text-gray-100">{{ currentTip.description }}</p>

                <div class="absolute -left-2 bottom-2 w-4 h-4 bg-gray-800 dark:bg-gray-700 transform rotate-45 -z-10"></div>
              </div>
            </Transition>
          </div>

          <Transition name="tip-bubble" mode="out-in">
            <div v-if="currentTip" :key="currentTipIndex"
              class="relative bg-gray-800 dark:bg-gray-700 text-white p-5 rounded-lg shadow-lg mb-8 w-full max-w-md hidden lg:block">
              <p class="text-sm dark:text-gray-100">{{ currentTip.description }}</p>
              <div class="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-800 dark:bg-gray-700 transform rotate-45 -z-10"></div>
            </div>
          </Transition>

          <div class="w-full max-w-md">
            <button
              @click="nextTip"
              class="w-full px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {{ isLastTip ? 'Got It!' : 'Next Tip' }}
            </button>
          </div>
        </div>
      </div>

      <div class="absolute top-4 right-4 flex space-x-2 z-50">
        <button
          @click="refreshTips"
          class="p-2 text-white transition-transform transform rounded-full hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
          title="Refresh Tips"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            :class="{ 'animate-spin-slow': loading }"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v6h6M20 20v-6h-6M20 4l-6 6M4 20l6-6"
            />
          </svg>
        </button>

        <button
          @click="closeModal"
          class="p-2 text-white transition-transform transform rounded-full hover:scale-110"
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, computed, defineExpose } from 'vue';
// 🌟 CRITICAL CHANGE: Added necessary Firestore imports for a standalone component
import { 
  doc, 
  collection, 
  getDocs, 
  setDoc, 
  getDoc,
  query, 
  where,
  Timestamp
  // Added query, orderBy, limit if your fetchAndGenerate logic needed them, 
  // though getDocs is being used here for simplicity.
} from 'firebase/firestore'; 
// 🌟 CRITICAL CHANGE: Use db and auth directly
import { db, auth } from '../../../firebase.js'; 

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export default {
  props: {
    showModal: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close', 'open'],
  setup(props, { emit }) {
    const tips = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentTipIndex = ref(0);

    const wizardImages = [
      '/src/Images/background/EnerWizard.png',
      '/src/Images/background/EnerWizard2.png',
      '/src/Images/background/EnerWizard3.png'
    ];

    const currentTip = computed(() => {
      return tips.value.length > 0 ? tips.value[currentTipIndex.value] : null;
    });

    const isLastTip = computed(() => {
      return currentTipIndex.value === tips.value.length - 1;
    });

    const currentWizardImage = computed(() => {
      const index = Math.min(currentTipIndex.value, wizardImages.length - 1);
      return wizardImages[index];
    });

    const nextTip = () => {
      if (isLastTip.value) {
        closeModal();
      } else {
        currentTipIndex.value++;
      }
    };

    // ✅ Stable generateTip logic
    const generateTip = async (energyData, userProfileRef) => {
      let prompt = `Act as an energy efficiency expert. Generate three concise, practical energy-saving tips based on the user's daily energy data.\n\n`;
      if (energyData.topConsumerName === "No major appliances monitored") {
        prompt += `Note: The system currently has no smart plug data, so the readings represent the total household consumption — including possible phantom or standby loads.\n`;
      } else {
        prompt += `- Top Energy Consumer: ${energyData.topConsumerName} using ${energyData.topConsumerUsage.toFixed(2)} kWh\n`;
      }

      prompt += `- Energy Source Breakdown: ${energyData.solarPercentage.toFixed(0)}% Solar, ${energyData.gridPercentage.toFixed(0)}% Grid\n`;
      prompt += `- Total Energy Consumed Today: ${energyData.totalKwh.toFixed(2)} kWh\n\n`;
      prompt += `Each tip must be an object with a "description" field in valid JSON format (array of objects). Do not include greetings, explanations, or extra commentary.`;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: { type: "OBJECT", properties: { "description": { "type": "STRING" } } }
          }
        }
      };

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);

        const result = await response.json();
        const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (jsonText) {
          const generatedTips = JSON.parse(jsonText);
          tips.value = generatedTips;
          await setDoc(userProfileRef, { tips: generatedTips, tipTimestamp: Date.now() }, { merge: true });
        } else {
          tips.value = [{ description: "Could not generate a tip based on current data." }];
        }
      } catch (e) {
        console.error("Error generating tip:", e);
        error.value = e.message;
        tips.value = [{ description: "An error occurred while generating the tips." }];
      } finally {
        loading.value = false;
        if (tips.value.length > 0) currentTipIndex.value = 0;
      }
    };

    // ✅ Accurate Delta-based energy computation
    const fetchAndGenerate = async (force = false) => {
      loading.value = true;
      error.value = null;

      const userId = auth.currentUser?.uid;
      if (!userId) {
        error.value = "User not logged in.";
        loading.value = false;
        return;
      }

      const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`);

      try {
        const profileSnap = await getDoc(userProfileRef);
        const profileData = profileSnap.data();

        // 🕒 Cached tips check
        if (profileData?.tips && !force) {
          const tipTimestamp = profileData.tipTimestamp || 0;
          const now = Date.now();
          const oneDay = 24 * 60 * 60 * 1000;
          if (now - tipTimestamp < oneDay) {
            tips.value = profileData.tips;
            loading.value = false;
            currentTipIndex.value = 0;
            return;
          }
        }

        if (!profileData?.deviceId) {
          tips.value = [{ description: "No device linked to your account. Please monitor your devices to get tips!" }];
          loading.value = false;
          return;
        }

        const deviceId = profileData.deviceId;

        // 🔍 Appliance data
        const consumersRef = collection(db, `devices/${deviceId}/appliances`);
        const readingsRef = collection(db, `devices/${deviceId}/realtime_readings`);

        let topConsumerName = "No major appliances monitored";
        let topConsumerUsage = 0;

        const querySnapshot = await getDocs(consumersRef);
        if (!querySnapshot.empty) {
          let topAppliance = null;
          querySnapshot.forEach(doc => {
            const data = doc.data();
            if (topAppliance === null || (data.kwhConsumed || 0) > topAppliance.kwhConsumed) {
              topAppliance = { name: data.name, kwhConsumed: data.kwhConsumed || 0 };
            }
          });
          if (topAppliance) {
            topConsumerName = topAppliance.name;
            topConsumerUsage = topAppliance.kwhConsumed;
          }
        }

        // 🕒 Define today's range
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        // 🔎 Get only today's readings
        const readingsQuery = query(
          readingsRef,
          where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
          where('timestamp', '<', Timestamp.fromDate(endOfDay))
        );
        const readingsSnapshot = await getDocs(readingsQuery);

        if (readingsSnapshot.empty) {
          tips.value = [{ description: "No energy readings found for today. Try again later." }];
          loading.value = false;
          return;
        }

        // ⚙️ Collect and sort readings chronologically
        const readings = [];
        readingsSnapshot.forEach(doc => readings.push(doc.data()));
        readings.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);

        // ⚡ Compute deltas (accurate daily kWh)
        let lastGrid = null, lastSolar = null;
        let gridKwh = 0, solarKwh = 0;

        for (const data of readings) {
          const { energySource, kwhConsumed } = data;

          if (energySource === "Grid") {
            if (lastGrid !== null && kwhConsumed > lastGrid) {
              gridKwh += kwhConsumed - lastGrid;
            }
            lastGrid = kwhConsumed;
          } else if (energySource === "Solar") {
            if (lastSolar !== null && kwhConsumed > lastSolar) {
              solarKwh += kwhConsumed - lastSolar;
            }
            lastSolar = kwhConsumed;
          }
        }

        // 🧮 Compute totals and percentages
        const totalKwh = gridKwh + solarKwh;
        const safeTotalKwh = Math.min(totalKwh, 100); // prevent runaway sums
        const solarPercentage = safeTotalKwh > 0 ? (solarKwh / safeTotalKwh) * 100 : 0;
        const gridPercentage = safeTotalKwh > 0 ? (gridKwh / safeTotalKwh) * 100 : 0;

        console.log(
          `Δ Grid: ${gridKwh.toFixed(3)} kWh | Δ Solar: ${solarKwh.toFixed(3)} kWh | Total: ${safeTotalKwh.toFixed(3)} kWh`
        );

        const energyData = {
          topConsumerName,
          topConsumerUsage,
          solarPercentage,
          gridPercentage,
          totalKwh: safeTotalKwh
        };

        await generateTip(energyData, userProfileRef);
      } catch (err) {
        console.error("Error fetching or generating tip:", err);
        error.value = err.message;
        loading.value = false;
        tips.value = [{ description: "An error occurred while fetching data or generating tips. Please try again later." }];
        currentTipIndex.value = 0;
      }
    };


    const closeModal = () => emit('close');
    
    // 🌟 CRITICAL CHANGE: Automatically call fetchAndGenerate when modal opens
    const openModal = async () => { 
        emit('open'); 
        // 🌟 Ensure a user is logged in before fetching data
        if (auth.currentUser) {
            await fetchAndGenerate(); 
        } else {
            // Wait for auth to resolve before fetching
            const unsubscribe = auth.onAuthStateChanged(user => {
                unsubscribe(); // Stop listening after the first event
                if (user) {
                    fetchAndGenerate();
                } else {
                    tips.value = [{ description: "Please log in to receive personalized energy-saving tips." }];
                    loading.value = false;
                }
            });
        }
    };

    const refreshTips = () => {
      if (!loading.value) fetchAndGenerate(true);
    };

    defineExpose({ openModal });

    return {
      tips,
      loading,
      error,
      closeModal,
      currentTipIndex,
      currentTip,
      isLastTip,
      nextTip,
      fetchAndGenerate,
      refreshTips,
      currentWizardImage
    };
  },
};
</script>

<style scoped>
/* 🔹 Slow spin animation for wizardly effect */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 1.5s linear infinite;
}

/* Modal and Tip Bubble Transitions (Preserved) */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.tip-bubble-enter-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.tip-bubble-leave-active {
  transition: all 0.3s cubic-bezier(0.6, -0.28, 0.74, 0.05);
}

.tip-bubble-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.tip-bubble-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}
</style>
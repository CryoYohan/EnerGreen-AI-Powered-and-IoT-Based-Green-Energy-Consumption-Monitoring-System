<template>
  <Transition name="modal">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div class="relative w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center p-4">

        <!-- Desktop wizard (unchanged) -->
        <div class="hidden lg:block lg:w-1/2 lg:flex lg:justify-end lg:items-end pr-8">
          <img :src="currentWizardImage" alt="EnerWizard" class="max-w-xs xl:max-w-sm h-auto object-contain">
        </div>

        <div class="flex flex-col items-center justify-center w-full lg:w-1/2 p-4">

          <!-- Mobile layout with wizard on left and bubble above -->
          <div class="block lg:hidden w-full flex flex-row items-end justify-start mb-6">
            <!-- Wizard image on left for mobile -->
            <div class="w-32 h-32 mr-4 flex-shrink-0">
              <img :src="currentWizardImage" alt="EnerWizard" class="w-full h-full object-contain">
            </div>
            
            <!-- Conversation bubble -->
            <Transition name="tip-bubble" mode="out-in">
              <div v-if="currentTip" :key="currentTipIndex"
                   class="relative bg-gray-800 dark:bg-gray-700 mb-10 text-white p-4 rounded-2xl shadow-lg max-w-xs"
                   style="border-bottom-left-radius: 4px;">
                <p class="text-sm dark:text-gray-100">{{ currentTip.description }}</p>
                
                <!-- Bubble tail pointing to wizard -->
                <div class="absolute -left-2 bottom-2 w-4 h-4 bg-gray-800 dark:bg-gray-700 transform rotate-45 -z-10"></div>
              </div>
            </Transition>
          </div>

          <!-- Desktop tip (unchanged) -->
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

      <button
        @click="closeModal"
        class="absolute top-4 right-4 p-2 text-white transition-transform transform rounded-full hover:scale-110 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script>
import { ref, computed, defineExpose } from 'vue';
import { doc, collection, getDocs, setDoc, getDoc } from 'firebase/firestore';
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

    // 🔹 New: Array of wizard image paths
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

    // 🔹 New: Computed property to get the current wizard image
    const currentWizardImage = computed(() => {
      // Use Math.min to prevent an out-of-bounds error if there are more tips than images
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

    const generateTip = async (energyData, userProfileRef) => {
      let prompt = `Act as an energy efficiency expert. Provide a list of three concise, short tips to a homeowner to help them save energy. The tips must be personalized based on the following data:\n\n`;
      prompt += `- Top Energy Consumer: ${energyData.topConsumerName} using ${energyData.topConsumerUsage.toFixed(2)} kWh\n`;
      prompt += `- Energy Source Breakdown: ${energyData.solarPercentage.toFixed(0)}% Solar, ${energyData.gridPercentage.toFixed(0)}% Grid\n`;
      prompt += `- Total Energy Consumed Today: ${energyData.totalKwh.toFixed(2)} kWh\n\n`;
      prompt += `Do not use any greetings or sign-offs. Provide the tips in a JSON array format with a 'description' property for each tip.`;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "description": { "type": "STRING" }
              },
              "propertyOrdering": ["description"]
            }
          }
        }
      };

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();
        const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const generatedTips = JSON.parse(jsonText);
          tips.value = generatedTips;

          await setDoc(userProfileRef, {
            tips: generatedTips,
            tipTimestamp: Date.now()
          }, { merge: true });
        } else {
          tips.value = [{ description: "Could not generate a tip based on current data." }];
        }
      } catch (e) {
        console.error("Error generating tip:", e);
        error.value = e.message;
        tips.value = [{ description: "An error occurred while generating the tips." }];
      } finally {
        loading.value = false;
        if (tips.value.length > 0) {
          currentTipIndex.value = 0; // Reset to first tip
        }
      }
    };

    const fetchAndGenerate = async () => {
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

        const oneDayInMs = 24 * 60 * 60 * 1000;
        if (
          profileData &&
          profileData.tips &&
          profileData.tipTimestamp &&
          Date.now() - profileData.tipTimestamp < oneDayInMs
        ) {
          tips.value = profileData.tips;
          loading.value = false;
          currentTipIndex.value = 0;
          return;
        }

        const devicesRef = collection(db, `artifacts/${appId}/users/${userId}/devices`);
        const devicesSnap = await getDocs(devicesRef);

        if (devicesSnap.empty) {
          tips.value = [{ description: "No devices found for this user." }];
          loading.value = false;
          return;
        }

        const firstDeviceId = devicesSnap.docs[0].id;

        const consumersRef = collection(db, `artifacts/${appId}/users/${userId}/devices/${firstDeviceId}/appliances`);
        const querySnapshot = await getDocs(consumersRef);

        let topConsumerName = "No major appliances monitored";
        let topConsumerUsage = 0;
        if (!querySnapshot.empty) {
          let topAppliance = null;
          querySnapshot.forEach(doc => {
            const data = doc.data();
            if (topAppliance === null || data.kwhConsumed > topAppliance.kwhConsumed) {
              topAppliance = { name: data.name, kwhConsumed: data.kwhConsumed };
            }
          });
          if (topAppliance) {
            topConsumerName = topAppliance.name;
            topConsumerUsage = topAppliance.kwhConsumed;
          }
        }

        const readingsRef = collection(db, `artifacts/${appId}/users/${userId}/devices/${firstDeviceId}/realtime_readings`);
        const readingsSnapshot = await getDocs(readingsRef);

        let gridKwh = 0;
        let solarKwh = 0;
        readingsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.energySource === "Grid") {
            gridKwh += data.kwhConsumed || 0;
          } else if (data.energySource === "Solar") {
            solarKwh += data.kwhConsumed || 0;
          }
        });

        const totalKwh = gridKwh + solarKwh;
        const solarPercentage = totalKwh > 0 ? (solarKwh / totalKwh) * 100 : 0;
        const gridPercentage = totalKwh > 0 ? (gridKwh / totalKwh) * 100 : 0;

        const energyData = {
          topConsumerName,
          topConsumerUsage,
          solarPercentage,
          gridPercentage,
          totalKwh,
        };

        await generateTip(energyData, userProfileRef);
      } catch (err) {
        console.error("Error fetching or generating tip:", err);
        error.value = err.message;
        loading.value = false;
        tips.value = [
          { description: "An error occurred while fetching data or generating tips. Please try again later." },
        ];
        currentTipIndex.value = 0;
      }
    };

    const closeModal = () => {
      emit('close');
    };

    const openModal = async () => {
      emit('open');
      await fetchAndGenerate();
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
      currentWizardImage // 🔹 New: Expose the computed property to the template
    };
  },
};
</script>

<style scoped>
.font-poppins {
  font-family: 'Poppins', sans-serif;
}
.rounded-md {
  border-radius: 0.375rem;
}
.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Modal Transition Styles (for the whole modal overlay) */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Tip Bubble Transition Styles */
.tip-bubble-enter-active,
.tip-bubble-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.tip-bubble-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.tip-bubble-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
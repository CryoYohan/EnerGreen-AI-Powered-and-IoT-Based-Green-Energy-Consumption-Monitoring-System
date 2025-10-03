<template>
  <Transition name="modal">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div class="relative w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center p-4">

        <!-- Desktop wizard (unchanged) -->
        <div class="hidden lg:block lg:w-1/2 lg:flex lg:justify-end lg:items-end pr-8">
            <div class="wizard-wrapper">
            <!-- falling energy symbols -->
            <div id="energy"></div>

            <!-- wizard -->
            <img 
              :src="currentWizardImage" 
              alt="EnerWizard" 
              class="wizard-image wizard-animate"
            />

            <!-- confetti burst -->
            <div class="confetti">
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center w-full lg:w-1/2 p-4">

          <!-- Mobile layout with wizard on left and bubble above -->
          <div class="block lg:hidden w-full flex flex-row items-end justify-start mb-6">
            <!-- Wizard image on left for mobile -->
            <div class="w-32 h-32 mr-4 flex-shrink-0">
              
              <!-- Wizard Image with Animation -->
              <img 
                :src="currentWizardImage" 
                alt="EnerWizard" 
                class="max-w-full h-auto object-contain wizard-animate"
              />

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

      <!-- 🔹 Top-right controls (Refresh + Close) -->
      <div class="absolute top-4 right-4 flex space-x-2 z-50">
        <!-- Refresh Button -->
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

        <!-- Close Button -->
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
      let prompt = `Act as an energy efficiency expert. Provide a list of three concise, short energy-saving tips. 
The tips must be personalized based on the following data:\n\n`;
      prompt += `- Top Energy Consumer: ${energyData.topConsumerName} using ${energyData.topConsumerUsage.toFixed(2)} kWh\n`;
      prompt += `- Energy Source Breakdown: ${energyData.solarPercentage.toFixed(0)}% Solar, ${energyData.gridPercentage.toFixed(0)}% Grid\n`;
      prompt += `- Total Energy Consumed Today: ${energyData.totalKwh.toFixed(2)} kWh\n\n`;
      prompt += `Each tip must be an object with a "description" field in JSON format. Do not include greetings or extra commentary.`;

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

    // ✅ Stable fetchAndGenerate logic (uses userProfile.deviceId, daily caching)
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

        // check if cached tips are still valid
        const oneDayInMs = 24 * 60 * 60 * 1000;
        if (!force && profileData?.tips && profileData?.tipTimestamp && Date.now() - profileData.tipTimestamp < oneDayInMs) {
          tips.value = profileData.tips;
          loading.value = false;
          currentTipIndex.value = 0;
          return;
        }

        if (!profileData?.deviceId) {
          tips.value = [{ description: "No device linked to your account. Please monitor your devices to get tips!" }];
          loading.value = false;
          return;
        }

        const deviceId = profileData.deviceId;

        // Fetch appliances
        const consumersRef = collection(db, `artifacts/${appId}/users/${userId}/devices/${deviceId}/appliances`);
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

        // Fetch realtime readings
        const readingsRef = collection(db, `artifacts/${appId}/users/${userId}/devices/${deviceId}/realtime_readings`);
        const readingsSnapshot = await getDocs(readingsRef);

        let gridKwh = 0, solarKwh = 0;
        readingsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.energySource === "Grid") gridKwh += data.kwhConsumed || 0;
          else if (data.energySource === "Solar") solarKwh += data.kwhConsumed || 0;
        });

        const totalKwh = gridKwh + solarKwh;
        const solarPercentage = totalKwh > 0 ? (solarKwh / totalKwh) * 100 : 0;
        const gridPercentage = totalKwh > 0 ? (gridKwh / totalKwh) * 100 : 0;

        const energyData = { topConsumerName, topConsumerUsage, solarPercentage, gridPercentage, totalKwh };
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
    const openModal = async () => { emit('open'); await fetchAndGenerate(); };

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
@keyframes wizardSequence {
 0% {
    transform: translateY(100px); /* start below */
    opacity: 0;
  }
  20% {
    transform: translateY(-20px); /* overshoot up */
    opacity: 1;
  }
  40% {
    transform: translateY(10px); /* bounce down */
  }
  60% {
    transform: translateY(-10px); /* small bounce up */
  }
  80% {
    transform: translateY(5px); /* settle */
  }
  100% {
    transform: translateY(0); /* final position */
  }
}

.wizard-animate {
    animation: wizardSequence 1s ease-out forwards;
}

.wizard-wrapper {
  position: relative;
  display: inline-block;
}

/* Wizard image should be above confetti */
.wizard-image {
  position: relative;
  z-index: 10;
}

/* Confetti container */
.confetti {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  z-index: 1;
  pointer-events: none;
}

/* Generate confetti pieces */
.confetti::before,
.confetti::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 12px;
  background: red;
  top: 0;
  left: 0;
  opacity: 0;
  animation: confetti-fall 1.2s ease-out forwards;
}

/* Duplicate using nth-child-like trick */
.confetti::after {
  background: yellow;
  transform: rotate(30deg);
}

/* Keyframes for confetti fall/explosion */
@keyframes confetti-fall {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(0.8);
    opacity: 1;
  }
  30% {
    transform: translate(-50px, -80px) rotate(-60deg) scale(1);
  }
  60% {
    transform: translate(40px, -120px) rotate(120deg) scale(1.1);
  }
  100% {
    transform: translate(0, -200px) rotate(180deg) scale(0.9);
    opacity: 0;
  }
}

.wizard-wrapper {
  position: relative;
  display: inline-block;
}

.wizard-image {
  position: relative;
  z-index: 10;
}

.confetti {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  z-index: 1;
  pointer-events: none;
}

.confetti span {
  position: absolute;
  width: 12px;   /* bigger */
  height: 20px;  /* bigger */
  background: hsl(var(--hue), 80%, 55%);
  top: 0;
  left: 0;
  opacity: 0;
  animation: confetti-explode 1.8s ease-out forwards;
}
.confetti span {
  position: absolute;
  width: 18px;   /* bigger pieces */
  height: 30px;  /* taller */
  background: hsl(var(--hue), 80%, 55%);
  top: 0;
  left: 0;
  opacity: 0;
  animation: confetti-explode 2s ease-out forwards;
}

/* Give each span a direction + color */
.confetti span:nth-child(1) { --hue: 0;   animation-delay: 0s;   --tx: -200px; --ty: -250px; }
.confetti span:nth-child(2) { --hue: 40;  animation-delay: 0.05s; --tx: 180px;  --ty: -220px; }
.confetti span:nth-child(3) { --hue: 100; animation-delay: 0.1s;  --tx: -150px; --ty: -280px; }
.confetti span:nth-child(4) { --hue: 180; animation-delay: 0.15s; --tx: 200px;  --ty: -300px; }
.confetti span:nth-child(5) { --hue: 220; animation-delay: 0.2s;  --tx: -250px; --ty: -200px; }
.confetti span:nth-child(6) { --hue: 260; animation-delay: 0.25s; --tx: 220px;  --ty: -250px; }
.confetti span:nth-child(7) { --hue: 300; animation-delay: 0.3s;  --tx: -300px; --ty: -220px; }
.confetti span:nth-child(8) { --hue: 20;  animation-delay: 0.35s; --tx: 260px;  --ty: -180px; }
.confetti span:nth-child(9) { --hue: 140; animation-delay: 0.4s;  --tx: -280px; --ty: -260px; }
.confetti span:nth-child(10){ --hue: 280; animation-delay: 0.45s; --tx: 240px;  --ty: -300px; }

@keyframes confetti-explode {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 1;
  }
  60% {
    transform: translate(var(--tx), var(--ty)) rotate(240deg) scale(1.3);
    opacity: 1;
  }
  100% {
    transform: translate(calc(var(--tx) * 1.2), calc(var(--ty) * 1.2)) rotate(360deg) scale(1);
    opacity: 0;
  }
}
/* energy symbols */
.energy {
  position: absolute;
  font-size: 28px;
  z-index: 1; /* behind wizard */
  animation: fall 4s linear forwards, sway 2s ease-in-out infinite alternate;
}

@keyframes fall {
  0% { transform: translateY(-50px) scale(1); opacity: 1; }
  100% { transform: translateY(100vh) scale(0.6); opacity: 0; }
}

@keyframes sway {
  0% { transform: translateX(0) rotate(0deg); }
  100% { transform: translateX(40px) rotate(20deg); }
}
</style>
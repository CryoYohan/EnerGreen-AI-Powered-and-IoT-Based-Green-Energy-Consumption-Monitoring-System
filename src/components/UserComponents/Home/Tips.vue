<template>
  <div class="container max-w-full p-4 mx-auto lg:pr-12 lg:pl-12 font-poppins">
    <div class="w-full p-6 bg-white rounded-md shadow dark:bg-gray-800 dark:shadow-gray-700">
      <h2 class="mb-4 text-xl font-bold text-gray-800 dark:text-gray-100">
        Energy Saving Tip
      </h2>
      <div v-if="loading" class="flex flex-col items-center justify-center p-8 text-center">
        <svg
          class="w-8 h-8 text-gray-400 animate-spin dark:text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="mt-4 text-gray-500 dark:text-gray-400">Generating personalized tip...</p>
      </div>
      <div v-else-if="error" class="p-8 text-center text-red-500 dark:text-red-400">
        <p>Error generating tips. Please try again later.</p>
        <p class="text-xs text-red-400">{{ error }}</p>
      </div>
      <div v-else class="flex flex-col gap-4 ">
        <div v-for="(tip, index) in tips" :key="index" class="flex items-start gap-4 p-4 bg-[#F9FAFB] dark:bg-gray-900 rounded-lg">
          <div>
            <svg class="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343 5.343l-.707.707m-4.243-4.243l.707-.707M12 21v-1m-6.364-1.636l.707-.707M3 12h1m1.636-6.364l.707.707"
              />
            </svg>
          </div>
          <div>
          <p class="text-sm text-gray-700 dark:text-gray-300">
              {{ tip.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, doc, collection, query, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase.js';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export default {
  setup() {
    const tips = ref([]);
    const loading = ref(true);
    const error = ref(null);

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
      }
    };

    const fetchAndGenerate = async (userId, deviceId) => {
      loading.value = true;
      error.value = null;
      const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`);
      
      try {
        const profileSnap = await getDoc(userProfileRef);
        const profileData = profileSnap.data();

        const oneDayInMs = 24 * 60 * 60 * 1000;
        if (profileData && profileData.tips && profileData.tipTimestamp && (Date.now() - profileData.tipTimestamp < oneDayInMs)) {
            tips.value = profileData.tips;
            loading.value = false;
            return;
        }

        const consumersRef = collection(db, `artifacts/${appId}/users/${userId}/devices/${deviceId}/appliances`);
        const querySnapshot = await getDocs(consumersRef);
        
        let topConsumerName = 'No major appliances monitored';
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

        const readingsRef = collection(db, `artifacts/${appId}/users/${userId}/devices/${deviceId}/realtime_readings`);
        const readingsSnapshot = await getDocs(readingsRef);
        
        let gridKwh = 0;
        let solarKwh = 0;
        readingsSnapshot.forEach((doc) => {
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
          totalKwh
        };
        await generateTip(energyData, userProfileRef);

      } catch (err) {
        console.error("Error fetching or generating tip:", err);
        error.value = err.message;
        loading.value = false;
      }
    };

    onMounted(() => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile/profile`);
          const profileSnap = await getDoc(userProfileRef);
          if (profileSnap.exists() && profileSnap.data().deviceId) {
            await fetchAndGenerate(user.uid, profileSnap.data().deviceId);
          } else {
            tips.value = [{ description: "Monitor your devices to get personalized energy-saving tips!" }];
            loading.value = false;
          }
        } else {
          tips.value = [{ description: "Sign in to get personalized energy-saving tips!" }];
          loading.value = false;
        }
      });
    });

    return {
      tips,
      loading,
      error,
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
</style>
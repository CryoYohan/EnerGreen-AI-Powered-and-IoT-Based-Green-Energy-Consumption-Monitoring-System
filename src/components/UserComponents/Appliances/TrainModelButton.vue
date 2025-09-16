<template>
  <div class="flex flex-col items-center gap-2">
    <p class="text-sm text-gray-600 dark:text-gray-300 font-semibold text-center">
      {{ modelName }}
      <span v-if="modelVersion" class="text-xs font-normal text-gray-500 block">
        (Model version: {{ modelVersion }})
      </span>
    </p>

    <button
      @click="trainModel"
      :disabled="isTraining || !deviceId"
      class="px-4 py-2 rounded-full text-white text-sm transition-colors
             bg-[#059669] hover:bg-[#048858] disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {{ isTraining ? "Training..." : "Train Model" }}
    </button>

    <div v-if="isTraining" class="mt-4 w-full flex flex-col items-center">
      <img src="/src/Images/gif/ai_brain.gif" alt="AI Training" class="w-24 h-24 mb-2" />
      <p class="text-center text-gray-500 text-sm max-w-xs">
        "{{ currentQuote }}"
      </p>
    </div>
    
    <div v-if="errorMessage" class="mt-2 p-2 text-sm text-red-700 bg-red-100 rounded">
      {{ errorMessage }}
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";
import {
  auth,
  db,
  doc,
  onAuthStateChanged,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
} from "../../../firebase.js";

// States
const isTraining = ref(false);
const modelName = ref("No model yet");
const modelVersion = ref(null);
const currentQuote = ref("");
const deviceId = ref(null);
const errorMessage = ref("");

// Firestore Subscription
let unsubscribeFromModels = null;
let quoteInterval = null;
let quoteIndex = 0;

// Cloud Run URL from environment variable
const TRAINING_API_URL = import.meta.env.VITE_TRAINING_API_URL;

// Quotes
const quotes = [
  "Analyzing patterns… 🔍",
  "Teaching your AI new tricks 🤖",
  "Crunching numbers… 💻",
  "Learning from your appliances ⚡",
  "Modeling energy usage like a pro 🌱"
];

// In your <script setup> block, replace the old function with this one

const subscribeToLatestModel = (id) => {
  if (unsubscribeFromModels) {
    unsubscribeFromModels();
  }

  if (!id) {
    modelName.value = "No model yet";
    modelVersion.value = null;
    return;
  }

  const modelsRef = collection(db, `devices/${id}/models`);
  const q = query(modelsRef, orderBy("created_at", "desc"), limit(1));

  unsubscribeFromModels = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      modelName.value = "No model yet";
      modelVersion.value = null;
    } else {
      const latestModel = snapshot.docs[0].data();
      
      if (latestModel.created_at) {
        const date = new Date(latestModel.created_at.toDate());
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear() % 100;
        
        modelName.value = "Your Appliance Assistant is Up-to-Date.";
        modelVersion.value = `NILM-${month}-${day}-${year}`;
      } else {
        modelName.value = "Error: Missing model data";
        modelVersion.value = null;
      }
    }
  }, (error) => {
    console.error("Error subscribing to latest model:", error);
    modelName.value = "Error fetching model";
  });
};

const fetchDeviceId = (userId) => {
  const userProfileRef = doc(db, `artifacts/default-app-id/users/${userId}/userProfile/profile`);
  onSnapshot(userProfileRef, (snap) => {
    if (snap.exists()) {
      const profile = snap.data();
      deviceId.value = profile.deviceId || null;
      subscribeToLatestModel(deviceId.value);
    } else {
      deviceId.value = null;
      subscribeToLatestModel(null);
    }
  });
};

const startQuoteAnimation = () => {
  quoteIndex = 0;
  currentQuote.value = quotes[quoteIndex];
  quoteInterval = setInterval(() => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    currentQuote.value = quotes[quoteIndex];
  }, 3000);
};

const stopQuoteAnimation = () => {
  if (quoteInterval) {
    clearInterval(quoteInterval);
    quoteInterval = null;
  }
};

const trainModel = async () => {
  if (isTraining.value) return;

  isTraining.value = true;
  errorMessage.value = "";
  startQuoteAnimation();
  
  try {
    const response = await axios.post(`${TRAINING_API_URL}/train-model`, {
      device_id: deviceId.value,
      user_id: auth.currentUser?.uid || null,
    });

    if (response.data.status === "success") {
      modelName.value = response.data.model_name;
      modelVersion.value = response.data.model_version;
      currentQuote.value = "Training complete! Model is updated.";
    } else {
      errorMessage.value = response.data.message || "Model training failed due to an unknown error.";
      currentQuote.value = `Training failed.`;
    }
  } catch (error) {
    console.error("Error during model training:", error);
    errorMessage.value = "Failed to train model. Please check your network and try again later.";
    currentQuote.value = "Failed to train model. Please try again later.";
  } finally {
    isTraining.value = false;
    stopQuoteAnimation();
  }
};

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchDeviceId(user.uid);
    } else {
      deviceId.value = null;
      subscribeToLatestModel(null);
    }
  });
});

onUnmounted(() => {
  stopQuoteAnimation();
  if (unsubscribeFromModels) {
    unsubscribeFromModels();
  }
});
</script>

<style scoped>
img {
  animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
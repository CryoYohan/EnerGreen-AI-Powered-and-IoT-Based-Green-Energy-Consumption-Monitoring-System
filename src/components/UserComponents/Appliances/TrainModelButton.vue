<template>
  <div class="flex flex-col items-center gap-2">
    <!-- Display current model -->
    <p class="text-sm text-gray-600 dark:text-gray-300">
      Current Model: <span class="font-semibold">{{ modelName }}</span>
    </p>

    <!-- Train Model Button -->
    <button
      @click="trainModel"
      :disabled="isTraining"
      class="px-4 py-2 rounded-full text-white text-sm transition-colors
             bg-[#059669] hover:bg-[#048858] disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {{ isTraining ? "Training..." : "Train Model" }}
    </button>

    <!-- Creative Loading Animation -->
    <div v-if="isTraining" class="mt-4 w-full flex flex-col items-center">
      <img src="/src/Images/ai_brain.gif" alt="AI Training" class="w-24 h-24 mb-2" />
      <p class="text-center text-gray-500 text-sm max-w-xs">
        "{{ currentQuote }}"
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const isTraining = ref(false);
const modelName = ref("No model yet");
const currentQuote = ref("");

const quotes = [
  "Analyzing patterns… 🔍",
  "Teaching your AI new tricks 🤖",
  "Crunching numbers… 💻",
  "Learning from your appliances ⚡",
  "Modeling energy usage like a pro 🌱"
];

const trainModel = async () => {
  isTraining.value = true;

  // Rotate quotes while training
  let quoteIndex = 0;
  const quoteInterval = setInterval(() => {
    currentQuote.value = quotes[quoteIndex % quotes.length];
    quoteIndex++;
  }, 2000);

  try {
    // Call your Cloud Run endpoint
    const response = await axios.post(
      "https://YOUR_CLOUD_RUN_URL/train-model"
    );

    if (response.data.status === "success") {
      modelName.value = `Appliance Model (${new Date().toLocaleDateString()})`;
    } else {
      alert("Training failed: " + response.data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Error connecting to training server");
  } finally {
    isTraining.value = false;
    clearInterval(quoteInterval);
    currentQuote.value = "";
  }
};
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

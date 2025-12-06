<template>
  <div class="fixed bottom-6 right-6 z-50 font-poppins">

    <!-- 🟢 VOICE MODE OVERLAY -->
    <transition name="fade">
      <div v-if="isVoiceMode"
        class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-500 p-6">
        
        <!-- A. Premium User View: The Voice Assistant -->
        <template v-if="isPremium">
          <div class="w-full flex justify-between items-center h-12 absolute top-6 px-6">
            <div v-if="isProcessing" class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Christine is thinking</span>
              <div class="flex gap-1">
                <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
            <div v-else class="flex flex-col">
              <span class="text-sm font-bold text-gray-800 dark:text-white">Christine</span>
              <span class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Energy Assistant</span>
            </div>
          </div>

          <div class="relative flex-1 flex items-center justify-center w-full cursor-pointer" @click="toggleRecording">
            <div
              class="blob relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center transition-all duration-500"
              :class="{'scale-110': isRecording, 'opacity-90': !isRecording, 'animate-blob-pulse': isPlaying}">
              <div class="pulse-ring" :class="{ 'recording': isRecording }"></div>
              <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 orb-layer"></div>
              <div class="absolute inset-0 rounded-full bg-gradient-to-bl from-green-300 to-emerald-500 orb-layer animation-delay-2000"></div>
              <div class="absolute inset-0 rounded-full bg-gradient-to-r from-teal-200 to-green-400 orb-layer animation-delay-4000"></div>
            </div>
            <div class="absolute mt-80 md:mt-96 text-center pointer-events-none transition-opacity duration-300"
              :class="{ 'opacity-50': isProcessing }">
              <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mb-1">{{ voiceStatus }}</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ voiceSubStatus }}</p>
            </div>
          </div>

          <div class="w-full flex justify-between items-center absolute bottom-6 px-6 md:px-12">
            <button @click.stop="toggleRecording" :disabled="isProcessing"
              class="p-5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none" :class="[
                isRecording
                  ? 'bg-white dark:bg-gray-800 ring-4 ring-red-50 text-red-500 scale-110'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
              ]">
              <div v-if="isRecording" class="w-6 h-6 bg-red-500 rounded-sm"></div>
              <MicrophoneIcon v-else class="w-7 h-7" />
            </button>
            <button @click="toggleVoiceMode"
              class="p-5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white shadow-sm">
              <XMarkIcon class="w-7 h-7" />
            </button>
          </div>
        </template>
        
        <!-- B. Free User View: The Upgrade Prompt -->
        <div v-else class="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
            <div class="mb-6">
                <svg class="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M19 3v4" />
                </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                AI Assistant is a Premium Feature
            </h1>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
                Unlock our AI-powered energy assistant, Christine, to get voice-based insights, summaries, and personalized tips by upgrading your plan.
            </p>
            <div class="flex flex-col space-y-4">
                <router-link
                to="/profile"
                class="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105"
                >
                Upgrade in Profile
                </router-link>
                <button
                @click="toggleVoiceMode"
                class="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
                >
                Maybe Later
                </button>
            </div>
        </div>

      </div>
    </transition>

    <!-- Floating Entry Button (AI Chatbot Icon) -->
    <button v-if="!isVoiceMode" @click="toggleVoiceMode"
      class="group relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-2 border-white dark:border-gray-800 z-50"
      title="Talk to Christine">
      <!-- Main Chat Icon -->
      <ChatBubbleLeftRightIcon class="w-8 h-8" />

      <!-- AI Sparkle Accent -->
      <SparklesIcon class="w-4 h-4 absolute top-3 right-3 text-yellow-200 animate-pulse" />

      <!-- Notification Ping (Optional) -->
      <span class="absolute top-0 right-0 flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import { useAuth } from '@/composables/useAuth';
import {
  XMarkIcon,
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from '@heroicons/vue/24/solid';

// --- Composables ---
const route = useRoute();
const { isPremium } = useAuth('default-app-id');

// --- State ---
const isVoiceMode = ref(false);
const isRecording = ref(false);
const isProcessing = ref(false);
const isPlaying = ref(false);

// --- Watcher for Route Changes ---
// Close the modal automatically if the user navigates away
watch(() => route.path, () => {
  if (isVoiceMode.value) {
    isVoiceMode.value = false;
  }
});


// Audio Recorder
let mediaRecorder = null;
let audioChunks = [];

// Voice State Feedback
const voiceStatus = computed(() => {
  if (isRecording.value) return "Listening...";
  if (isProcessing.value) return "Processing...";
  if (isPlaying.value) return "Speaking...";
  return "Hi, I'm Christine";
});

const voiceSubStatus = computed(() => {
  if (isRecording.value) return "Tap blob to stop";
  if (isProcessing.value) return "Analyzing...";
  if (isPlaying.value) return "Tap to interrupt";
  return "Tap blob to speak";
});

// --- Methods ---

const toggleVoiceMode = () => {
  isVoiceMode.value = !isVoiceMode.value;
  if (!isVoiceMode.value) {
    // Cleanup if closed while active
    if (isRecording.value) toggleRecording();
    isProcessing.value = false;
    isPlaying.value = false;
  }
};

const toggleRecording = async () => {
  if (isRecording.value) {
    // STOP RECORDING
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    isRecording.value = false;
  } else {
    // START RECORDING
    if (isProcessing.value || isPlaying.value) return; // Block if busy

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Using webm as per your working version
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        // Cleanup stream
        stream.getTracks().forEach(track => track.stop());

        // Process Audio
        await sendAudioQuery();
      };

      mediaRecorder.start();
      isRecording.value = true;

    } catch (err) {
      console.error("Mic access denied:", err);
      alert("Microphone access is required for Voice Mode.");
      isRecording.value = false;
    }
  }
};

const sendAudioQuery = async () => {
  isProcessing.value = true;
  try {
    // LOGIC FIX: Directly send blob with API wrapper
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

    // Use API service to handle Base URL automatically (Fixes 404)
    const response = await api.post('/api/agent/query', audioBlob, {
      headers: {
        'Content-Type': 'audio/webm',
      },
      responseType: 'blob' // Important: Expect binary audio back
    });

    // Play Response
    const blob = response.data;
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    isProcessing.value = false;
    isPlaying.value = true;

    audio.onended = () => {
      isPlaying.value = false;
    };

    audio.play();

  } catch (e) {
    console.error("Voice Query Error:", e);
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ------------------------------
   FUTURISTIC ORB UPGRADE ✨
   ------------------------------ */

/* Organic Fluid Morph */
@keyframes morphFluid {
  0% {
    border-radius: 58% 42% 65% 35% / 48% 54% 46% 52%;
    transform: translate(0, 0) scale(1);
  }

  25% {
    border-radius: 40% 60% 70% 30% / 50% 40% 60% 50%;
    transform: translate(-8px, 6px) scale(1.05);
  }

  50% {
    border-radius: 70% 30% 40% 60% / 40% 60% 40% 60%;
    transform: translate(6px, -8px) scale(0.97);
  }

  75% {
    border-radius: 45% 55% 35% 65% / 60% 40% 55% 45%;
    transform: translate(4px, 4px) scale(1.03);
  }

  100% {
    border-radius: 58% 42% 65% 35% / 48% 54% 46% 52%;
    transform: translate(0, 0) scale(1);
  }
}

.orb-layer {
  animation: morphFluid 6s infinite cubic-bezier(0.4, 0.1, 0.2, 1);
  filter: blur(40px);
}

/* Hologram light sweep */
@keyframes holoSweep {
  0% {
    opacity: 0;
    transform: translateX(-150%);
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 0;
    transform: translateX(150%);
  }
}

.holo-shimmer::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg,
      transparent 0%,
      rgba(255, 255, 255, 0.6) 50%,
      transparent 100%);
  mix-blend-mode: overlay;
  animation: holoSweep 3s infinite ease-in-out;
}

/* Pulsing outer ring */
@keyframes pulseRing {
  0% {
    transform: scale(1);
    opacity: 0.25;
  }

  70% {
    transform: scale(1.4);
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
}

.pulse-ring {
  position: absolute;
  width: 110%;
  height: 110%;
  border-radius: 50%;
  border: 3px solid rgba(16, 255, 180, 0.4);
  animation: pulseRing 2.8s infinite ease-out;
}

.pulse-ring.recording {
  animation-duration: 1.5s;
  border-color: rgba(255, 60, 60, 0.5);
}

/* Stronger morph when speaking */
.animate-blob-pulse {
  animation: morphFluid 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
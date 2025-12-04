<template>
  <div class="fixed bottom-6 right-6 z-50 font-poppins">

    <!-- 🔥 ADMIN VOICE MODE OVERLAY -->
    <transition name="fade">
      <div v-if="isVoiceMode"
        class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900 text-white transition-all duration-500 p-6">
        
        <!-- Admin User View: The Voice Assistant -->
        <template v-if="isPremium">
          <div class="w-full flex justify-between items-center h-12 absolute top-6 px-6">
            <div v-if="isProcessing" class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-400">Bryl is thinking</span>
              <div class="flex gap-1">
                <div class="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
                <div class="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-75"></div>
                <div class="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
            <div v-else class="flex flex-col">
              <span class="text-sm font-bold text-white">Bryl</span>
              <span class="text-[10px] text-gray-400 uppercase tracking-wider">Admin Assistant</span>
            </div>
          </div>

          <div class="relative flex-1 flex items-center justify-center w-full cursor-pointer" @click="toggleRecording">
            <div
              class="blob relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center transition-all duration-500"
              :class="{'scale-110': isRecording, 'opacity-90': !isRecording, 'animate-blob-pulse': isPlaying}">
              <div class="pulse-ring" :class="{ 'recording': isRecording }"></div>
              
              <!-- Fiery Orb Layers -->
              <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-500 via-red-600 to-orange-700 orb-layer"></div>
              <div class="absolute inset-0 rounded-full bg-gradient-to-bl from-red-500 via-orange-600 to-yellow-500 orb-layer animation-delay-2000"></div>
              <div class="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 orb-layer animation-delay-4000"></div>

              <!-- The "Eye of Sauron" -->
              <div class="absolute w-28 h-full bg-gradient-to-r from-transparent via-black/80 to-transparent filter blur-sm"></div>
              <div class="absolute w-4 h-48 bg-gradient-to-b from-orange-400 via-red-600 to-orange-400 rounded-full shadow-lg shadow-black animate-pulse filter brightness-150"></div>

              <!-- Fiery Embers -->
              <div v-for="i in 15" :key="i" class="ember" :style="emberStyle(i)"></div>
            </div>
            <div class="absolute mt-80 md:mt-96 text-center pointer-events-none transition-opacity duration-300"
              :class="{ 'opacity-50': isProcessing }">
              <h2 class="text-2xl font-semibold text-white mb-1">{{ voiceStatus }}</h2>
              <p class="text-sm text-gray-400">{{ voiceSubStatus }}</p>
            </div>
          </div>

          <div class="w-full flex justify-between items-center absolute bottom-6 px-6 md:px-12">
            <button @click.stop="toggleRecording" :disabled="isProcessing"
              class="p-5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none" :class="[
                isRecording
                  ? 'bg-gray-800 ring-4 ring-red-500/50 text-red-500 scale-110'
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              ]">
              <div v-if="isRecording" class="w-6 h-6 bg-red-500 rounded-sm"></div>
              <MicrophoneIcon v-else class="w-7 h-7" />
            </button>
            <button @click="toggleVoiceMode"
              class="p-5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-white shadow-sm">
              <XMarkIcon class="w-7 h-7" />
            </button>
          </div>
        </template>
        
        <!-- This shouldn't be shown to admins, but keeping the logic just in case -->
        <div v-else class="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg text-center">
            <h1 class="text-3xl font-bold text-white mb-3">
                Admin Agent Unavailable
            </h1>
            <p class="text-gray-300 mb-6">
                This feature may require a premium license.
            </p>
        </div>

      </div>
    </transition>

    <!-- Floating Entry Button (Admin AI Icon) -->
    <button v-if="!isVoiceMode" @click="toggleVoiceMode"
      class="group relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 text-white border-2 border-gray-800 z-50"
      title="Talk to Bryl">
      <ShieldCheckIcon class="w-8 h-8" />
      <SparklesIcon class="w-4 h-4 absolute top-3 right-3 text-yellow-200 animate-pulse" />
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
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/vue/24/solid';

const route = useRoute();
// Admin agent should always be available for admins, so we assume 'isPremium' is true in this context.
const { isPremium } = useAuth('default-app-id');

// --- State ---
const isVoiceMode = ref(false);
const isRecording = ref(false);
const isProcessing = ref(false);
const isPlaying = ref(false);

// Close modal on route change
watch(() => route.path, () => {
  if (isVoiceMode.value) {
    isVoiceMode.value = false;
  }
});

let mediaRecorder = null;
let audioChunks = [];

const voiceStatus = computed(() => {
  if (isRecording.value) return "Listening...";
  if (isProcessing.value) return "Processing...";
  if (isPlaying.value) return "Speaking...";
  return "Hi, I'm Bryl";
});

const voiceSubStatus = computed(() => {
  if (isRecording.value) return "Tap blob to stop";
  if (isProcessing.value) return "Analyzing...";
  if (isPlaying.value) return "Tap to interrupt";
  return "Tap blob to speak";
});

const emberStyle = (i) => {
  const size = Math.random() * 8 + 4; // 4px to 12px
  const angle = Math.random() * 360;
  const radius = Math.random() * 80 + 150; // 150px to 230px from center
  const x = Math.cos(angle * (Math.PI / 180)) * radius;
  const y = Math.sin(angle * (Math.PI / 180)) * radius;

  return {
    top: `calc(50% + ${y}px)`,
    left: `calc(50% + ${x}px)`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${Math.random() * 3 + 2}s`, // 2s to 5s duration
  };
};

const toggleVoiceMode = () => {
  isVoiceMode.value = !isVoiceMode.value;
  if (!isVoiceMode.value) {
    if (isRecording.value) toggleRecording();
    isProcessing.value = false;
    isPlaying.value = false;
  }
};

const toggleRecording = async () => {
  if (isRecording.value) {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    isRecording.value = false;
  } else {
    if (isProcessing.value || isPlaying.value) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
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
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

    const response = await api.post('/api/admin/agent/query', audioBlob, {
      headers: { 'Content-Type': 'audio/webm' },
      responseType: 'blob'
    });

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
    console.error("Admin Voice Query Error:", e);
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
  border: 3px solid rgba(251, 146, 60, 0.4); /* Orange pulse */
}

.pulse-ring.recording {
  animation-duration: 1.5s;
  border-color: rgba(255, 60, 60, 0.5);
}

.animate-blob-pulse {
  animation: morphFluid 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

/* --- Ember Styles --- */
@keyframes floatUp {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-150px) scale(0);
    opacity: 0;
  }
}

.ember {
  position: absolute;
  background-color: #fca5a5; /* red-300 */
  border-radius: 50%;
  filter: blur(3px);
  animation: floatUp infinite ease-in;
}
</style>
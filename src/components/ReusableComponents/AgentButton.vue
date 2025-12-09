<template>
  <div class="fixed bottom-6 right-6 z-50 font-poppins">

    <!-- 🟢 VOICE MODE OVERLAY -->
    <transition name="fade">
      <div v-if="isVoiceMode"
        class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-500 p-6">
        
        <!-- 📷 LIVE CAMERA OVERLAY -->
        <div v-if="isCameraOpen" class="absolute inset-0 z-[110] bg-black flex flex-col items-center justify-center">
             <video ref="videoRef" autoplay playsinline class="w-full h-full object-cover"></video>
             <canvas ref="canvasRef" class="hidden"></canvas>
             
             <!-- Camera Controls -->
             <div class="absolute bottom-10 flex w-full justify-center items-center gap-12">
                 <!-- Cancel -->
                 <button @click="stopCamera" class="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                     <XMarkIcon class="w-8 h-8" />
                 </button>
                 
                 <!-- Shutter -->
                 <button @click="takeSnapshot" class="p-1 rounded-full border-4 border-white transition-transform active:scale-95">
                     <div class="w-16 h-16 bg-white rounded-full"></div>
                 </button>

                 <!-- Placeholder for symmetry or switch cam (optional) -->
                 <div class="w-16"></div>
             </div>
        </div>


        <!-- A. Premium User View: The Voice Assistant -->
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

        <!-- IMAGE PREVIEW -->
        <div v-if="selectedImage" class="absolute top-24 z-20 flex flex-col items-center animate-fade-in-up">
           <div class="relative group">
              <img :src="`data:${selectedImageMime};base64,${selectedImage}`" class="w-24 h-24 object-cover rounded-xl border-2 border-emerald-400 shadow-lg" />
              <button @click="clearImage" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
                 <XMarkIcon class="w-4 h-4" />
              </button>
           </div>
           <span class="text-xs text-gray-500 mt-2">Image attached</span>
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
          
          <div class="flex gap-4">
              <!-- FILE UPLOAD BUTTON -->
              <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleImageSelect" />
              <button @click="triggerFileInput" :disabled="isProcessing || isRecording"
                class="p-4 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white shadow-sm disabled:opacity-50">
                <PhotoIcon class="w-6 h-6" />
              </button>

              <!-- LIVE CAMERA BUTTON -->
              <button @click="startCamera" :disabled="isProcessing || isRecording"
                class="p-4 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white shadow-sm disabled:opacity-50">
                <CameraIcon class="w-6 h-6" />
              </button>
          </div>

          <!-- MIC BUTTON -->
          <button @click.stop="toggleRecording" :disabled="isProcessing"
            class="p-5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none" :class="[
              isRecording
                ? 'bg-white dark:bg-gray-800 ring-4 ring-red-50 text-red-500 scale-110'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
            ]">
            <div v-if="isRecording" class="w-6 h-6 bg-red-500 rounded-sm"></div>
            <MicrophoneIcon v-else class="w-7 h-7" />
          </button>
          
          <!-- CLOSE BUTTON -->
          <button @click="toggleVoiceMode"
            class="p-5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white shadow-sm">
            <XMarkIcon class="w-7 h-7" />
          </button>
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
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import { useAuth } from '@/composables/useAuth';
import { useAgent } from '@/composables/useAgent';
import {
  XMarkIcon,
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  CameraIcon,
  PhotoIcon
} from '@heroicons/vue/24/solid';

// --- Composables ---
const route = useRoute();
const router = useRouter();
const { isPremium } = useAuth('default-app-id');
const { isAgentOpen, triggerAgent, closeAgent, consumePrompt, pendingPrompt } = useAgent();

// --- State ---
const isVoiceMode = ref(false);
const isRecording = ref(false);
const isProcessing = ref(false);
const isPlaying = ref(false);

const fileInput = ref(null);
const selectedImage = ref(null);
const selectedImageMime = ref(null);

// Camera State
const isCameraOpen = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);
let cameraStream = null;

// --- Sync Global State ---
watch(isAgentOpen, (newVal) => {
    if (newVal !== isVoiceMode.value) {
        if (newVal) {
            // Check premium before opening via trigger
            if (!isPremium.value) {
                closeAgent();
                router.push('/upgrade');
                return;
            }
            isVoiceMode.value = true;
            
            // Check for auto-prompt
            if (pendingPrompt.value) {
                const prompt = consumePrompt();
                sendTextQuery(prompt);
            }
        } else {
            isVoiceMode.value = false;
            stopAll();
        }
    }
});

// --- Watcher for Route Changes ---
// Close the modal automatically if the user navigates away
watch(() => route.path, () => {
  if (isVoiceMode.value) {
    toggleVoiceMode(); // Use toggle to handle cleanup
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
  if (selectedImage.value) return "Image attached";
  return "Hi, I'm Christine";
});

const voiceSubStatus = computed(() => {
  if (isRecording.value) return "Tap blob to stop";
  if (isProcessing.value) return "Analyzing...";
  if (isPlaying.value) return "Tap to interrupt";
  if (selectedImage.value) return "Tap blob to ask about it";
  return "Tap blob to speak";
});

// --- Methods ---

const stopAll = () => {
    if (isRecording.value) {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        isRecording.value = false;
    }
    stopCamera();
    isProcessing.value = false;
    isPlaying.value = false;
    clearImage();
};

const toggleVoiceMode = () => {
  if (!isPremium.value) {
    router.push('/upgrade');
    return;
  }

  if (isVoiceMode.value) {
      // Closing
      closeAgent(); // Update global state
  } else {
      // Opening
      triggerAgent(null); // Open without prompt
  }
};

// --- IMAGE & CAMERA HANDLING ---

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleImageSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const base64Data = await blobToBase64(file);
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      selectedImageMime.value = matches[1];
      selectedImage.value = matches[2];
    }
  } catch (error) {
    console.error("Error reading image:", error);
    alert("Failed to load image.");
  }
  event.target.value = '';
};

const startCamera = async () => {
    try {
        isCameraOpen.value = true;
        // Use environment facing camera if available (rear camera on phones)
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        cameraStream = stream;
        
        // Wait for next tick to ensure videoRef is mounted
        setTimeout(() => {
            if (videoRef.value) {
                videoRef.value.srcObject = stream;
            }
        }, 100);
        
    } catch (err) {
        console.error("Camera access denied:", err);
        alert("Unable to access camera. Please check permissions.");
        isCameraOpen.value = false;
    }
};

const stopCamera = () => {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    isCameraOpen.value = false;
};

const takeSnapshot = () => {
    if (!videoRef.value || !canvasRef.value) {
        console.error("Video or Canvas ref missing");
        return;
    }

    const video = videoRef.value;
    const canvas = canvasRef.value;
    
    console.log(`Snapshot triggered. Video dimensions: ${video.videoWidth}x${video.videoHeight}`);

    if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("Video dimensions are 0. Waiting for metadata...");
        return;
    }
    
    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to Base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // JPEG at 80% quality
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    
    if (matches) {
      selectedImageMime.value = matches[1];
      selectedImage.value = matches[2];
      console.log(`Snapshot captured. MIME: ${matches[1]}, Length: ${matches[2].length}`);
    } else {
        console.error("Failed to parse data URL");
    }
    
    stopCamera();
};

const clearImage = () => {
  selectedImage.value = null;
  selectedImageMime.value = null;
};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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

const playResponseBlob = (blob) => {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    isProcessing.value = false;
    isPlaying.value = true;
    
    // Clear image after successful response
    clearImage();

    audio.onended = () => {
      isPlaying.value = false;
    };

    audio.play();
};

const sendTextQuery = async (text) => {
    isProcessing.value = true;
    console.log("Sending Text Query. Image attached: " + (selectedImage.value ? "Yes" : "No"));
    try {
        const payload = { 
          text,
          image: selectedImage.value,
          mimeType: selectedImageMime.value
        };

        const response = await api.post('/api/agent/query', payload, {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'blob'
        });
        playResponseBlob(response.data);
    } catch (e) {
        console.error("Text Query Error:", e);
        isProcessing.value = false;
    }
};

const sendAudioQuery = async () => {
  isProcessing.value = true;
  console.log("Sending Audio Query.");
  try {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    
    // Convert audio to base64
    const audioBase64Full = await blobToBase64(audioBlob);
    const audioBase64 = audioBase64Full.split(',')[1]; // Remove data URL prefix

    const payload = {
      audio: audioBase64,
      image: selectedImage.value,
      mimeType: selectedImageMime.value
    };

    console.log(`Payload ready. Audio len: ${audioBase64.length}, Image attached: ${!!payload.image}, Image len: ${payload.image ? payload.image.length : 0}`);

    // Use API service to handle Base URL automatically (Fixes 404)
    const response = await api.post('/api/agent/query', payload, {
      headers: {
        'Content-Type': 'application/json', // NOW SENDING JSON
      },
      responseType: 'blob' // Important: Expect binary audio back
    });

    playResponseBlob(response.data);

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
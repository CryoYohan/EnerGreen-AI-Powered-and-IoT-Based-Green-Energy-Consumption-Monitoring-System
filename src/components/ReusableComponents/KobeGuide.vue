<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible && currentStep" 
           ref="guideCard"
           class="fixed z-[9999] w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 font-poppins transition-all duration-300"
           :style="cardStyle">
        
        <!-- Arrow/Beak -->
        <div class="absolute w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-100 dark:border-gray-700 transform rotate-45"
             :style="arrowStyle"></div>

        <!-- Content Wrapper -->
        <div class="relative p-5">
          
          <!-- Loading State (Wait for Voice) -->
          <div v-if="!isPremium" class="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg text-center mx-auto">
              <div class="mb-6">
                  <svg class="mx-auto h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Kobe Onboarding Guide is a Premium Feature
              </h1>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                  Unlock interactive guides and tutorials for all features by upgrading your plan.
              </p>
              <div class="flex flex-col space-y-4">
                  <router-link
                  to="/upgrade"
                  class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                  >
                  Upgrade Now
                  </router-link>
                  <button
                  @click="closeTour"
                  class="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
                  >
                  Maybe Later
                  </button>
              </div>
          </div>
          <template v-else>
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-6">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <p class="text-xs text-blue-500 font-medium animate-pulse">Kobe is thinking...</p>
            </div>

            <!-- Actual Step Content (Revealed when audio is ready) -->
            <div v-else>
              <!-- Header -->
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-gray-800 dark:text-white text-sm">{{ currentStep.title }}</h3>
                  <span class="text-xs text-blue-500 font-medium">Kobe Guide</span>
                </div>
                <button @click="skipTour" class="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline">
                  Skip
                </button>
              </div>

              <!-- Body -->
              <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {{ currentStep.message }}
              </p>

              <!-- Footer / Controls -->
              <div class="flex justify-between items-center mt-2">
                <span class="text-xs text-gray-400">Step {{ currentIndex + 1 }} of {{ steps.length }}</span>
                <div class="flex gap-2">
                  <button v-if="currentIndex > 0" 
                          @click="prevStep"
                          class="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Back
                  </button>
                  
                  <button v-if="!isLastStep" 
                          @click="nextStep"
                          class="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all transform hover:scale-105">
                    Next
                  </button>
                  
                  <button v-else 
                          @click="finishTour"
                          class="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm transition-all transform hover:scale-105">
                    Done
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import api from '@/services/api'; 
import { useAuth } from '@/composables/useAuth'; // Import useAuth

const props = defineProps({
  steps: {
    type: Array,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['complete', 'skip', 'update:isOpen']);

const { isPremium } = useAuth('default-app-id'); // Use the composable

// State
const currentIndex = ref(0);
const visible = ref(props.isOpen);
const cardPosition = ref({ top: 0, left: 0 });
const arrowPosition = ref({});
const guideCard = ref(null);
const currentAudio = ref(null); 
const isLoading = ref(false); 

// Computed
const currentStep = computed(() => props.steps[currentIndex.value]);
const isLastStep = computed(() => currentIndex.value === props.steps.length - 1);

const cardStyle = computed(() => ({
  top: `${cardPosition.value.top}px`,
  left: `${cardPosition.value.left}px`
}));

const arrowStyle = computed(() => arrowPosition.value);

// --- Positioning Logic ---
const updatePosition = async () => {
  if (!currentStep.value || !visible.value) return;

  await nextTick();

  const targetId = currentStep.value.targetId;
  const targetEl = document.getElementById(targetId);

  if (!targetEl) {
    console.warn(`KobeGuide: Target element #${targetId} not found.`);
    // Default position center screen
    cardPosition.value = { 
      top: window.innerHeight / 2 - 100, 
      left: window.innerWidth / 2 - 160 
    };
    return;
  }

  highlightElement(targetEl);

  const targetRect = targetEl.getBoundingClientRect();
  
  // Use a default size if loading (since content is smaller)
  // or use the ref size if available.
  const cardEl = guideCard.value;
  // If loading, the card might be smaller, but we want to position relative to where it *will* be?
  // Actually, centering the small loading card relative to element is fine.
  const cardRect = cardEl ? cardEl.getBoundingClientRect() : { width: 320, height: 200 };

  const spacing = 12;
  
  let top = targetRect.top + (targetRect.height / 2) - (cardRect.height / 2);
  let left = targetRect.right + spacing;
  let arrowClass = { left: '-8px', top: '50%', marginTop: '-8px' };

  if (left + cardRect.width > window.innerWidth) {
    top = targetRect.bottom + spacing;
    left = targetRect.left + (targetRect.width / 2) - (cardRect.width / 2);
    arrowClass = { top: '-8px', left: '50%', marginLeft: '-8px' };
    
    if (top + cardRect.height > window.innerHeight) {
       top = targetRect.top - cardRect.height - spacing;
       arrowClass = { bottom: '-8px', left: '50%', marginLeft: '-8px', top: 'auto' };
    }
  }

  if (left < 10) left = 10;
  if (top < 10) top = 10;

  cardPosition.value = { top, left };
  arrowPosition.value = arrowClass;

  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// --- Highlighting ---
let previousTarget = null;
const highlightElement = (el) => {
  if (previousTarget && previousTarget !== el) {
    previousTarget.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50', 'transition-all', 'duration-500');
  }
  el.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50', 'transition-all', 'duration-500');
  previousTarget = el;
};

const clearHighlight = () => {
  if (previousTarget) {
    previousTarget.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50', 'transition-all', 'duration-500');
    previousTarget = null;
  }
};

// --- Audio & Step Management ---

const loadStep = async () => {
  if (!currentStep.value) return;

  isLoading.value = true;
  
  // 1. Initial Position (Show Loading State at target)
  await nextTick();
  updatePosition();

  // 2. Fetch Audio
  const text = currentStep.value.voiceText || currentStep.value.message;
  
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value = null;
  }

  try {
    const response = await api.post('/api/kobe/tts', { text }, {
       responseType: 'blob'
    });
    const audioUrl = URL.createObjectURL(response.data);
    const audio = new Audio(audioUrl);
    currentAudio.value = audio;
    
    // 3. Audio Ready -> Reveal Content & Play
    isLoading.value = false;
    await nextTick(); 
    updatePosition(); // Re-adjust position if content size changed
    
    audio.play();

  } catch (error) {
    console.error("Kobe TTS Error:", error);
    isLoading.value = false; // Fallback: show text anyway
  }
};

// --- Navigation ---
const nextStep = () => {
  if (currentIndex.value < props.steps.length - 1) {
    currentIndex.value++;
  }
};

const prevStep = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const finishTour = () => {
  closeTour();
  emit('complete');
};

const skipTour = () => {
  closeTour();
  emit('skip');
};

const closeTour = () => {
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value = null;
  }
  clearHighlight();
  visible.value = false;
  emit('update:isOpen', false);
};

// --- Watchers ---
watch(() => props.isOpen, (newVal) => {
  visible.value = newVal;
  if (newVal) {
    currentIndex.value = 0;
    setTimeout(() => {
        loadStep();
    }, 100);
  } else {
    if (currentAudio.value) currentAudio.value.pause();
    clearHighlight();
  }
});

watch(currentIndex, () => {
  if (visible.value && currentStep.value) {
    loadStep();
  }
});

onMounted(() => {
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition, true);
});

onUnmounted(() => {
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
  if (currentAudio.value) currentAudio.value.pause();
  clearHighlight();
});

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
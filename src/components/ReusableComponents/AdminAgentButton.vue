<template>
  <div class="fixed bottom-6 right-6 z-50 font-cinzel">
    <transition name="fade">
      <div v-if="isVoiceMode" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-all duration-700 overflow-hidden py-12">
        
        <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)] z-0"></div>

        <div class="relative z-20 text-center mb-4">
          <div v-if="isProcessing" class="flex items-center justify-center gap-3 animate-pulse">
             <span class="text-xl font-bold text-red-500 tracking-[0.2em]">SUMMONING...</span>
          </div>
          <div v-else class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 tracking-widest drop-shadow-sm">BRYL</span>
            <span class="text-sm md:text-base text-red-900/80 uppercase tracking-[0.4em] mt-2">The All-Seeing</span>
          </div>
        </div>

        <div class="relative flex-1 flex items-center justify-center w-full max-h-[60vh] cursor-pointer z-10 group" @click="toggleRecording">
          <canvas ref="canvasRef" width="1600" height="1600" class="w-full h-full object-contain transition-transform duration-1000 scale-100 group-hover:scale-105" :class="{'!scale-110': isPlaying}"></canvas>

          <div class="absolute bottom-[10%] text-center pointer-events-none transition-all duration-500 z-30"
            :class="{ 'opacity-0 translate-y-4': !isRecording && !isProcessing && !isPlaying, 'opacity-100 translate-y-0': isRecording || isProcessing || isPlaying }">
            <h2 class="text-3xl md:text-4xl font-bold text-orange-500/90 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] tracking-widest">{{ voiceStatus }}</h2>
             </div>
        </div>

        <div class="relative z-20 text-center mt-6 mb-12 transition-opacity duration-500"
             :class="{ 'opacity-0': isRecording || isProcessing || isPlaying, 'opacity-100': !isRecording && !isProcessing && !isPlaying }">
            <h3 class="text-2xl md:text-3xl font-bold text-orange-500/80 tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,69,0,0.4)]">
              TOUCH THE EYE TO SPEAK
            </h3>
        </div>


        <div class="w-full flex justify-center gap-12 items-center absolute bottom-12 z-40">
          <button @click.stop="toggleRecording" :disabled="isProcessing"
            class="group relative p-6 rounded-full transition-all duration-500 flex items-center justify-center hover:scale-110 active:scale-95">
             <div class="absolute inset-0 bg-red-900/20 blur-xl rounded-full group-hover:bg-red-600/30 transition-all duration-500"></div>
             
             <div class="relative z-10 transition-colors duration-300"
                  :class="isRecording ? 'text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,1)]' : 'text-gray-600 group-hover:text-red-400'">
                 <div v-if="isRecording" class="w-8 h-8 bg-red-600 shadow-[0_0_20px_red] animate-pulse rounded-sm"></div>
                 <MicrophoneIcon v-else class="w-10 h-10" />
             </div>
             
             <span v-if="isRecording" class="absolute inset-0 border-2 border-red-500/50 rounded-full animate-ping"></span>
          </button>

          <button @click="toggleVoiceMode"
            class="p-4 rounded-full text-gray-600 hover:text-white hover:bg-white/5 transition-all duration-300">
            <XMarkIcon class="w-8 h-8" />
          </button>
        </div>

      </div>
    </transition>

    <button v-if="!isVoiceMode" @click="toggleVoiceMode"
      class="group relative w-16 h-16 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 hover:scale-110 hover:shadow-[0_0_60px_rgba(255,69,0,0.6)] active:scale-95 flex items-center justify-center bg-black border border-red-900/50 z-50 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#ff4500,#8b0000_60%,black_80%)] opacity-80 group-hover:opacity-100 transition-opacity"></div>
      <ShieldCheckIcon class="w-7 h-7 relative z-10 text-orange-100 drop-shadow-md" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import { XMarkIcon, MicrophoneIcon, ShieldCheckIcon } from '@heroicons/vue/24/solid';

// --- Component State ---
const route = useRoute();
const canvasRef = ref(null);
let animationFrameId = null;

const isVoiceMode = ref(false);
const isRecording = ref(false);
const isProcessing = ref(false);
const isPlaying = ref(false);

let mediaRecorder = null;
let audioChunks = [];

// --- THE INFERNO ENGINE (Powerful Animation) ---
const SauronEye = {
    canvas: null,
    ctx: null,
    w: 0, h: 0,
    cx: 0, cy: 0,
    tick: 0,
    
    // Configuration
    settings: {
        radius: 300,
        pupilWidth: 30,     // Current pupil width
        pupilHeight: 250,   
        targetPupilWidth: 30, // For animation smoothing
        irisSpeed: 0.01,
        fireIntensity: 1.0, // 1.0 = normal, 3.5 = speaking
        shake: 0,
    },
    
    // Filament array for the iris texture
    filaments: [],
    shockwaves: [],

    Init: function(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // Set canvas resolution to match display size for sharpness
        this.w = this.canvas.width;
        this.h = this.canvas.height;
        this.cx = this.w / 2;
        this.cy = this.h / 2;
        
        // Generate Iris Filaments (The stringy fire parts)
        this.filaments = [];
        for(let i=0; i<300; i++) {
            this.filaments.push({
                angle: Math.random() * Math.PI * 2,
                len: Math.random(),
                speed: Math.random() * 0.02 + 0.005,
                offset: Math.random() * 100
            });
        }
        this.Render();
    },

    SpawnShockwave: function() {
        this.shockwaves.push({ r: 50, opacity: 1.0, width: 10 });
    },

    // Main Draw Loop
    Render: function() {
        if (!isVoiceMode.value || !this.ctx) return;
        this.tick++;

        // Smoothly interpolate pupil width
        const diff = this.settings.targetPupilWidth - this.settings.pupilWidth;
        this.settings.pupilWidth += diff * 0.1;

        // Apply Screen Shake if speaking
        let sx = 0, sy = 0;
        if(this.settings.shake > 0) {
            sx = (Math.random() - 0.5) * this.settings.shake;
            sy = (Math.random() - 0.5) * this.settings.shake;
        }

        // Clear Screen
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.ctx.save();
        this.ctx.translate(this.cx + sx, this.cy + sy);

        // 1. Draw The Atmosphere (Deep Red Haze)
        this.drawAtmosphere();

        // 2. Draw The Shockwaves (Rings)
        this.drawShockwaves();

        // 3. Draw The Iris (The Fire Strands)
        this.drawInfernoIris();

        // 4. Draw The Pupil (The Void)
        this.drawPupil();

        this.ctx.restore();

        // Randomly spawn shockwaves when speaking for powerful thumping effect
        if(isPlaying.value && this.tick % 15 === 0) {
            this.SpawnShockwave();
        }

        animationFrameId = requestAnimationFrame(this.Render.bind(this));
    },

    drawAtmosphere: function() {
        // Deep background glow
        const grad = this.ctx.createRadialGradient(0, 0, 100, 0, 0, this.settings.radius * 3);
        grad.addColorStop(0, 'rgba(255, 100, 0, 0.2)');
        grad.addColorStop(0.5, 'rgba(100, 0, 0, 0.1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(-this.cx, -this.cy, this.w, this.h);
    },

    drawShockwaves: function() {
        this.ctx.globalCompositeOperation = 'screen'; // Additive blending for energy
        
        for(let i = this.shockwaves.length - 1; i >= 0; i--) {
            let wave = this.shockwaves[i];
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, wave.r, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 200, 100, ${wave.opacity * 0.3})`;
            this.ctx.lineWidth = wave.width;
            this.ctx.stroke();

            // Expand
            wave.r += 8; // Expansion speed
            wave.opacity -= 0.02;
            wave.width += 0.5;

            if(wave.opacity <= 0) this.shockwaves.splice(i, 1);
        }
    },

    drawInfernoIris: function() {
        this.ctx.globalCompositeOperation = 'screen'; // Magic glow mode

        // Inner Bright Core
        const coreGrad = this.ctx.createRadialGradient(0, 0, 50, 0, 0, this.settings.radius);
        coreGrad.addColorStop(0, 'rgba(255, 255, 200, 0.8)'); // White hot
        coreGrad.addColorStop(0.3, 'rgba(255, 150, 0, 0.6)'); // Bright Orange
        coreGrad.addColorStop(0.7, 'rgba(150, 0, 0, 0.3)');   // Deep Red
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = coreGrad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.settings.radius * 1.2, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw Filaments
        this.filaments.forEach((f, i) => {
            const t = this.tick * (f.speed * this.settings.fireIntensity);
            // Noise calculation for organic movement
            const distortion = Math.sin(t + f.offset) * 20 * this.settings.fireIntensity;
            const len = this.settings.radius + (f.len * 100) + distortion;
            
            // Rotate the filament
            const angle = f.angle + (this.tick * 0.002 * (i%2==0 ? 1 : -1));

            const x = Math.cos(angle) * len;
            const y = Math.sin(angle) * len * 0.8; // Squash y slightly

            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            
            // Bezier curve for flowy fire hair
            const cp1x = Math.cos(angle - 0.2) * (len * 0.5);
            const cp1y = Math.sin(angle - 0.2) * (len * 0.5);
            
            this.ctx.quadraticCurveTo(cp1x, cp1y, x, y);
            
            // Color logic based on length (tips are darker, base is white)
            const alpha = 0.4 * (1 - (len / (this.settings.radius * 2)));
            this.ctx.strokeStyle = `rgba(255, ${Math.floor(100 + Math.random()*50)}, 0, ${alpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    },

    drawPupil: function() {
        this.ctx.globalCompositeOperation = 'source-over'; // Normal drawing for the black void

        // Add a "breathing" effect to height
        const breath = Math.sin(this.tick * 0.05) * 5; 
        
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.settings.pupilWidth, this.settings.pupilHeight + breath, 0, 0, Math.PI * 2);
        
        // Pupil is not just black, it has a fiery rim gradient
        const grad = this.ctx.createRadialGradient(0, 0, 5, 0, 0, this.settings.pupilHeight);
        grad.addColorStop(0, '#000000'); // Pure void
        grad.addColorStop(0.8, '#1a0000'); // Dark red edge
        grad.addColorStop(1, 'rgba(50, 0, 0, 0.5)');
        
        this.ctx.fillStyle = grad;
        this.ctx.fill();

        // Sharp rim light on the pupil (The "Rim Lighting")
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = `rgba(255, 200, 100, ${0.5 + Math.random()*0.2})`; // Flickering rim
        this.ctx.stroke();
        
        // Horizontal lens flare streak (cinematic feel)
        this.ctx.globalCompositeOperation = 'screen';
        const streakGrad = this.ctx.createLinearGradient(-300, 0, 300, 0);
        streakGrad.addColorStop(0, 'rgba(255, 100, 0, 0)');
        streakGrad.addColorStop(0.5, 'rgba(255, 200, 100, 0.1)');
        streakGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        this.ctx.fillStyle = streakGrad;
        this.ctx.fillRect(-300, -2, 600, 4);
    },

    Stop: function() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
};

// --- Voice State Feedback ---
const voiceStatus = computed(() => {
  if (isRecording.value) return "LISTENING...";
  if (isProcessing.value) return "PROCESSING...";
  if (isPlaying.value) return "SPEAKING...";
  return ""; // Idle state has static text outside canvas now
});


// --- Watchers for Animation States ---

watch(isPlaying, (speaking) => {
    if (speaking) {
        // --- SAURON ANGER MODE ---
        SauronEye.settings.fireIntensity = 3.5; // Fire moves 3.5x faster
        SauronEye.settings.targetPupilWidth = 4; // Pupil narrows to a predator slit
        SauronEye.settings.shake = 3; // Screen shakes
    } else {
        // --- IDLE WATCHER MODE ---
        SauronEye.settings.fireIntensity = 1.0;
        SauronEye.settings.targetPupilWidth = 40; // Pupil widens
        SauronEye.settings.shake = 0;
    }
});

watch(isVoiceMode, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (canvasRef.value) {
        SauronEye.Init(canvasRef.value);
      }
    });
  } else {
    SauronEye.Stop();
    stopAllAudio(); 
  }
});

// --- Standard Audio Logic ---
watch(() => route.path, () => {
    if (isVoiceMode.value) toggleVoiceMode();
});

const stopAllAudio = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    isRecording.value = false;
    isPlaying.value = false;
    isProcessing.value = false;
}

const toggleVoiceMode = () => {
  isVoiceMode.value = !isVoiceMode.value;
  if (!isVoiceMode.value) stopAllAudio();
};

const toggleRecording = async () => {
  if (isRecording.value) {
    stopAllAudio();
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
        if (audioChunks.length > 0) await sendAudioQuery();
        else isRecording.value = false;
      };
      mediaRecorder.start();
      isRecording.value = true;
    } catch (err) {
      console.error("Mic access denied:", err);
      alert("Microphone access is required.");
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
        URL.revokeObjectURL(audioUrl);
    };
    audio.play();
  } catch (e) {
    console.error("Admin Voice Query Error:", e);
    isProcessing.value = false;
    isPlaying.value = false;
  }
};

onUnmounted(() => {
  SauronEye.Stop();
  stopAllAudio();
});
</script>

<style scoped>
/* Import Cinzel for that Lord of the Rings vibe */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');

.font-cinzel {
    font-family: 'Cinzel', serif;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure body doesn't scroll when modal is open */
:global(body.modal-open) {
    overflow: hidden;
}
</style>
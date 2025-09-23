<template>
  <section id="home" class="w-full bg-white dark:bg-gray-900 min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
    <div class="container h-full px-4 mx-auto sm:px-6">
      <div class="flex flex-col items-center justify-center h-full gap-4 py-12 text-center md:gap-6">
        <!-- Animated Title -->
        <div class="relative">
          <h1 class="text-7xl font-black md:text-7xl lg:text-[200px] font-poppins dark:text-gray-100 animate-fade-in-up">
            <span class="text-[#0D2535] dark:text-white tracking-tight">
              <span class="inline-block animate-bounce-slow delay-100">Track.</span>
              <span class="inline-block animate-bounce-slow delay-300">Save.</span>
            </span> 
            <br>
            <span class="text-[#059669] tracking-tight">
              <span class="inline-block animate-pulse-slow delay-500">Go</span>
              <span class="inline-block animate-pulse-slow delay-700">Green</span>
            </span>
          </h1>
          
          <!-- Floating Eco Icons -->
          <div class="absolute -top-4 -left-4 animate-float">
            <svg class="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="absolute -bottom-4 -right-4 animate-float-reverse">
            <svg class="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>

        <!-- Animated Subtitle -->
        <p class="max-w-2xl mx-auto text-lg md:text-xl font-poppins text-[#0D2535] dark:text-gray-300 animate-fade-in-up delay-1000">
          Together, small energy-saving actions lead to a greener, healthier planet for all.
        </p>

        <!-- Interactive Button with Particle Effect -->
        <div class="flex flex-col gap-4 items-center relative">
          <button
            @click="handleButtonClick"
            @mouseenter="startButtonParticles"
            @mouseleave="stopButtonParticles"
            class="relative px-8 py-3 md:px-10 md:py-4 rounded-full border-2 hover:border-[#0D2535] border-[#059669] bg-[#059669] text-white font-poppins font-bold hover:bg-[#0D2535] transition-all duration-300 transform hover:scale-105 dark:bg-gray-700 dark:border-gray-700 dark:hover:bg-white dark:hover:text-black dark:text-white animate-pulse-gentle"
          >
            Start Monitoring
            <!-- Button Particles -->
            <div v-for="particle in particles" :key="particle.id" 
                 class="absolute w-2 h-2 bg-white rounded-full opacity-70"
                 :style="{
                   left: particle.x + 'px',
                   top: particle.y + 'px',
                   transform: `scale(${particle.scale})`,
                   opacity: particle.opacity
                 }">
            </div>
          </button>
          
          <!-- Scroll Indicator -->
          <div class="absolute -bottom-10 animate-bounce">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Background Animated Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div v-for="i in 15" :key="i" 
           class="absolute w-4 h-4 rounded-full opacity-10 animate-float-slow"
           :class="i % 3 === 0 ? 'bg-green-500' : i % 3 === 1 ? 'bg-blue-500' : 'bg-teal-500'"
           :style="{
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             animationDelay: (Math.random() * 5) + 's',
             animationDuration: (10 + Math.random() * 10) + 's'
           }">
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroSection',
  data() {
    return {
      showPopup: false,
      particles: [],
      particleInterval: null
    }
  },
  mounted() {
    // Show popup after a short delay when component mounts
    setTimeout(() => {
      this.showPopup = true;
    }, 1000);
    
    // Add scroll trigger for additional animations
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    this.stopButtonParticles();
  },
  methods: {
    handleButtonClick() {
      this.$emit('open-login-modal');
      // Add click animation
      const button = event.currentTarget;
      button.classList.add('animate-ping');
      setTimeout(() => {
        button.classList.remove('animate-ping');
      }, 600);
    },
    startButtonParticles() {
      this.particleInterval = setInterval(() => {
        if (this.particles.length < 10) {
          this.particles.push({
            id: Date.now() + Math.random(),
            x: Math.random() * 120 - 10,
            y: Math.random() * 50 - 5,
            scale: Math.random() * 0.8 + 0.2,
            opacity: Math.random() * 0.5 + 0.3
          });
        }
        
        // Remove old particles
        if (this.particles.length > 8) {
          this.particles.shift();
        }
      }, 100);
    },
    stopButtonParticles() {
      if (this.particleInterval) {
        clearInterval(this.particleInterval);
        this.particleInterval = null;
      }
      setTimeout(() => {
        this.particles = [];
      }, 500);
    },
    closePopup() {
      this.showPopup = false;
    },
  
  }
}
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes pulse-gentle {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

@keyframes float-reverse {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(10px) rotate(-5deg);
  }
}

@keyframes float-slow {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(-10px) translateX(20px);
  }
  75% {
    transform: translateY(-30px) translateX(-10px);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out forwards;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.animate-pulse-gentle {
  animation: pulse-gentle 2s ease-in-out infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-reverse {
  animation: float-reverse 5s ease-in-out infinite;
}

.animate-float-slow {
  animation: float-slow 15s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-500 {
  animation-delay: 0.5s;
}

.delay-700 {
  animation-delay: 0.7s;
}

.delay-1000 {
  animation-delay: 1s;
}
</style>
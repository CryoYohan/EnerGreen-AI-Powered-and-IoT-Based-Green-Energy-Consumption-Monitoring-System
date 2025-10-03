<template>
  <div id="about" class="w-full min-h-screen flex items-center bg-[#059669] dark:bg-gray-800 overflow-hidden relative">
    <div class="mx-auto px-4 w-[73%] sm:px-6 mt-0 sm:mt-30 z-10">
      <div class="flex flex-col items-center gap-8 py-12 lg:flex-row lg:gap-10 lg:py-0">
        <div class="w-full text-center lg:w-1/2 sm:text-left">
          <h2 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white dark:text-white font-poppins leading-[1.5] tracking-tight">
            <span class="inline-block opacity-0 animate-fade-in-up">Empower</span> 
            <br class="hidden sm:block"> 
            <span class="inline-block opacity-0 animate-fade-in-up delay-200">Your Energy</span>
            <br class="hidden sm:block">
            <span class="inline-block opacity-0 animate-fade-in-up delay-400">Savings with</span>
            <span class="inline-block opacity-0 animate-fade-in-up delay-600 text-green-200">EnerGreen</span>
          </h2>
          
          <div class="mt-6 opacity-0 animate-fade-in delay-800">
            <div class="w-16 h-1 bg-green-300 rounded-full mx-auto sm:mx-0"></div>
          </div>
        </div>

        <div class="w-full text-center font-poppins lg:w-1/2 sm:text-left">
          <div class="opacity-0 animate-fade-in-up delay-1000">
            <p class="text-base leading-relaxed text-white dark:text-white font-poppins sm:text-lg md:text-xl">
              Discover how EnerGreen's monitoring system can help you reduce electricity costs 
              and minimize your carbon footprint. Experience real-time insights and personalized
              energy-saving tips tailored to your needs.
            </p>
            
            <div class="mt-6 flex flex-wrap gap-6 justify-center sm:justify-start">
              <div class="flex items-center gap-2 opacity-0 animate-fade-in delay-1200">
                <div class="w-2 h-2 bg-green-300 rounded-full"></div>
                <span class="text-green-100 text-sm font-medium">Real-time Monitoring</span>
              </div>
              <div class="flex items-center gap-2 opacity-0 animate-fade-in delay-1400">
                <div class="w-2 h-2 bg-green-300 rounded-full"></div>
                <span class="text-green-100 text-sm font-medium">Cost Prediction</span>
              </div>
              <div class="flex items-center gap-2 opacity-0 animate-fade-in delay-1600">
                <div class="w-2 h-2 bg-green-300 rounded-full"></div>
                <span class="text-green-100 text-sm font-medium">Eco-Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-10 w-32 h-32 bg-green-400 rounded-full opacity-5 animate-pulse-slow"></div>
      <div class="absolute bottom-1/3 right-20 w-24 h-24 bg-green-300 rounded-full opacity-5 animate-pulse-slow delay-1000"></div>
      
      <div 
        v-for="i in 50" 
        :key="i" 
        class="absolute rounded-full opacity-10 animate-float-bubble"
        :class="getBubbleSize(i)"
        :style="{
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDelay: (Math.random() * 10) + 's',
          animationDuration: (15 + Math.random() * 15) + 's',
          backgroundColor: getBubbleColor(i)
        }"
      >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutSection',
  methods: {
    getBubbleSize(index) {
      const sizes = ['w-2 h-2', 'w-3 h-3', 'w-1 h-1', 'w-4 h-4'];
      return sizes[index % sizes.length];
    },
    getBubbleColor(index) {
      const colors = ['bg-green-200', 'bg-green-300', 'bg-white', 'bg-green-100', 'bg-green-50'];
      return colors[index % colors.length];
    }
  },
  mounted() {
    // Simple intersection observer to trigger animations when section comes into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animations are handled by CSS, this is just for observation
          console.log('About section in view');
        }
      });
    }, { threshold: 0.3 });
    
    observer.observe(document.getElementById('about'));
  }
}
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes float-bubble {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.1;
  }
  25% {
    transform: translateY(-20px) translateX(5px) scale(1.1);
    opacity: 0.15;
  }
  50% {
    transform: translateY(-40px) translateX(-5px) scale(0.9);
    opacity: 0.08;
  }
  75% {
    transform: translateY(-20px) translateX(5px) scale(1.05);
    opacity: 0.12;
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}

.animate-float-bubble {
  animation: float-bubble linear infinite;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-400 {
  animation-delay: 0.4s;
}

.delay-600 {
  animation-delay: 0.6s;
}

.delay-800 {
  animation-delay: 0.8s;
}

.delay-1000 {
  animation-delay: 1s;
}

.delay-1200 {
  animation-delay: 1.2s;
}

.delay-1400 {
  animation-delay: 1.4s;
}

.delay-1600 {
  animation-delay: 1.6s;
}
</style>
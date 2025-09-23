<template>
  <div class="w-full flex flex-col dark:bg-gray-900 font-poppins md:flex-row gap-6 md:gap-12 h-auto md:h-[63%] relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Floating solar particles -->
      <div v-for="i in 15" :key="i" 
           class="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-20 animate-float-solar"
           :style="{
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             animationDelay: (Math.random() * 5) + 's',
             animationDuration: (8 + Math.random() * 8) + 's'
           }">
      </div>
      <!-- Gradient orbs -->
      <div class="absolute -top-20 -left-20 w-64 h-64 bg-green-400 rounded-full opacity-5 blur-2xl"></div>
      <div class="absolute -bottom-20 -right-20 w-80 h-80 bg-yellow-200 rounded-full opacity-5 blur-2xl"></div>
    </div>

    <!-- Text Content -->
    <div class="w-full lg:h-[780px] md:w-[60%] flex flex-col bg-[#059669] dark:bg-gray-800 font-poppins justify-center p-6 md:p-32 gap-6 relative z-10">
      <!-- Animated badge -->
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 w-fit mb-2 animate-fade-in-up">
        <svg class="w-4 h-4 text-yellow-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <h3 class="text-sm font-medium text-white md:text-lg">Solar Integration</h3>
      </div>

      <h1 class="font-semibold text-white leading-tight"
          style="font-size: clamp(2rem, 5vw, 4.5rem);">
        <span class="inline-block opacity-0 font-poppins animate-fade-in-up delay-200">Seamless Solar Panel</span>
        <br>
        <span class="inline-block opacity-0 font-poppins animate-fade-in-up delay-400 text-yellow-200">Integration for Smart Savings</span>
      </h1>
      
      <p class="text-base text-white/90 md:text-lg leading-relaxed opacity-0 animate-fade-in-up delay-600">
        Our platform effortlessly connects with your solar panels, providing real-time 
        data on energy production and consumption. This integration empowers you to maximize 
        your solar investment and reduce overall energy costs.
      </p>

      <!-- Feature points -->
      <div class="flex flex-col gap-3 mt-4 opacity-0 animate-fade-in-up delay-800">
        <div v-for="(point, index) in featurePoints" :key="index"
             class="flex items-center gap-3 group cursor-pointer">
          <div class="w-2 h-2 bg-yellow-300 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
          <span class="text-white/80 group-hover:text-white transition-colors duration-300">{{ point }}</span>
        </div>
      </div>

    </div>

    <!-- Image Section -->
    <div class="flex justify-center w-full md:w-auto md:justify-end relative z-10">
      <div class="relative group">
        <!-- Main Image -->
        <img 
          class="w-full md:w-[820px] h-auto md:h-[780px] object-cover rounded-l-2xl md:rounded-l-3xl
                 transform transition-all duration-700 group-hover:scale-105"
          src="/src/Images/background/midsection-img.png" 
          alt="Solar Panel Integration"
        />
        
        <!-- Image overlay effects -->
        <div class="absolute inset-0 bg-gradient-to-l from-[#059669]/20 to-transparent rounded-l-2xl md:rounded-l-3xl"></div>
        
        <!-- Floating stats overlay -->
        <div class="absolute top-6 right-6 bg-black/40 backdrop-blur-sm rounded-2xl p-4 text-white 
                    transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 
                    transition-all duration-500">
          <div class="text-2xl font-bold text-yellow-300">+45%</div>
          <div class="text-sm">Energy Efficiency</div>
        </div>
        
        <div class="absolute bottom-6 left-6 bg-black/40 backdrop-blur-sm rounded-2xl p-4 text-white 
                    transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 
                    transition-all duration-500 delay-200">
          <div class="text-2xl font-bold text-green-300">-60%</div>
          <div class="text-sm">Cost Reduction</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SolarIntegrationSection',
  data() {
    return {
      featurePoints: [
        'Real-time solar production monitoring',
        'Automated energy consumption optimization',
        'Smart grid compatibility',
      ]
    }
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

@keyframes float-solar {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.4;
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animate-float-solar {
  animation: float-solar ease-in-out infinite;
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
</style>
<template>
  <div class="w-full flex flex-col-reverse md:flex-row gap-6 dark:bg-gray-900 md:gap-12 mt-20 h-auto md:h-[62.5%] relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Floating energy particles -->
      <div v-for="i in 12" :key="i" 
           class="absolute w-3 h-3 bg-green-400 rounded-full opacity-10 animate-float-energy"
           :style="{
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             animationDelay: (Math.random() * 4) + 's',
             animationDuration: (6 + Math.random() * 6) + 's'
           }">
      </div>
      <!-- Gradient accents -->
      <div class="absolute top-10 right-1/4 w-40 h-40 bg-blue-400 rounded-full opacity-5 blur-xl"></div>
      <div class="absolute bottom-10 left-1/3 w-32 h-32 bg-emerald-400 rounded-full opacity-5 blur-xl"></div>
    </div>

    <!-- Image -->
    <div class="flex justify-center w-full md:w-auto md:justify-start relative z-10">
      <div class="relative group">
        <img 
          class="w-full md:w-[720px] h-auto md:h-[720px] object-cover rounded-r-2xl
                 transform transition-all duration-500 group-hover:scale-105"
          src="/src/Images/background/monitoring.png" 
          alt="Energy Monitoring Dashboard"
        />
        <!-- Image overlay effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-[#059669]/20 to-transparent rounded-r-2xl
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>

    <!-- Text Block -->
    <div class="w-full lg:h-[720px] md:w-[60%] flex flex-col bg-[#059669] dark:bg-gray-800 font-poppins justify-center px-6 md:px-32 py-8 md:py-0 gap-6 text-center md:text-left relative z-10">
      <!-- Animated header -->
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full p-10 backdrop-blur-sm border border-white/20 w-fit mx-auto md:mx-0">
        <div class="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
        <h3 class="text-sm font-medium text-white md:text-lg">Smart Energy</h3>
      </div>

      <h1 class="font-semibold text-white leading-tight"
          style="font-size: clamp(2rem, 5vw, 4.5rem);">
        <span class="inline-block opacity-0 animate-fade-in-up">Unlock the Future of</span>
        <br>
        <span class="inline-block opacity-0 animate-fade-in-up delay-300 text-green-200">Energy Management</span>
      </h1>
      
      <p class="text-base text-white/90 md:text-lg leading-relaxed opacity-0 animate-fade-in-up delay-500">
        EnerGreen provides innovative solutions for energy monitoring and savings. Experience real-time insights
        and make informed decisions to lower your energy bills.
      </p>

      <!-- Features -->
      <div class="flex flex-col gap-6 mt-4 md:flex-row md:gap-8">
        <div v-for="(feature, index) in features" :key="index"
             class="flex flex-col items-center gap-3 text-center md:items-start md:text-left group cursor-pointer
                    opacity-0 animate-fade-in-up"
             :style="{ animationDelay: `${700 + index * 200}ms` }">
          <div class="relative p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20
                     group-hover:bg-white/20 transition-all duration-300">
            <svg 
              class="w-6 h-6 text-white"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                v-if="feature.icon === 'savings'"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path 
                v-else-if="feature.icon === 'eco'"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h3 class="font-semibold text-white text-lg">{{ feature.title }}</h3>
          <p class="text-sm text-white/80 md:text-base leading-relaxed">{{ feature.desc }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'EnergyManagementSection',
  data() {
    return {
      features: [
        {
          icon: 'savings',
          title: 'Cost Savings',
          desc: 'Reduce electricity costs with smart monitoring.'
        },
        {
          icon: 'eco',
          title: 'Eco Friendly',
          desc: 'Lower carbon footprint sustainably.'
        }
      ]
    }
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

@keyframes float-energy {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translateY(-15px) scale(1.1);
    opacity: 0.2;
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.7s ease-out forwards;
}

.animate-float-energy {
  animation: float-energy ease-in-out infinite;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-500 {
  animation-delay: 0.5s;
}

.delay-1100 {
  animation-delay: 1.1s;
}
</style>
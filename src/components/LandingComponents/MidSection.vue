<template>
  <div id="features" class="relative w-full min-h-screen flex flex-col items-center justify-center py-20 px-4 md:py-32 gap-12 bg-gradient-to-br from-gray-100 to-white dark:from-slate-900 dark:to-gray-900 overflow-hidden">

    <!-- Tiny low opacity bubbles -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Large subtle background elements -->
      <div class="absolute top-1/4 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full opacity-5 animate-pulse-slow"></div>
      <div class="absolute bottom-1/3 right-20 w-24 h-24 bg-sky-300 dark:bg-sky-700 rounded-full opacity-5 animate-pulse-slow delay-1000"></div>
      
      <!-- Tiny floating bubbles -->
      <div v-for="i in 25" :key="i" 
           class="absolute rounded-full opacity-10 animate-float-bubble"
           :class="getBubbleSize(i)"
           :style="{
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             animationDelay: (Math.random() * 10) + 's',
             animationDuration: (15 + Math.random() * 15) + 's',
             backgroundColor: getBubbleColor(i)
           }">
      </div>
    </div>

    <div class="w-full max-w-6xl text-center z-10 relative">
      <h1 class="font-extrabold text-slate-800 dark:text-white leading-tight font-poppins text-4xl sm:text-5xl md:text-6xl">
        <span class="inline-block opacity-0 animate-fade-in-up">Transform Your Energy</span>
        <br>
        <span class="inline-block opacity-0 animate-fade-in-up delay-300">Management 🚀</span>
      </h1>
      <p class="mt-4 text-lg md:text-xl text-slate-500 dark:text-slate-300 max-w-3xl mx-auto opacity-0 animate-fade-in-up delay-600">
        Our real-time monitoring dashboards provide you with instant insights into your energy consumption,
        helping you save money and reduce your carbon footprint.
      </p>
    </div>

    <div class="w-full z-10">
      <div class="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4 mx-auto">
        <div 
          v-for="(feature, index) in features"
          :key="index"
          class="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border-2 border-transparent hover:border-sky-500 opacity-0 animate-fade-in-up"
          :style="{ animationDelay: `${900 + index * 200}ms` }"
        >
          <div class="flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900 mb-6">
            <img 
              :src="feature.icon" 
              :alt="feature.title" 
              class="w-8 h-8 filter grayscale dark:filter-none dark:invert dark:sepia dark:hue-rotate-180"
            />
          </div>
          <h2 class="font-bold mb-2 text-2xl md:text-3xl text-slate-800 dark:text-white">
            {{ feature.title }}
          </h2>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
            {{ feature.desc }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeaturesSection',
  data() {
    return {
      features: [
        {
          icon: '/src/Images/icons/Frame.svg',
          title: 'Real-Time Monitoring',
          desc: 'Track your usage and identify savings opportunities instantly with live data streams.',
        },
        {
          icon: '/src/Images/icons/solar.svg',
          title: 'Solar Integration',
          desc: 'Seamlessly connect with your solar panels for maximum efficiency and energy independence.',
        },
        {
          icon: '/src/Images/icons/smart.svg',
          title: 'Smart Insights',
          desc: 'Get personalized recommendations and automated reports for smarter energy consumption.',
        }
      ]
    }
  },
  methods: {
    getBubbleSize(index) {
      const sizes = ['w-2 h-2', 'w-3 h-3', 'w-1 h-1', 'w-4 h-4'];
      return sizes[index % sizes.length];
    },
    getBubbleColor(index) {
      const colors = ['bg-blue-200', 'bg-sky-300', 'bg-white', 'bg-blue-100', 'bg-sky-200'];
      return colors[index % colors.length];
    }
  },
  mounted() {
    // Simple intersection observer to trigger animations when section comes into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animations are handled by CSS, this is just for observation
          console.log('Features section in view');
        }
      });
    }, { threshold: 0.3 });
    
    observer.observe(document.getElementById('features'));
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

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}

.animate-float-bubble {
  animation: float-bubble linear infinite;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-600 {
  animation-delay: 0.6s;
}
</style>
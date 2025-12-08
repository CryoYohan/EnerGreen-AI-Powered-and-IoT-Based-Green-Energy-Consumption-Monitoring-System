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
            <svg 
              class="w-8 h-8 text-sky-600 dark:text-sky-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                v-if="feature.icon === 'brain'"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m-2 6h2M7 11h10a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2a2 2 0 012-2z"
              />
              <path 
                v-else-if="feature.icon === 'leaf'"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M17.602 11.23a3.502 3.502 0 01-.174-.171m0 0a3.502 3.502 0 01-.171-.174M10.125 15.176l-.41-.41M13.5 17.5l-3.375-3.375M17.25 12l-1.375-1.375M12.75 6l-3.375 3.375M10.125 15.176l-3.75-3.75M12.75 6l-1.375-1.375M12.75 6a3.502 3.502 0 00-.174-.171m0 0a3.502 3.502 0 00-.171-.174m-2.25 1.75l-1.375-1.375M12 17.25h1.5a3.502 3.502 0 00-.174-.171m0 0a3.502 3.502 0 00-.171-.174m-2.25 1.75l-1.375-1.375"
              />
              <path 
                v-else-if="feature.icon === 'robot'"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M10 20H4a2 2 0 01-2-2V6a2 2 0 012-2h6M14 4h6a2 2 0 012 2v12a2 2 0 01-2 2h-6m-4-2h8m-4 0v-6m-4-6h8V6h-8V4z"
              />
              <path 
                v-else-if="feature.icon === 'chart'"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
              <path 
                v-else-if="feature.icon === 'lightbulb'"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
              <path 
                v-else-if="feature.icon === 'bolt'"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
              <!-- Default or fallback icon -->
              <path 
                v-else
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
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
          icon: 'brain',
          title: 'AI-Powered Analytics',
          desc: 'Leverage advanced AI to analyze energy patterns and predict future consumption for optimal savings.',
        },
        {
          icon: 'leaf',
          title: 'Carbon Emission Tracking',
          desc: 'Monitor your environmental impact in real-time and discover actionable steps to reduce your carbon footprint.',
        },
        {
          icon: 'robot',
          title: 'Intelligent AI-Agent',
          desc: 'Our AI-powered agent provides personalized recommendations and automates energy-saving actions for you.',
        },
        {
          icon: 'chart',
          title: 'Real-Time Monitoring',
          desc: 'Track your usage instantly with live data streams to identify and eliminate energy waste immediately.',
        },
        {
          icon: 'lightbulb',
          title: 'Smart AI Tips',
          desc: 'Receive personalized, actionable insights generated by AI to optimize your daily energy habits.',
        },
        {
          icon: 'bolt', // Using a bolt icon for appliance/power
          title: 'Appliance Detection',
          desc: 'Utilize Non-Intrusive Load Monitoring (NILM) to identify individual appliance consumption without extra sensors.',
        },
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
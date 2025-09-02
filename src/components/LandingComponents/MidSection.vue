<template>
  <!-- Full viewport height section -->
  <div id="features" class="w-full min-h-screen flex flex-col items-center justify-center py-12 md:py-24 gap-8 md:gap-20 bg-[#F1F6FA] dark:bg-[#0D2535] ">
    <!-- Heading group -->
    <div class="w-full max-w-4xl px-4 text-center">
      <h1 
        class="font-bold font-poppins text-[#0D2535] dark:text-white"
        style="font-size: clamp(1.75rem, 4vw, 3rem);"
      >
        Transform Your Energy Management
      </h1>
      <p 
        class="mt-4 text-gray-500 font-poppins dark:text-white"
        style="font-size: clamp(1rem, 2.5vw, 1.5rem);"
      >
        Our real-time monitoring dashboards provide you with instant insights into your energy
      </p>
    </div>

<!-- Features grid -->
  <div class="w-full px-4">
    <div class="grid w-full grid-cols-1 gap-6 p-4 mx-auto md:grid-cols-2 lg:grid-cols-3 md:gap-8">
      <div 
        v-for="(feature, index) in features"
        :key="index"
        class="rounded-lg dark:bg-gray-700 shadow-lg dark:shadow-gray-900 bg-white p-8 w-full min-w-[300px] md:w-auto md:min-w-0 hover:shadow-xl transition-shadow"
      >
        <img 
          :src="feature.icon" 
          :alt="feature.title" 
          class="w-12 h-12 mb-4 dark:brightness-0 dark:invert dark:sepia dark:hue-rotate-180"
        />        
        <h2 
            class="font-bold mb-2 text-[#0D2535] dark:text-[#F8F8FF]"
            style="font-size: clamp(1.25rem, 3vw, 1.75rem);"
          >
            {{ feature.title }}
        </h2>
        <p 
          class="text-gray-600 dark:text-[#F8F8FF]"
          style="font-size: clamp(0.875rem, 2vw, 1.125rem);"
        >
          {{ feature.desc }}
        </p>
      </div>
    </div>
  </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      features: [
        {
          icon: '/src/Images/icons/Frame.svg',
          title: 'Real-Time Monitoring',
          desc: 'Track your usage and identify savings opportunities instantly',
        },
        {
          icon: '/src/Images/icons/solar.svg',
          title: 'Solar Integration',
          desc: 'Seamlessly connect with your solar panels for maximum efficiency',
        },
        {
          icon: '/src/Images/icons/smart.svg',
          title: 'Smart Insights',
          desc: 'Get personalized recommendations for energy savings',
        }
      ]
    }
  }
}
</script>

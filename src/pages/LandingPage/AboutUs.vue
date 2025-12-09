<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 font-poppins">
    <Header class="sticky top-0 z-50 shadow-sm" />
    
    <main class="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <!-- Hero Section -->
        <div class="relative h-64 sm:h-80 bg-[#059669]">
          <div class="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-500 opacity-90"></div>
          <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 class="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">About EnerGreen</h1>
            <p class="text-lg sm:text-xl text-green-50 font-medium max-w-2xl">
              Empowering a sustainable future through intelligent energy monitoring.
            </p>
          </div>
          <!-- Decorative circles -->
          <div class="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div class="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        <!-- Content Section -->
        <div class="p-8 sm:p-12 space-y-10 text-gray-700 dark:text-gray-300">
          
          <!-- Mission -->
          <section>
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            </div>
            <p class="leading-relaxed text-lg">
              At <span class="font-semibold text-green-600 dark:text-green-400">EnerGreen</span>, we are dedicated to revolutionizing how individuals and businesses interact with energy. Our mission is to provide accessible, real-time insights that empower users to reduce waste, lower costs, and minimize their carbon footprint. We believe that small, informed changes in daily habits can lead to a massive global impact.
            </p>
          </section>

          <hr class="border-gray-200 dark:border-gray-700">

          <!-- Vision -->
          <section>
             <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
            </div>
            <p class="leading-relaxed text-lg">
              We envision a world where energy efficiency is second nature. By leveraging cutting-edge technologies like 
              <span class="font-semibold text-blue-600 dark:text-blue-400">AI-powered analytics</span> and 
              <span class="font-semibold text-blue-600 dark:text-blue-400">IoT monitoring</span>, we aim to build a transparent energy ecosystem where every watt counts towards a greener, more sustainable planet.
            </p>
          </section>

           <hr class="border-gray-200 dark:border-gray-700">

          <!-- Team / Values (Optional placeholder) -->
          <section>
             <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Who We Are</h2>
            </div>
            <p class="leading-relaxed text-lg">
              We are a team of passionate innovators, engineers, and environmental advocates. EnerGreen was born out of a desire to bridge the gap between complex energy data and actionable user decisions. We are constantly evolving, driven by feedback and the urgent need for climate action.
            </p>
          </section>

        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script>
import Header from '@/components/LandingComponents/Header.vue';
import Footer from '@/components/ReusableComponents/Footer.vue';

export default {
  name: 'AboutUs',
  components: {
    Header,
    Footer
  }
}
</script>

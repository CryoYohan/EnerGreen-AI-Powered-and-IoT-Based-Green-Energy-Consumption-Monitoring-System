<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
    <UserHeader class="print:hidden" />

    <div class="flex flex-col md:flex-row justify-between items-end gap-4 pb-0">
      <Heading
        title="Solar Generation"
        subtitle="Monitor your solar energy production and independence"
      />
      
      <div class="flex flex-col mr-8 sm:flex-row gap-4 w-full md:w-auto items-end sm:items-center">
        <!-- Time Filters -->
        <div class="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="flex flex-wrap gap-1">
            <button 
              v-for="filter in timeFilters" 
              :key="filter"
              @click="activeFilter = filter"
              :class="[
                'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
                activeFilter === filter 
                  ? 'bg-yellow-500 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              {{ filter }}
            </button>
          </div>
        </div>

        <!-- Export Buttons -->
        <div class="flex gap-2">
          <button @click="handleExport('csv')" class="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm">
            CSV
          </button>
          <button @click="handleExport('pdf')" class="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm">
            PDF
          </button>
          <button @click="handleExport('word')" class="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm">
            Word
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
    </div>
    
    <div v-else-if="error" class="mx-4 md:mx-8 mb-6 bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/20 dark:border-red-600">
      <p class="text-sm text-red-700 dark:text-red-200">{{ error }}</p>
    </div>

    <div v-else class="p-4 md:p-8 space-y-6 print:p-0">
      
      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
        <div v-for="(metric, index) in calculatedMetrics" :key="index" class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl print:shadow-none print:border-gray-200">
          <div class="flex justify-between items-start mb-2">
            <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ metric.title }}</p>
            <component :is="metric.icon" class="w-6 h-6" :class="metric.iconColor" />
          </div>
          <h3 class="text-2xl font-extrabold text-gray-900 dark:text-white">{{ metric.value }}</h3>
          <p class="text-xs font-medium mt-2 text-gray-500">{{ metric.subtitle }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Main Chart (2/3 Width) -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 print:shadow-none print:border-gray-200">
            <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Energy Source Mix ({{ activeFilter }})</h3>
            <div class="flex gap-4 text-xs font-medium">
                <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-yellow-500"></span> Solar
                </div>
                <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-gray-400"></span> Grid
                </div>
            </div>
            </div>
            <div class="h-80 w-full relative">
            <div id="solar-mix-chart" class="w-full h-full"></div>
            </div>
        </div>

        <!-- Weather & Efficiency Card (1/3 Width) -->
        <div class="lg:col-span-1 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
             <!-- Background Decoration -->
             <div class="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
             
             <h3 class="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                 <span v-if="weather" class="text-2xl">{{ weather.temp }}°C</span>
                 <span v-else>--°C</span>
                 Current Conditions
             </h3>

             <div v-if="weather" class="flex items-center gap-4 mb-6 relative z-10">
                 <img :src="weather.icon" alt="Weather Icon" class="w-16 h-16 bg-white/20 rounded-full shadow-sm p-1" />
                 <div>
                     <p class="text-xl font-semibold capitalize">{{ weather.description }}</p>
                     <p class="text-xs text-blue-100">Humidity: {{ weather.humidity }}% | Wind: {{ weather.windSpeed }} m/s</p>
                 </div>
             </div>
             <div v-else class="h-20 flex items-center justify-center text-blue-100 italic">
                 Loading weather...
             </div>

             <div class="border-t border-white/20 pt-4 relative z-10">
                 <div class="flex justify-between items-end mb-2">
                     <span class="text-sm font-medium text-blue-100">Solar Efficiency Forecast</span>
                     <span class="text-2xl font-bold">{{ solarEfficiency }}%</span>
                 </div>
                 <div class="w-full bg-black/20 rounded-full h-2.5">
                    <div class="bg-yellow-400 h-2.5 rounded-full transition-all duration-1000" :style="{ width: solarEfficiency + '%' }"></div>
                 </div>
                 
                 <!-- Dynamic Message for Night vs Day -->
                 <p v-if="weather && weather.isDaytime === false" class="text-[10px] text-blue-200 mt-2 flex items-center gap-1">
                    <span class="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>
                    It is currently night time. Efficiency is 0%.
                 </p>
                 <p v-else class="text-[10px] text-blue-200 mt-2">
                    Based on cloud cover ({{ weather?.clouds || 0 }}%) and temperature.
                 </p>
             </div>
        </div>
      </div>

      <!-- Savings & Impact -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3">
        <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white lg:col-span-1 print:text-black print:bg-none print:border print:border-gray-200">
          <h3 class="text-lg font-bold mb-2 flex items-center gap-2">
             <CurrencyDollarIcon class="w-6 h-6" /> Total Savings
          </h3>
          <p class="text-4xl font-extrabold mb-1">₱{{ impactStats.savingsValue }}</p>
          <p class="text-sm opacity-90">Money saved by using your own power this period.</p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2 flex items-center justify-between print:shadow-none print:border-gray-200">
           <div>
             <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Environmental Impact</h3>
             <p class="text-sm text-gray-500">Your solar panels have reduced carbon footprint significantly.</p>
             <div class="mt-4 flex gap-6">
               <div>
                 <p class="text-2xl font-bold text-emerald-600">{{ impactStats.co2Avoided }} kg</p>
                 <p class="text-xs text-gray-500 uppercase font-bold">CO2 Avoided</p>
               </div>
               <div>
                 <p class="text-2xl font-bold text-emerald-600">{{ impactStats.treesPlanted }}</p>
                 <p class="text-xs text-gray-500 uppercase font-bold">Trees Equivalent</p>
               </div>
             </div>
           </div>
           <div class="hidden md:block text-emerald-100 print:hidden">
             <svg class="w-32 h-32 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20C19,20,22,3,22,3,21,5,14,5.25,9,6.25S2,11.5,2,13.5a6.22,6.22,0,0,0,1.75,3.75C7,13,11,9,17,8Z"/></svg>
           </div>
        </div>
      </div>

    </div>

    <Footer class="print:hidden" />
  </div>
</template>

<script setup>
import { useSolarPanel } from '@/composables/useSolarPanel.js';
import { CurrencyDollarIcon } from '@heroicons/vue/24/outline';

// Components
import UserHeader from "@/components/ReusableComponents/UserHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";

const {
  timeFilters,
  activeFilter,
  loading,
  error,
  weather,
  solarEfficiency,
  calculatedMetrics,
  impactStats,
  handleExport
} = useSolarPanel();
</script>

<style scoped>
@media print {
  button, nav, footer, .print\:hidden {
    display: none !important;
  }
  
  .bg-white, .dark\:bg-gray-800 {
    background-color: white !important;
    color: black !important;
    box-shadow: none !important;
    border: 1px solid #eee !important;
  }

  body {
    background-color: white !important;
  }
}
</style>
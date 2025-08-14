<template>
  <div class="container max-w-full p-4 mx-auto font-poppins lg:px-12">

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
      <!-- Left: Search + Filter -->
      <div class="flex items-center gap-3 w-full sm:w-[70%]">
        <div class="relative flex-grow">
          <img
            src="/src/Images/icons/search.svg"
            alt="Search Icon"
            class="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2"
          />
          <input
            type="text"
            placeholder="Search"
            class="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:outline-none focus:ring-[#A7F3D0]"
          />
        </div>

        <!-- Filter -->
        <div class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <img src="/src/Images/icons/filter.svg" alt="Filter Icon" class="w-5 h-5" />
          <span>Filter</span>
        </div>
      </div>

      <!-- Right: Button -->
      <div class="w-full sm:w-auto">
        <button
          @click="startScanning"
          class="w-full sm:w-auto bg-[#2C993A] text-white px-4 py-2 rounded-full text-sm"
        >
          + Add Appliance
        </button>
      </div>
    </div>



    <!-- Scanning Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-2">Looking for nearby devices</h2>
        <p class="text-gray-600 mb-6">Scanning for available connections...</p>
        
        <!-- Circular Wave Animation -->
        <div class="flex justify-center items-center my-8 mt-10 h-40">
          <div class="relative w-40 h-40">
            <div 
              v-for="i in 3" 
              :key="i"
              class="absolute inset-0 rounded-full border-2 border-green-500 opacity-0"
              :class="`wave-${i}`"
              :style="{ animationDelay: `${i * 0.5}s` }"
            ></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <!-- Found Devices -->
        <div v-if="scanComplete" class="space-y-3">
          <div v-for="device in devices" :key="device.name" class="flex items-center p-3 border border-gray-200 rounded">
            <img :src="device.icon" :alt="device.name" class="w-8 h-8 mr-3">
            <div class="flex-grow text-left">
              <h3 class="font-medium">{{ device.name }}</h3>
            </div>
            <span class="text-green-600 text-sm font-medium">{{ device.status }}</span>
          </div>
        </div>
        
        <div class="mt-6 text-right">
          <button 
            @click="showModal = false" 
            class="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 mr-2"
            v-if="!scanComplete"
          >
            Cancel Scan
          </button>
          <button 
            @click="showModal = false" 
            class="px-4 py-2 text-sm bg-[#2C993A] text-white rounded hover:bg-[#248232]"
            v-if="scanComplete"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showModal: false,
      scanComplete: false,
      devices: [
        { name: 'Smart TV', status: 'Available', icon: '/src/Images/icons/tv.svg' },
        { name: 'Smart Fridge', status: 'Available', icon: '/src/Images/icons/fridge.svg' },
        { name: 'Wireless Door Lock', status: 'Available', icon: '/src/Images/icons/lock.svg' }
      ]
    };
  },
  methods: {
    startScanning() {
      this.showModal = true;
      this.scanComplete = false;
      
      // Simulate scanning for 3 seconds
      setTimeout(() => {
        this.scanComplete = true;
      }, 3000);
    }
  }
}
</script>

<style scoped>
/* Circular Wave Animation */
@keyframes sonar-wave {
  0% {
    transform: scale(0.1);
    opacity: 0.8;
  }
  70% {
    opacity: 0.3;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.wave-1 {
  animation: sonar-wave 1.5s infinite;
}
.wave-2 {
  animation: sonar-wave 1.5s infinite;
}
.wave-3 {
  animation: sonar-wave 1.5s infinite;
}

/* Center the animation properly */
.flex.justify-center.items-center {
  perspective: 1000px;
}
</style>
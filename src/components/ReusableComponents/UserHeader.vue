<template>
  <header class="sticky top-0 z-50 bg-white shadow">
    <div class="container px-4 space-x-4 mx-auto">
      <div class="flex items-center justify-between lg:gap-[10em] sm:gap-[8em]">
        <!-- Logo Section -->
        <div class="relative flex items-center lg:right-40">
          <img class="h-10 w-15" src="/src/Images/logo/energreen-logo.svg" alt="logo">
          <h1 class="text-2xl font-bold m-0 p-0 font-poppins text-[#059669]">
            Ener<span class="text-[#0D2535]">Green</span>
          </h1>
        </div>

        <!-- Mobile Menu Button -->
        <div class="flex items-center gap-3 md:hidden">
          <div class="relative">
            <img 
              @click.stop="toggleNotifications" 
              class="w-5 h-5 cursor-pointer" 
              src="/src/Images/icons/notification.svg" 
              alt="Notifications"
            />
            <Notification v-if="showNotifications" :isMobile="true" @click.stop />
          </div>
          <img 
            @click="navigateTo('Profile')" 
            class="w-8 h-8 cursor-pointer rounded-full object-cover" 
            src="/src/Images/profile/pfp.png" 
            alt="Profile Picture"
          >
          <button @click="toggleMobileMenu" class="text-gray-700 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        <!-- Desktop Navigation -->
        <div class="absolute items-center hidden transform -translate-x-1/2 md:flex left-1/2">
          <nav id="navigation">
            <ul class="flex space-x-6 lg:space-x-12 font-poppins">
              <li>
                <button 
                  @click="navigateTo('Home')" 
                  :class="['py-2 hover:text-green-600',
                    $route.name === 'Home' ? 'text-green-600' : ''
                  ]">
                  Home
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Appliances')"
                  :class="[
                    'py-2 hover:text-green-600',
                    $route.name === 'Appliances' ? 'text-green-600 ' : ''
                  ]">                   
                  Appliances
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('SolarPanel')" 
                  :class="[
                    'py-2 hover:text-green-600',
                    $route.name === 'SolarPanel' ?'text-green-600 ' : '']">
                  Solar Panel
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('Simulation')" 
                  :class="[
                    'py-2 hover:text-green-600',
                    $route.name === 'Simulation' ? 'text-green-600' : '']">
                  Simulation
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('CarbonEmission')" 
                  :class="[
                    'py-2 hover:text-green-600',
                    $route.name === 'CarbonEmission' ? 'text-green-600' : '']">
                  Carbon Emission
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('Resources')" 
                  :class="[
                    'py-2 hover:text-green-600',
                    $route.name === 'Resources' ? 'text-green-500' : '']">
                  Resources
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Desktop Profile and Notifications -->
        <div class="relative items-center hidden space-x-2 md:flex lg:space-x-3 font-poppins lg:left-40">
          <!-- Notification with dropdown -->
          <div class="relative flex items-center">
            <img 
              @click.stop="toggleNotifications" 
              class="w-5 h-5 cursor-pointer" 
              src="/src/Images/icons/notification.svg" 
              alt="Notifications" 
            />
            <Notification v-if="showNotifications" :isMobile="false" @click.stop />
          </div>
          
          <!-- Profile with sign-out dropdown -->
          <div class="relative group flex items-center space-x-2">
            <img 
              @click="navigateTo('Profile')" 
              class="w-8 h-8 rounded-full object-cover cursor-pointer" 
              src="/src/Images/profile/pfp.png" 
              alt="Profile Picture" 
            />
            <a  @click="navigateTo('Profile')" 
               class="cursor-pointer">John Cooper</a>
            <!-- Hover Dropdown -->
            <div class="absolute flex items-center top-1 right-0 mt-8 w-32 bg-white text-[#DB2626] shadow-lg rounded-md p-2 text-sm 
            z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-200">
              <img src="/src/Images/icons/redlog.svg" alt="">
              <button @click="navigateTo('Landing')" class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="max-h-screen opacity-100"
      leave-from-class="max-h-screen opacity-100"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden"
        @click.self="toggleMobileMenu"
      >
        <div class="bg-white shadow-lg w-full absolute top-[40px] left-0">
          <div class="px-4 py-4 border-t">
            <ul class="flex flex-col space-y-4 font-poppins">
              <li>
                <button
                  @click="navigateTo('Profile')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600"
                  :class="{ 'text-green-600': $route.name === 'Profile' }"
                >
                  <img class="w-4 h-4" src="/src/Images/icons/profile1.svg" alt="">
                  Profile
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Home')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600"
                  :class="{ 'text-green-600': $route.name === 'Home' }"
                >
                  <img class="w-4 h-4" src="/src/Images/icons/home.svg" alt="">
                  Home
                </button>
              </li>

              <li>
                <button
                  @click="navigateTo('Appliances')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600"
                  :class="{ 'text-green-600': $route.name === 'Appliances' }"
                >
                  <img class="w-4 h-4" src="/src/Images/icons/appliances.svg" alt="">
                  Appliances
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('SolarPanel')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600"
                  :class="{ 'text-green-600': $route.name === 'SolarPanel' }"
                >
                  <img class="w-4 h-4" src="/src/Images/icons/solar-panel.svg" alt="">
                  Solar Panel
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Simulation')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600"
                  :class="{ 'text-green-600': $route.name === 'Simulation' }"
                >
                  <img class="w-4 h-4" src="/src/Images/icons/simulation.svg" alt="">
                  Simulation
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('CarbonEmission')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600"
                  :class="{ 'text-green-600': $route.name === 'CarbonEmission' }"
                >
                  <img class="w-4 h-4" src="/src/Images/icons/carbon-emission.svg" alt="">
                  Carbon Emission
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Resources')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600"
                  :class="{ 'text-green-500': $route.name === 'Resources' }"
                >
                  <img class="w-4 h-4" src="/src/Images/icons/resources.svg" alt="">
                  Resources
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Landing')"
                  class="flex items-center w-full gap-2 py-2 hover:text-red-600 text-[#DB2626]"
                >
                  <img class="w-4 h-4 " src="/src/Images/icons/redlog.svg" alt="">
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script>
import Notification from '../ReusableComponents/Notification.vue';

export default {
  components: {
    Notification
  },
  data() {
    return {
      isMobileMenuOpen: false,
      showNotifications: false
    }
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
    },
    navigateTo(routeName) {
      this.$router.push({ name: routeName })
      this.isMobileMenuOpen = false
      this.showNotifications = false;
    },
    closeNotifications() {
      this.showNotifications = false;
    }
  },
  mounted() {
    document.addEventListener('click', this.closeNotifications);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeNotifications);
  }
}
</script>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 50;
}

.container {
  position: relative;
  z-index: 50;
  background-color: white;
}
</style>
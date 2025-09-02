<template>
  <header class="sticky p-4 top-0 z-50 bg-white dark:bg-gray-800 shadow dark:shadow-gray-700">
    <div class="container px-4 space-x-4 mx-auto dark:bg-gray-800">
      <div class="flex items-center justify-between lg:gap-[10em] sm:gap-[8em]">
        <div class="relative flex items-center lg:right-40">
          <img class="h-10 w-15" src="/src/Images/logo/energreen-logo.svg" alt="logo">
          <h1 class="text-2xl font-bold m-0 p-0 font-poppins text-[#059669]">
            Ener<span class="text-[#0D2535] dark:text-gray-300">Green</span>
          </h1>
        </div>

        <div class="flex items-center gap-3 md:hidden">
          <div class="relative">
            <img 
              @click.stop="toggleNotifications" 
              class="w-5 h-5 cursor-pointer dark:invert" 
              src="/src/Images/icons/notification.svg" 
              alt="Notifications"
            />
            <Notification v-if="showNotifications" :isMobile="true" @click.stop />
          </div>
          <img 
            @click="navigateTo('Profile')" 
            class="w-8 h-8 cursor-pointer rounded-full object-cover" 
            :src="profilePic" 
            alt="Profile Picture"
          >
          <button @click="toggleMobileMenu" class="text-gray-700 focus:outline-none dark:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        <div class="absolute items-center dark:bg-gray-800 hidden transform -translate-x-1/2 md:flex left-1/2">
          <nav id="navigation" class="dark:bg-gray-800">
            <ul class="flex space-x-6 lg:space-x-12 font-poppins text-gray-800 dark:text-gray-100">
              <li>
                <button 
                  @click="navigateTo('Home')" 
                  :class="['py-2 hover:text-green-600 dark:hover:text-green-500',
                    $route.name === 'Home' ? 'text-green-600 dark:text-green-500' : ''
                  ]">
                  Home
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Appliances')"
                  :class="[
                    'py-2 hover:text-green-600 dark:hover:text-green-500',
                    $route.name === 'Appliances' ? 'text-green-600 dark:text-green-500' : ''
                  ]">      
                  Appliances
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('SolarPanel')" 
                  :class="[
                    'py-2 hover:text-green-600 dark:hover:text-green-500',
                    $route.name === 'SolarPanel' ?'text-green-600 dark:text-green-500' : '']">
                  Solar Panel
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('Simulation')" 
                  :class="[
                    'py-2 hover:text-green-600 dark:hover:text-green-500',
                    $route.name === 'Simulation' ? 'text-green-600 dark:text-green-500' : '']">
                  Simulation
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('CarbonEmission')" 
                  :class="[
                    'py-2 hover:text-green-600 dark:hover:text-green-500',
                    $route.name === 'CarbonEmission' ? 'text-green-600 dark:text-green-500' : '']">
                  Carbon Emission
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('Resources')" 
                  :class="[
                    'py-2 hover:text-green-600 dark:hover:text-green-500',
                    $route.name === 'Resources' ? 'text-green-500' : '']">
                  Resources
                </button>
              </li>
            </ul>
          </nav>  
        </div>

        <div class="relative items-center hidden space-x-2 md:flex lg:space-x-3 font-poppins lg:left-40">
          <button 
            @click="toggleDarkMode" 
            class="flex items-center space-x-2 py-2 px-3 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <img 
              :src="isDarkMode ? '/src/Images/icons/sun.svg' : '/src/Images/icons/moon.svg'" 
              :alt="isDarkMode ? 'sun' : 'moon'" 
              class="w-5 h-5"
            >
            <span class="font-poppins text-gray-800 dark:text-gray-100">
              {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
            </span>
          </button>
          <div class="relative flex items-center">
            <img 
              @click.stop="toggleNotifications" 
              class="w-5 h-5 cursor-pointer dark:filter dark:[filter:brightness(0)_invert(1)]" 
              src="/src/Images/icons/notification.svg" 
              alt="Notifications" 
            />
            <Notification v-if="showNotifications" :isMobile="false" @click.stop />
          </div>
          
          <div class="relative flex items-center space-x-2">
            <div @click.stop="toggleProfileDropdown" class="flex items-center space-x-2 cursor-pointer">
              <img 
                class="w-8 h-8 rounded-full object-cover" 
                :src="profilePic" 
                alt="Profile Picture" 
              />
              <a class="cursor-pointer text-gray-800 dark:text-gray-100">{{ userName }}</a>
            </div>
            
            <transition
              enter-active-class="transition duration-100 ease-out"
              leave-active-class="transition duration-75 ease-in"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
            <div v-if="isProfileDropdownOpen" class="absolute flex flex-col items-start top-full right-0 mt-2 w-32 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-700 rounded-md text-sm z-50">
                <button @click="navigateTo('Profile')" class="flex items-center gap-2 w-full px-3 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-gray-800 dark:text-gray-100">
                    <path fill-rule="evenodd" d="M11.078 2.378a.75.75 0 0 1 .844 0 24.313 24.313 0 0 1 5.86.666c.153.033.284.116.375.245.243.332.353.766.276 1.218a.75.75 0 0 1-.375.584c-.4.225-.797.472-1.196.723a3.39 3.39 0 0 0-.498.15l-.01.004c-.31.096-.628.17-.945.234a.75.75 0 0 1-.774-.277L9.58 3.51a.75.75 0 0 1-.165-.486c-.039-.569.213-1.139.75-1.466Z" clip-rule="evenodd" />
                    <path d="m14.938 3.27-2.986 2.986a.75.75 0 0 1-.58.217h-2.12c-.22.016-.437.072-.647.164a3.368 3.368 0 0 0-1.077.728l-2.008 2.008a.75.75 0 0 1-1.06 0l-1.06-1.06a.75.75 0 0 1 0-1.06l2.008-2.008c.553-.553.94-.954 1.258-1.296.26-.282.466-.46.602-.556a3.352 3.352 0 0 0 .741-.422 2.25 2.25 0 0 0-.256-3.896c-.655-.453-1.253-1.03-1.846-1.616l-.009-.009A2.25 2.25 0 0 0 2.25 2.25v2.247L5.594 7.595a4.838 4.838 0 0 1-.95 1.127l-3.328 3.328a.75.75 0 0 0 0 1.06l1.06 1.06a.75.75 0 0 0 1.06 0l3.328-3.328c.31-.31.6-.607.868-.888l1.01-1.01c.21-.21.439-.38.683-.518.232-.128.472-.216.712-.262a.75.75 0 0 1 .453.111l2.986 2.986a.75.75 0 0 0 1.06 0l1.06-1.06a.75.75 0 0 0 0-1.06l-2.986-2.986a.75.75 0 0 1 .277-.774c.29-.11.583-.223.875-.34.254-.102.508-.207.756-.312.22-.093.435-.18.647-.257a3.344 3.344 0 0 0 1.08-.727l2.008-2.008a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1 0 1.06l-2.008 2.008a3.398 3.398 0 0 0-.728 1.077c-.092.21-.148.428-.164.647-.034.46.223.906.75 1.171Z" />
                    <path d="M18.89 12.016a24.625 24.625 0 0 1-2.176 4.793l-1.657 2.072a.75.75 0 0 1-1.129.083l-1.554-1.553a.75.75 0 0 0-1.104-.083l-1.552 1.553a.75.75 0 0 0-1.104.083L9.123 20.3c-.66.825-1.552 1.437-2.585 1.776a.75.75 0 0 1-.774-.277l-1.553-1.552c-.628.273-1.265.513-1.898.71a.75.75 0 0 1-.622-1.352l.02-.012c.389-.247.781-.497 1.177-.751a3.46 3.46 0 0 0 .524-.153l.01-.003c.338-.106.67-.233.996-.381a.75.75 0 0 1 .807.135l2.986 2.986a.75.75 0 0 0 1.06 0l1.06-1.06a.75.75 0 0 0 0-1.06l-2.986-2.986a.75.75 0 0 1 .277-.774c.29-.11.583-.223.875-.34.254-.102.508-.207.756-.312.22-.093.435-.18.647-.257a3.344 3.344 0 0 0 1.08-.727l2.008-2.008a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1 0 1.06l-2.008 2.008a3.398 3.398 0 0 0-.728 1.077c-.092.21-.148.428-.164.647-.034.46.223.906.75 1.171Z" />
                  </svg>
                  Settings
                </button>
                <button @click="signOutUser" class="flex items-center gap-2 w-full px-3 py-2 text-[#DB2626] hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <img src="/src/Images/icons/redlog.svg" class="w-4 h-4" alt="Sign Out icon">
                  Sign Out
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

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
        <div class="bg-white dark:bg-gray-800 shadow-lg w-full absolute top-[40px] left-0">
          <div class="px-4 py-4 border-t dark:border-gray-700">
            <ul class="flex flex-col space-y-4 font-poppins">
              <li>
                <button
                  @click="toggleDarkMode"
                  class="flex items-center w-full gap-2 py-2 text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500"
                >
                  <img
                    :src="isDarkMode ? '/src/Images/icons/sun.svg' : '/src/Images/icons/moon.svg'"
                    :alt="isDarkMode ? 'sun' : 'moon'"
                    class="w-4 h-4"
                  >
                  {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Profile')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-green-500"
                  :class="{ 'text-green-600 dark:text-green-500': $route.name === 'Profile' }"
                >
                  <img class="w-4 h-4 dark:filter dark:invert" src="/src/Images/icons/profile1.svg" alt="">
                  <span class="text-gray-800 dark:text-gray-100">Profile</span>
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Home')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-green-500"
                  :class="{ 'text-green-600 dark:text-green-500': $route.name === 'Home' }"
                >
                  <img class="w-4 h-4 dark:filter dark:invert" src="/src/Images/icons/home.svg" alt="">
                  <span class="text-gray-800 dark:text-gray-100">Home</span>
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Appliances')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-green-500"
                  :class="{ 'text-green-600 dark:text-green-500': $route.name === 'Appliances' }"
                >
                  <img class="w-4 h-4 dark:filter dark:invert" src="/src/Images/icons/appliances.svg" alt="">
                  <span class="text-gray-800 dark:text-gray-100">Appliances</span>
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('SolarPanel')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-green-500"
                  :class="{ 'text-green-600 dark:text-green-500': $route.name === 'SolarPanel' }"
                >
                  <img class="w-4 h-4 dark:filter dark:invert" src="/src/Images/icons/solar-panel.svg" alt="">
                  <span class="text-gray-800 dark:text-gray-100">Solar Panel</span>
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Simulation')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-green-500"
                  :class="{ 'text-green-600 dark:text-green-500': $route.name === 'Simulation' }"
                >
                  <img class="w-4 h-4 dark:filter dark:invert" src="/src/Images/icons/simulation.svg" alt="">
                  <span class="text-gray-800 dark:text-gray-100">Simulation</span>
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('CarbonEmission')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-green-500"
                  :class="{ 'text-green-600 dark:text-green-500': $route.name === 'CarbonEmission' }"
                >
                  <img class="w-4 h-4 dark:filter dark:invert" src="/src/Images/icons/carbon-emission.svg" alt="">
                  <span class="text-gray-800 dark:text-gray-100">Carbon Emission</span>
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Resources')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-green-500"
                  :class="{ 'text-green-500 dark:text-green-500': $route.name === 'Resources' }"
                >
                  <img class="w-4 h-4 dark:filter dark:invert" src="/src/Images/icons/resources.svg" alt="">
                  <span class="text-gray-800 dark:text-gray-100">Resources</span>
                </button>
              </li>
              <li>
                <button
                  @click="signOutUser"
                  class="flex items-center w-full gap-2 py-2 hover:text-red-600 text-[#DB2626]"
                >
                  <img class="w-4 h-4 " src="/src/Images/icons/redlog.svg" alt="">
                  <span class="text-gray-800 dark:text-gray-100">Sign Out</span>
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
import { useDarkMode } from "@/composables/useDarkMode.js"; // 1. Import the composable

import Notification from '../ReusableComponents/Notification.vue';
import { 
  auth, 
  db, 
  doc, 
  onAuthStateChanged,
  onSnapshot,
  signOut
} from '../../firebase.js';

export default {
  components: {
    Notification
  },

  data() {
    return {
      isMobileMenuOpen: false,
      showNotifications: false,
      isProfileDropdownOpen: false,
      userName: 'Guest',
      profilePic: '/src/Images/profile/pfp.png'
    }
  },
  setup() {
    // 4. Use the composable to get the reactive state and the toggle function.
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    
    // Return them so they can be used in the template.
    return { isDarkMode, toggleDarkMode };
  },
  methods: {
    // 5. The toggleDarkMode method is now replaced by the one from the composable.
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      if(this.showNotifications) {
        this.isProfileDropdownOpen = false;
      }
    },
    toggleProfileDropdown() {
      this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
      if(this.isProfileDropdownOpen) {
        this.showNotifications = false;
      }
    },
    navigateTo(routeName) {
      this.$router.push({ name: routeName })
      this.isMobileMenuOpen = false
      this.showNotifications = false;
      this.isProfileDropdownOpen = false;
    },
    closeDropdowns(event) {
      const notificationIcon = this.$el.querySelector('img[alt="Notifications"]');
      const profileIcon = this.$el.querySelector('.relative.flex.items-center.space-x-2');
      
      if (notificationIcon && !notificationIcon.contains(event.target) && this.showNotifications) {
        this.showNotifications = false;
      }
      
      const dropdownElement = this.$el.querySelector('.relative.flex.items-center.space-x-2 > div:last-child');
      if (profileIcon && !profileIcon.contains(event.target) && this.isProfileDropdownOpen && dropdownElement && !dropdownElement.contains(event.target)) {
        this.isProfileDropdownOpen = false;
      }
    },
    fetchUserProfile(userId) {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      try {
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`);
        onSnapshot(userProfileRef, (userProfileSnap) => {
          if (userProfileSnap.exists()) {
            const profileData = userProfileSnap.data();
            this.userName = profileData.fullName || 'Guest';
            this.profilePic = profileData.photoURL || this.profilePic;
          } else {
            console.log("No user profile found for UserHeader!");
            this.userName = 'Guest';
            this.profilePic = '/src/Images/profile/pfp.png';
          }
        }, (error) => {
          console.error("Error listening to user profile in UserHeader:", error);
          this.userName = 'Guest';
        });
      } catch (error) {
        console.error("Error setting up user profile listener in UserHeader:", error);
        this.userName = 'Guest';
      }
    },
    async signOutUser() {
      try {
        await signOut(auth);
        console.log("User signed out successfully.");
        this.$router.push({ name: 'Landing' });
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.closeDropdowns);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.fetchUserProfile(user.uid);
      } else {
        this.userName = 'Guest';
        this.profilePic = '/src/Images/profile/pfp.png';
      }
    });
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeDropdowns);
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

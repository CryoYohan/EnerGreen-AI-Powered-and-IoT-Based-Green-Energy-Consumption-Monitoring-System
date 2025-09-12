<template>
  <header class="sticky p-4 top-0 z-50 bg-white dark:bg-gray-800 shadow dark:shadow-gray-700">
    <div class="container px-4 mx-auto">
      <div class="flex items-center justify-between lg:gap-[10em] sm:gap-[8em]">
        <div class="relative flex items-center lg:right-40">
          <img class="h-10 w-15" src="/src/Images/logo/energreen-logo.svg" alt="logo">
          <h1 class="text-2xl font-bold m-0 p-0 font-poppins text-[#059669]">
            Ener<span class="text-[#0D2535] dark:text-white">Green</span>
          </h1>
        </div>

        <div class="flex items-center gap-3 md:hidden">
          <div class="relative">
            <img 
              @click.stop="toggleNotifications" 
              class="w-5 h-5 cursor-pointer dark:invert dark:filter" 
              src="/src/Images/icons/notification.svg" 
              alt="Notifications"
            />
            <Notification v-if="showNotifications" :isMobile="true" @click.stop />
          </div>
          <img 
            @click="navigateTo('AdminProfile')" 
            class="w-8 h-8 cursor-pointer rounded-full object-cover" 
            src="/src/Images/profile/pfp.png" 
            alt="Profile Picture"
          >
          <button @click="toggleMobileMenu" class="text-gray-700 dark:text-gray-300 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        <div class="absolute items-center hidden transform -translate-x-1/2 md:flex left-1/2">
          <nav id="navigation">
            <ul class="flex space-x-6 lg:space-x-12 font-poppins text-gray-800 dark:text-gray-100">
              <li>
                <button 
                  @click="navigateTo('AdminHome')" 
                  :class="['py-2 hover:text-green-600 dark:hover:text-[#059669]',
                    $route.name === 'AdminHome' ? 'text-green-600 dark:text-[#059669]' : ''
                  ]">
                  Home
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Hardware')"
                  :class="[
                    'py-2 hover:text-green-600 dark:hover:text-[#059669]',
                    $route.name === 'Hardware' ? 'text-green-600 dark:text-[#059669]' : ''
                  ]">
                  Hardware
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('UserManagement')" 
                  :class="[
                    'py-2 hover:text-green-600 dark:hover:text-[#059669]',
                    $route.name === 'UserManagement' ? 'text-green-600 dark:text-[#059669]' : '']">
                  Users
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('Monitoring')" 
                  :class="[
                    'py-2 hover:text-green-600 dark:hover:text-[#059669]',
                    $route.name === 'Monitoring' ? 'text-green-600 dark:text-[#059669]' : '']">
                  Monitoring & Analytics
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div class="relative items-center hidden space-x-2 md:flex lg:space-x-3 font-poppins lg:left-40">
          <div class="relative flex items-center">
            <button 
              @click="toggleDarkMode" 
              class="flex items-center space-x-2 py-2 px-3 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <img 
                :src="isDarkMode ? '/src/Images/icons/sun.svg' : '/src/Images/icons/moon.svg'" 
                :alt="isDarkMode ? 'sun' : 'moon'" 
                class="w-5 h-5 "
              >
              <span class="font-poppins text-gray-800 dark:text-gray-100">
                {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
              </span>
            </button>
            <img 
              @click.stop="toggleNotifications" 
              class="w-5 h-5 cursor-pointer dark:invert" 
              src="/src/Images/icons/notification.svg" 
              alt="Notifications" 
            />
            <Notification v-if="showNotifications" :isMobile="false" @click.stop />
          </div>
          
          <div class="relative group flex items-center space-x-2">
            <img 
              @click="navigateTo('AdminProfile')" 
              class="w-8 h-8 rounded-full object-cover cursor-pointer" 
              src="/src/Images/profile/pfp.png" 
              alt="Profile Picture" 
            />
            <a @click="navigateTo('AdminProfile')" 
               class="cursor-pointer text-gray-800 dark:text-gray-100">John Cooper</a>
            <div class="absolute flex items-center top-1 right-0 mt-8 w-32 bg-white dark:bg-gray-800 text-[#DB2626] shadow-lg rounded-md p-2 text-sm 
            z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-200">
              <img class="dark:invert" src="/src/Images/icons/redlog.svg" alt="">
              <button @click="navigateTo('Landing')" class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                Sign Out
              </button>
            </div>
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
        class="fixed inset-0 z-40 bg-black  dark:bg-gray-900 bg-opacity-40 dark:bg-opacity-75 md:hidden"
        @click.self="toggleMobileMenu"
      >
        <div class="bg-white dark:bg-gray-800 shadow-lg w-full absolute top-[80px] left-0">
          <div class="px-4 py-4 border-t dark:border-gray-700">
            <ul class="flex flex-col space-y-4 font-poppins text-gray-800 dark:text-gray-100">
              <li>
                <button
                  @click="navigateTo('AdminProfile')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-[#059669]"
                  :class="{ 'text-green-600 dark:text-[#059669]': $route.name === 'AdminProfile' }"
                >
                  <img class="w-4 h-4 dark:invert" src="/src/Images/icons/profile1.svg" alt="">
                  Profile
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('AdminHome')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-[#059669]"
                  :class="{ 'text-green-600 dark:text-[#059669]': $route.name === 'AdminHome' }"
                >
                  <img class="w-4 h-4 dark:invert" src="/src/Images/icons/home.svg" alt="">
                  Home
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Hardware')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-[#059669]"
                  :class="{ 'text-green-600 dark:text-[#059669]': $route.name === 'Hardware' }"
                >
                  <img class="w-4 h-4 dark:invert" src="/src/Images/icons/hardware.svg" alt="">
                  Hardware
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('UserManagement')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-[#059669]"
                  :class="{ 'text-green-600 dark:text-[#059669]': $route.name === 'UserManagement' }"
                >
                  <img class="w-4 h-4 dark:invert" src="/src/Images/icons/greenusers.svg" alt="">
                  Users
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Monitoring')"
                  class="flex items-center w-full gap-2 py-2 hover:text-green-600 dark:hover:text-[#059669]"
                  :class="{ 'text-green-600 dark:text-[#059669]': $route.name === 'Monitoring' }"
                >
                  <img class="w-4 h-4 dark:invert" src="/src/Images/icons/monitoring.svg" alt="">
                  Monitoring
                </button>
              </li>
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
                  @click="navigateTo('Landing')"
                  class="flex items-center w-full gap-2 py-2 hover:text-red-600 dark:hover:text-red-400 text-[#DB2626]"
                >
                  <img class="w-4 h-4" src="/src/Images/icons/redlog.svg" alt="">
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
import { useDarkMode } from '@/composables/useDarkMode';
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
    setup() {
    // 4. Use the composable to get the reactive state and the toggle function.
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    
    // Return them so they can be used in the template.
    return { isDarkMode, toggleDarkMode };
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
/* All the CSS here has been replaced with Tailwind utility classes in the template. */
</style>
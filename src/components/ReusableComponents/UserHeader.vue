<template>
  <header class="sticky p-4 top-0 bg-white dark:bg-gray-800 shadow dark:shadow-gray-700">
    <div class="px-4 space-x-3 ml-3 mr-3 mx-auto dark:bg-gray-800">
      <div class="flex items-center justify-between gap-8">
        <div class="flex items-center gap-5 md:hidden">
          <button @click="toggleMobileMenu" class="text-gray-700 focus:outline-none dark:text-gray-300">
            <Bars3Icon v-if="!isMobileMenuOpen" class="w-6 h-6" />
            <XMarkIcon v-else class="w-6 h-6" />
          </button>
        </div>

        <div class="relative flex m-0 sm:m-10 md:m-4 lg:m-0 items-center flex-shrink-0">
          <img class="h-8 w-12 md:h-10 md:w-15" src="/src/Images/logo/energreen-logo.svg" alt="logo">
          <h1 class="text-xl md:text-2xl font-bold m-0 p-0 font-poppins text-[#059669]">
            Ener<span class="text-[#0D2535] dark:text-gray-100">Green</span>
          </h1>
        </div>

        <div
          class="absolute w-[70%] items-center justify-center dark:bg-gray-800 hidden transform -translate-x-1/2 md:flex left-1/2">
          <nav id="navigation" class="dark:bg-gray-800">
            <ul class="flex space-x-6 mr-[13em] lg:space-x-12 font-poppins">
              <li>
                <button @click="navigateTo('Home')" :class="[
                  'py-2 transition-colors duration-200',
                  $route.name === 'Home'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  Home
                </button>
              </li>
              <li>
                <button @click="navigateTo('Forecast')" :class="[
                  'py-2 transition-colors duration-200',
                  $route.name === 'Forecast'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  Forecast
                </button>
              </li>
              <li>
                <button @click="navigateTo('Appliances')" :class="[
                  'py-2 transition-colors duration-200',
                  $route.name === 'Appliances'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  Appliances
                </button>
              </li>
              <li>
                <button @click="navigateTo('SolarPanel')" :class="[
                  'py-2 transition-colors duration-200',
                  $route.name === 'SolarPanel'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  Solar Panel
                </button>
              </li>
              <li>
                <button @click="navigateTo('Simulation')" :class="[
                  'py-2 transition-colors duration-200',
                  $route.name === 'Simulation'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  Simulation
                </button>
              </li>
              <li>
                <button @click="navigateTo('Cost')" :class="[
                  'py-2 transition-colors duration-200',
                  $route.name === 'Cost'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  Cost
                </button>
              </li>
              <li>
                <button @click="navigateTo('CarbonEmission')" :class="[
                  'py-2 transition-colors duration-200',
                  $route.name === 'CarbonEmission'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  Carbon Emission
                </button>
              </li>
              <li>
                <button @click="navigateTo('Resources')" :class="[
                  'py-2 transition-colors duration-200',
                  $route.name === 'Resources'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  Resources
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div class="relative items-center hidden space-x-2 md:flex lg:space-x-3 font-poppins flex-shrink-0">
          <button @click="openTipsModal"
            class="flex items-center space-x-2 py-2 px-3 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none text-gray-800 dark:text-gray-100">
            <LightBulbIcon class="w-5 h-5" />
            Tips
          </button>
          <button @click="toggleDarkMode"
            class="flex items-center space-x-2 py-2 px-3 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none text-gray-800 dark:text-gray-100">
            <SunIcon v-if="isDarkMode" class="w-5 h-5 text-yellow-500 " />
            <MoonIcon v-else class="w-5 h-5" />
            <span>
              {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
            </span>
          </button>
          <div class="relative flex items-center">
            <BellIcon @click.stop="toggleNotifications"
              class="w-5 h-5 cursor-pointer text-gray-800 dark:text-gray-300 focus:outline-none" />
            <span v-if="hasUnread" class="absolute -top-1 -right-1 flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <Notification v-if="showNotifications" :isMobile="false" @click.stop />
          </div>

          <div class="relative">
            <div @click.stop="toggleProfileDropdown"
              class="flex items-center space-x-2 cursor-pointer focus:outline-none">
              <img class="w-8 h-8 rounded-full object-cover" :src="profilePic" alt="Profile Picture" />
              <a class="cursor-pointer text-gray-800 dark:text-gray-100">{{ userName }}</a>
            </div>

            <transition enter-active-class="transition duration-150 ease-out"
              leave-active-class="transition duration-100 ease-in" enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100" leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95">
              <div v-if="isProfileDropdownOpen"
                class="absolute flex flex-col items-start top-full right-0 mt-2 w-32 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-700 rounded-md text-sm z-50">
                <button @click="navigateTo('Profile')"
                  class="flex items-center gap-2 w-full px-3 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded focus:outline-none">
                  <Cog6ToothIcon class="w-4 h-4" />
                  Settings
                </button>
                <button @click="signOutUser"
                  class="flex items-center gap-2 w-full px-3 py-2 text-[#DB2626] hover:bg-gray-100 dark:hover:bg-gray-700 rounded focus:outline-none">
                  <ArrowRightOnRectangleIcon class="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </transition>
          </div>
        </div>

        <div class="flex items-center gap-3 md:hidden">
          <div class="relative">
            <BellIcon @click.stop="toggleNotifications"
              class="w-5 h-5 cursor-pointer text-gray-800 dark:text-gray-300 focus:outline-none" />
            <span v-if="hasUnread" class="absolute -top-1 -right-1 flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <Notification v-if="showNotifications" :isMobile="true" @click.stop />
          </div>
          <img @click="navigateTo('Profile')"
            class="w-7 h-7 cursor-pointer rounded-full object-cover focus:outline-none" :src="profilePic"
            alt="Profile Picture" />
        </div>
      </div>
    </div>

    <transition name="drawer">
      <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[100] md:hidden">
        <div class="absolute inset-0 bg-black bg-opacity-40" @click.self="toggleMobileMenu"></div>
        <div class="absolute top-0 left-0 h-full w-3/4 max-w-xs bg-white dark:bg-gray-800 shadow-lg overflow-y-auto">
          <div class="p-4 flex justify-end sticky top-0 bg-white dark:bg-gray-800 z-10 border-b dark:border-gray-700">
            <button @click="toggleMobileMenu" class="text-gray-700 focus:outline-none dark:text-gray-300 p-1">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="px-4 py-4">
            <ul class="flex flex-col space-y-4 font-poppins">
              <li>
                <button @click="navigateTo('Profile')" :class="[
                  'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                  $route.name === 'Profile'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  <UserCircleIcon class="w-4 h-4" />
                  Profile
                </button>
              </li>
              <li>
                <button @click="navigateTo('Home')" :class="[
                  'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                  $route.name === 'Home'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  <HomeIcon class="w-4 h-4" />
                  Home
                </button>
              </li>
              <li>
                <button @click="navigateTo('Appliances')" :class="[
                  'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                  $route.name === 'Appliances'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  <CubeIcon class="w-4 h-4" />
                  Appliances
                </button>
              </li>
              <li>
                <button @click="navigateTo('Forecast')" :class="[
                  'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                  $route.name === 'Forecast'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  <SunIcon class="w-4 h-4" />
                  Forecast
                </button>
              </li>
              <li>
                <button @click="navigateTo('SolarPanel')" :class="[
                  'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                  $route.name === 'SolarPanel'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  <FireIcon class="w-4 h-4" />
                  Solar Panel
                </button>
              </li>
              <li>
                <button @click="navigateTo('Simulation')" :class="[
                  'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                  $route.name === 'Simulation'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  <LightBulbIcon class="w-4 h-4" />
                  Simulation
                </button>
              </li>
              <li>
                <button @click="navigateTo('CarbonEmission')" :class="[
                  'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                  $route.name === 'CarbonEmission'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  <CloudArrowUpIcon class="w-4 h-4" />
                  Carbon Emission
                </button>
              </li>
              <li>
                <button @click="navigateTo('Resources')" :class="[
                  'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                  $route.name === 'Resources'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                ]">
                  <BookOpenIcon class="w-4 h-4" />
                  Resources
                </button>
              </li>
              <li>
                <button @click="openTipsModal"
                  class="flex items-center w-full gap-1 py-2 text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500 transition-colors duration-200">
                  <LightBulbIcon class="w-5 h-5" />
                  Tips
                </button>
              </li>
              <li>
                <button @click="toggleDarkMode"
                  class="flex items-center w-full gap-2 py-2 text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500 transition-colors duration-200">
                  <SunIcon v-if="isDarkMode" class="w-4 h-4 text-yellow-500" />
                  <MoonIcon v-else class="w-4 h-4" />
                  {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
                </button>
              </li>
              <li>
                <button @click="signOutUser"
                  class="flex items-center w-full gap-2 py-2 text-[#DB2626] hover:text-red-600 transition-colors duration-200">
                  <ArrowRightOnRectangleIcon class="w-4 h-4" />
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </header>

  <Tips :showModal="showTipsModal" @close="showTipsModal = false" ref="tipsComponent" />
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDarkMode } from "@/composables/useDarkMode.js";
import { useAuth } from '@/composables/useAuth.js';
import { useNotifications } from '@/composables/useNotifications.js';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase.js';

// Import Heroicons
import {
  Bars3Icon, XMarkIcon, LightBulbIcon, BellIcon, SunIcon, MoonIcon, UserCircleIcon,
  Cog6ToothIcon, ArrowRightOnRectangleIcon, HomeIcon, CubeIcon, FireIcon, CloudArrowUpIcon, BookOpenIcon,
} from '@heroicons/vue/24/outline';

// Import Components
import Tips from '../UserComponents/Home/Tips.vue';
import Notification from '../ReusableComponents/Notification.vue';

// --- Composables ---
const router = useRouter();
const { isDarkMode, toggleDarkMode } = useDarkMode();
const { user, userProfile } = useAuth('default-app-id');
const userId = computed(() => user.value?.uid);
const { hasUnread } = useNotifications(userId);

// --- Local State ---
const isMobileMenuOpen = ref(false);
const showNotifications = ref(false);
const isProfileDropdownOpen = ref(false);
const showTipsModal = ref(false);
const tipsComponent = ref(null);

// --- Computed Properties for UI ---
const userName = computed(() => userProfile.value?.fullName || 'Guest');
const profilePic = computed(() => userProfile.value?.photoURL || '/src/Images/profile/pfp.png');

// --- Methods ---
const openTipsModal = async () => {
  showTipsModal.value = true;
  await nextTick();
  tipsComponent.value?.fetchAndGenerate();
};

const toggleMobileMenu = () => isMobileMenuOpen.value = !isMobileMenuOpen.value;
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) isProfileDropdownOpen.value = false;
};
const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
  if (isProfileDropdownOpen.value) showNotifications.value = false;
};
const navigateTo = (routeName) => {
  router.push({ name: routeName });
  isMobileMenuOpen.value = false;
  showNotifications.value = false;
  isProfileDropdownOpen.value = false;
};
const closeDropdowns = (event) => {
  // This logic can be simplified or refined, but keeping as is for now.
  const notificationIcon = document.querySelector('.relative > svg');
  const profileSection = document.querySelector('.relative > .flex.items-center.space-x-2');
  if (notificationIcon && !notificationIcon.contains(event.target) && showNotifications.value) {
    showNotifications.value = false;
  }
  if (profileSection && !profileSection.contains(event.target) && isProfileDropdownOpen.value) {
    isProfileDropdownOpen.value = false;
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
    router.push({ name: 'Landing' });
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  document.addEventListener('click', closeDropdowns);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdowns);
});
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

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .absolute.left-0,
.drawer-leave-active .absolute.left-0 {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from .absolute.left-0 {
  transform: translateX(-100%);
}

.drawer-enter-to .absolute.left-0 {
  transform: translateX(0);
}

.drawer-leave-from .absolute.left-0 {
  transform: translateX(0);
}

.drawer-leave-to .absolute.left-0 {
  transform: translateX(-100%);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-to,
.drawer-leave-from {
  opacity: 1;
}
</style>
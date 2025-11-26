<template>
  <header class="sticky p-4 top-0 z-50 bg-white dark:bg-gray-800 shadow dark:shadow-gray-700">
    <div class="container px-4 mx-auto">
      <div class="flex items-center justify-between lg:gap-[10em] sm:gap-[8em]">
        <!-- Mobile menu toggle (left side) -->
        <div class="flex items-center gap-3 md:hidden">
          <button @click="toggleMobileMenu" class="text-gray-700 focus:outline-none dark:text-gray-300">
            <Bars3Icon v-if="!isMobileMenuOpen" class="w-6 h-6" />
            <XMarkIcon v-else class="w-6 h-6" />
          </button>
        </div>

        <!-- Logo -->
        <div class="relative flex items-center flex-shrink-0 lg:right-40">
          <img class="h-8 w-12 md:h-10 md:w-15" src="/src/Images/logo/energreen-logo.svg" alt="logo">
          <h1 class="text-xl md:text-2xl font-bold m-0 p-0 font-poppins text-[#059669]">
            Ener<span class="text-[#0D2535] dark:text-white">Green</span>
          </h1>
        </div>

        <!-- Mobile icons (right side) -->
        <div class="flex items-center gap-3 md:hidden">
          <div class="relative">
            <BellIcon
              @click.stop="toggleNotifications"
              class="w-5 h-5 cursor-pointer text-gray-800 dark:text-gray-300 focus:outline-none" />
            <Notification v-if="showNotifications" :isMobile="true" @click.stop />
          </div>
          <img 
            @click="navigateTo('AdminProfile')" 
            class="w-7 h-7 cursor-pointer rounded-full object-cover focus:outline-none" 
            :src="profilePic" 
            alt="Profile Picture"
          >
        </div>

        <!-- Desktop nav -->
        <div class="absolute items-center hidden transform -translate-x-1/2 md:flex left-1/2">
          <nav id="navigation">
            <ul class="flex space-x-6 lg:space-x-12 font-poppins text-gray-800 dark:text-gray-100">
              <li>
                <button 
                  @click="navigateTo('AdminHome')" 
                  :class="['py-2 transition-colors duration-200',
                    $route.name === 'AdminHome' 
                      ? 'text-green-600 dark:text-green-500' 
                      : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                  ]">
                  Home
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Hardware')"
                  :class="[
                    'py-2 transition-colors duration-200',
                    $route.name === 'Hardware' 
                      ? 'text-green-600 dark:text-green-500' 
                      : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                  ]">
                  Hardware
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('UserManagement')" 
                  :class="[
                    'py-2 transition-colors duration-200',
                    $route.name === 'UserManagement' 
                      ? 'text-green-600 dark:text-green-500' 
                      : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                  ]">
                  Users
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('Monitoring')" 
                  :class="[
                    'py-2 transition-colors duration-200',
                    $route.name === 'Monitoring' 
                      ? 'text-green-600 dark:text-green-500' 
                      : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                  ]">
                  Monitoring & Analytics
                </button>
              </li>
              <li>
                <button 
                  @click="navigateTo('SalesManagement')" 
                  :class="[
                    'py-2 transition-colors duration-200',
                    $route.name === 'SalesManagement' 
                      ? 'text-green-600 dark:text-green-500' 
                      : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                  ]">
                  Sales Management
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Right side (desktop) -->
        <div class="relative items-center hidden space-x-2 md:flex lg:space-x-3 font-poppins lg:left-40">
          <!-- Dark Mode -->
          <button 
            @click="toggleDarkMode" 
            class="flex items-center space-x-2 py-2 px-3 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none text-gray-800 dark:text-gray-100"
          >
            <SunIcon v-if="isDarkMode" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
            <span>
              {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
            </span>
          </button>

          <!-- Notifications -->
          <div class="relative flex items-center">
            <BellIcon
              @click.stop="toggleNotifications"
              class="w-5 h-5 cursor-pointer text-gray-800 dark:text-gray-300 focus:outline-none" />
            <Notification v-if="showNotifications" :isMobile="false" @click.stop />
          </div>
          
          <!-- Profile dropdown -->
          <div class="relative">
            <div 
              @click.stop="toggleProfileDropdown" 
              class="flex items-center space-x-2 cursor-pointer focus:outline-none"
            >
              <img 
                class="w-8 h-8 rounded-full object-cover" 
                :src="profilePic" 
                alt="Profile Picture" 
              />
              <a class="cursor-pointer text-gray-800 dark:text-gray-100">{{ userName }}</a>
            </div>
            
            <transition
              enter-active-class="transition duration-150 ease-out"
              leave-active-class="transition duration-100 ease-in"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div 
                v-if="isProfileDropdownOpen" 
                class="absolute flex flex-col items-start top-full right-0 mt-2 w-32 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-700 rounded-md text-sm z-50"
              >
                <button 
                  @click="navigateTo('AdminProfile')" 
                  class="flex items-center gap-2 w-full px-3 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded focus:outline-none"
                >
                  <UserCircleIcon class="w-4 h-4" />
                  Profile
                </button>
                <button 
                  @click="signOutUser" 
                  class="flex items-center gap-2 w-full px-3 py-2 text-[#DB2626] hover:bg-gray-100 dark:hover:bg-gray-700 rounded focus:outline-none"
                >
                  <ArrowRightOnRectangleIcon class="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Drawer Menu -->
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
                <button
                  @click="navigateTo('AdminProfile')"
                  :class="[
                    'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                    $route.name === 'AdminProfile'
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                  ]">
                  <UserCircleIcon class="w-4 h-4" />
                  Profile
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('AdminHome')"
                  :class="[
                    'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                    $route.name === 'AdminHome'
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                  ]">
                  <HomeIcon class="w-4 h-4" />
                  Home
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Hardware')"
                  :class="[
                    'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                    $route.name === 'Hardware'
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                  ]">
                  <CpuChipIcon class="w-4 h-4" />
                  Hardware
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('UserManagement')"
                  :class="[
                    'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                    $route.name === 'UserManagement'
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                  ]">
                  <UsersIcon class="w-4 h-4" />
                  Users
                </button>
              </li>
              <li>
                <button
                  @click="navigateTo('Monitoring')"
                  :class="[
                    'flex items-center w-full gap-2 py-2 transition-colors duration-200',
                    $route.name === 'Monitoring'
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500'
                  ]">
                  <ChartBarIcon class="w-4 h-4" />
                  Monitoring & Analytics
                </button>
              </li>
              <li>
                <button
                  @click="toggleDarkMode"
                  class="flex items-center w-full gap-2 py-2 text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-500 transition-colors duration-200">
                  <SunIcon v-if="isDarkMode" class="w-4 h-4" />
                  <MoonIcon v-else class="w-4 h-4" />
                  {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
                </button>
              </li>
              <li>
                <button
                  @click="signOutUser"
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
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signOut } from 'firebase/auth';
import { useDarkMode } from "@/composables/useDarkMode.js"
import Notification from '../ReusableComponents/Notification.vue'

// Import Heroicons
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  CpuChipIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

import {
  auth,
  db,
  doc,
  onAuthStateChanged,
  onSnapshot,
} from '../../firebase.js'

// state
const isMobileMenuOpen = ref(false)
const showNotifications = ref(false)
const isProfileDropdownOpen = ref(false)
const userName = ref('Admin')
const profilePic = ref('/src/Images/profile/pfp.png')

let unsubscribeProfile = null;

const route = useRoute()
const router = useRouter()
const { isDarkMode, toggleDarkMode } = useDarkMode()

// methods
const toggleMobileMenu = () => isMobileMenuOpen.value = !isMobileMenuOpen.value
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) isProfileDropdownOpen.value = false
}
const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value
  if (isProfileDropdownOpen.value) showNotifications.value = false
}
const navigateTo = (routeName) => {
  router.push({ name: routeName })
  isMobileMenuOpen.value = false
  showNotifications.value = false
  isProfileDropdownOpen.value = false
}

// close dropdowns on outside click
const closeDropdowns = (event) => {
  const notificationIcon = document.querySelector('.relative > svg')
  const profileSection = document.querySelector('.relative.flex.items-center.space-x-2')
  if (notificationIcon && !notificationIcon.contains(event.target) && showNotifications.value) {
    showNotifications.value = false
  }
  if (profileSection && !profileSection.contains(event.target) && isProfileDropdownOpen.value) {
    isProfileDropdownOpen.value = false
  }
}

// fetch admin profile
const fetchAdminProfile = (userId) => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'
  try {
    const adminProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`)
    
    // 3. STORE THE LISTENER
    unsubscribeProfile = onSnapshot(adminProfileRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        userName.value = data.fullName || 'Admin'
        profilePic.value = data.photoURL || '/src/Images/profile/pfp.png'
      } else {
        userName.value = 'Admin'
        profilePic.value = '/src/Images/profile/pfp.png'
      }
    }, (error) => {
      console.error("Error listening to admin profile:", error)
      userName.value = 'Admin'
    })
  } catch (err) {
    console.error("Error setting up admin profile listener:", err)
    userName.value = 'Admin'
  }
}

const signOutUser = () => {
  try {
    // 1. REDIRECT FIRST.
    // This tells Vue to unmount Hardware.vue immediately.
    router.push({ name: 'Landing' }).then(() => {
      // 2. SIGN OUT SECOND.
      // This runs *after* the redirect has started and the 
      // Hardware.vue listener is gone.
      signOut(auth);
    });
  } catch (error) {
    // Note: signOut() itself rarely fails, but it's good to have.
    console.error("Error starting sign-out process:", error);
  }
}

// lifecycle
onMounted(() => {
  document.addEventListener('click', closeDropdowns)
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchAdminProfile(user.uid)
    } else {
      // IF USER LOGS OUT, CLEAN UP
      userName.value = 'Admin'
      profilePic.value = '/src/Images/profile/pfp.png'
      if (unsubscribeProfile) {
        console.log("AdminHeader logging out, stopping profile listener.");
        unsubscribeProfile();
      }
    }
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdowns)
  if (unsubscribeProfile) {
    unsubscribeProfile();
  }
})
</script>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 50;
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
<template>
  <header class="sticky p-4 top-0 z-50 bg-white dark:bg-gray-800 shadow dark:shadow-gray-700">
    <div class="container px-4 mx-auto">
      <div class="flex items-center justify-between lg:gap-[10em] sm:gap-[8em]">
        <!-- Logo -->
        <div class="relative flex items-center lg:right-40">
          <img class="h-10 w-15" src="/src/Images/logo/energreen-logo.svg" alt="logo">
          <h1 class="text-2xl font-bold m-0 p-0 font-poppins text-[#059669]">
            Ener<span class="text-[#0D2535] dark:text-white">Green</span>
          </h1>
        </div>

        <!-- Mobile menu -->
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
            @click="navigateTo('AdminProfile')" 
            class="w-8 h-8 cursor-pointer rounded-full object-cover" 
            :src="profilePic" 
            alt="Profile Picture"
          >
          <button @click="toggleMobileMenu" class="text-gray-700 dark:text-gray-300 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        <!-- Desktop nav -->
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

        <!-- Right side (desktop) -->
        <div class="relative items-center hidden space-x-2 md:flex lg:space-x-3 font-poppins lg:left-40">
          <!-- Dark Mode -->
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

          <!-- Notifications -->
          <div class="relative flex items-center">
            <img 
              @click.stop="toggleNotifications" 
              class="w-5 h-5 cursor-pointer dark:invert" 
              src="/src/Images/icons/notification.svg" 
              alt="Notifications" 
            />
            <Notification v-if="showNotifications" :isMobile="false" @click.stop />
          </div>
          
          <!-- Profile dropdown -->
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
                <button @click="navigateTo('AdminProfile')" class="flex items-center gap-2 w-full px-3 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <img class="w-4 h-4" src="/src/Images/icons/profile1.svg" alt="Profile">
                  Profile
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
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDarkMode } from "@/composables/useDarkMode.js"
import Notification from '../ReusableComponents/Notification.vue'

import {
  auth,
  db,
  doc,
  onAuthStateChanged,
  onSnapshot,
  signOut
} from '../../firebase.js'

// state
const isMobileMenuOpen = ref(false)
const showNotifications = ref(false)
const isProfileDropdownOpen = ref(false)
const userName = ref('Admin')
const profilePic = ref('/src/Images/profile/pfp.png')

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

// fetch admin profile
const fetchAdminProfile = (userId) => {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'
  try {
    const adminProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`)
    onSnapshot(adminProfileRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        userName.value = data.fullName || 'Admin'
        profilePic.value = data.photoURL || '/src/Images/profile/pfp.png'
      }
    })
  } catch (err) {
    console.error("Error fetching admin profile:", err)
  }
}

const signOutUser = async () => {
  try {
    await signOut(auth)
    router.push({ name: 'Landing' })
  } catch (error) {
    console.error("Error signing out:", error)
  }
}

// lifecycle
onMounted(() => {
  document.addEventListener('click', (event) => {
    const profileSection = document.querySelector('.relative.flex.items-center.space-x-2')
    if (profileSection && !profileSection.contains(event.target)) {
      isProfileDropdownOpen.value = false
    }
  })

  onAuthStateChanged(auth, (user) => {
    if (user) fetchAdminProfile(user.uid)
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', () => {})
})
</script>

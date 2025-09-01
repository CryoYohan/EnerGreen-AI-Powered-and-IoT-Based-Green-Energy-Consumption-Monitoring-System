<template>
  <header class="sticky p-4 top-0 z-50 p-1 bg-white shadow">
    <div class="container px-4 mx-auto">
      <div class="flex items-center justify-between">
        <!-- Logo Section -->
        <div class="flex items-center">
          <img class="h-10 w-15" src="/src/Images/logo/energreen-logo.svg" alt="logo">
          <h1 class="text-2xl font-bold m-0 p-0 font-poppins text-[#059669]">
            Ener<span class="text-[#0D2535]">Green</span>
          </h1>
        </div>

        <!-- Mobile Menu Button -->
        <button @click="toggleMenu" class="text-gray-700 md:hidden focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <!-- Desktop Navigation -->
        <div class="absolute items-center hidden transform -translate-x-1/2 md:flex left-1/2">
          <nav id="navigation">
            <ul class="flex space-x-6 lg:space-x-12 font-poppins">
              <li><button @click="scrollTo('home')" class="py-2 hover:text-green-600">Home</button></li>
              <li><button @click="scrollTo('about')" class="py-2 hover:text-green-600">About</button></li>
              <li><button @click="scrollTo('features')" class="py-2 hover:text-green-600">Features</button></li>
              <li><button @click="scrollTo('contact')" class="py-2 hover:text-green-600">Contact</button></li>
            </ul>
          </nav>
        </div>

        <!-- Auth Buttons (right side) -->
        <div class="items-center hidden space-x-4 md:flex lg:space-x-6 font-poppins">
          <button @click="openModal('login')" class="hover:text-white hover:bg-[#059669] rounded-full border px-4 lg:px-6 py-1 border-[#059669] text-[#059669] text-sm lg:text-base">
            Log-in
          </button>
          <button @click="openModal('register')" class="hover:bg-[#0D2535] rounded-full border px-4 lg:px-6 py-1 hover:border-[#0D2535] border-[#059669] text-white bg-[#059669] text-sm lg:text-base">
            Sign-up
          </button>
        </div>
      </div>

      <!-- Mobile Menu (Dropdown) with Transition -->
      <transition
        enter-active-class="transition-all duration-500 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="max-h-screen opacity-100"
        leave-from-class="max-h-screen opacity-100"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="isMenuOpen" class="overflow-hidden md:hidden">
          <div class="py-4 bg-white">
            <ul class="flex flex-col space-y-4 font-poppins">
              <div class="flex flex-row items-center gap-2 ">
                <img class="relative w-4 h-10 mb-1" src="/src/Images/icons/home.svg" alt="">
                <li><button @click="scrollTo('home'); isMenuOpen = false" class="block py-2 hover:text-green-600">Home</button></li>
              </div>
              <div class="flex flex-row items-center gap-2 ">
                <img class="w-4 h-10" src="/src/Images/icons/about.svg" alt="">
                <li><button @click="scrollTo('about'); isMenuOpen = false" class="block py-2 hover:text-green-600">About</button></li>
              </div>
              <div class="flex flex-row items-center gap-2 ">
                <img class="w-4 h-10" src="/src/Images/icons/features.svg" alt="">
                <li><button @click="scrollTo('features'); isMenuOpen = false" class="block py-2 hover:text-green-600">Features</button></li>
              </div>
              <div class="flex flex-row items-center gap-2 ">
                <img class="w-4 h-10" src="/src/Images/icons/contact.svg" alt="">
                <li><button @click="scrollTo('contact'); isMenuOpen = false" class="block py-2 hover:text-green-600">Contact</button></li>
              </div>
              <div class="flex flex-row items-center gap-2 ">
                <img class="w-4 h-10" src="/src/Images/icons/login.svg" alt="">
                <li><button @click="openModal('login')" class="block py-2 hover:text-green-600">Log-in</button></li>
              </div>
              <div class="flex flex-row items-center gap-2 ">
                <img class="w-5 h-10" src="/src/Images/icons/reg.svg" alt="">
                <li><button  @click="openModal('register')" class="relative block py-2 right-1 top-0.5 hover:text-green-600">Sign-up</button></li>
              </div>
            </ul>
          </div>
        </div>
      </transition>

      <AuthModal 
        :isOpen="modalOpen" 
        :initialMode="modalMode"
        @close="closeModal"
      />
    </div>
  </header>
</template>

<script>
import AuthModal from '@/auth/AuthModal.vue';
export default {
  components: { AuthModal },
  data() {
    return {
      isMenuOpen: false,
      modalOpen: false,
      modalMode: 'login' // 'login' or 'register'
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    openModal(mode) {
      this.modalMode = mode;
      this.modalOpen = true;
      this.isMenuOpen = false; // Close mobile menu if open
    },
    closeModal() {
      this.modalOpen = false; 
    },
    scrollTo(id) {
      const element = document.getElementById(id);
      if (element) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const offset = element.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      }
    }
  }
}
</script>
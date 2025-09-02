<template class="dark:bg-[#0D2535]" >
  <Header class="sticky top-0 z-50 shadow-sm" ref="header" />
  <div>
    <HeroSection 
      @open-login-modal="showLoginModal = true"
      @toggle-dark-mode="toggleDarkMode" 
    />
    <FloatSection class="w-full" />
    <UpperMidSection class="w-full" />
    <MidSection class="w-full" />
    <LowerMidSection class="w-full" />
    <BottomSection class="w-full" />
    <UpperFooter @open-login-modal="showLoginModal = true" />
    <Footer />
    <AuthModal 
      :isOpen="showLoginModal" 
      @close="showLoginModal = false" 
    />
  </div>
</template>

<script>
import HeroSection from '@/components/LandingComponents/HeroSection.vue';
import FloatSection from '@/components/LandingComponents/FloatSection.vue';
import UpperMidSection from '@/components/LandingComponents/UpperMidSection.vue';
import MidSection from '@/components/LandingComponents/MidSection.vue';
import LowerMidSection from '@/components/LandingComponents/LowerMidSection.vue';
import BottomSection from '@/components/LandingComponents/BottomSection.vue';
import Header from '@/components/LandingComponents/Header.vue'
import UpperFooter from '@/components/LandingComponents/UpperFooter.vue';
import Footer from '@/components/ReusableComponents/Footer.vue';
import AuthModal from '@/auth/AuthModal.vue';

export default {
  components: { 
    Header, 
    HeroSection, 
    FloatSection, 
    UpperMidSection, 
    MidSection, 
    LowerMidSection, 
    BottomSection, 
    UpperFooter, 
    Footer, 
    AuthModal 
  },
  data() {
    return {
      showLoginModal: false
    }
  },
  methods: {
    toggleDarkMode() {
      const html = document.documentElement;
      html.classList.toggle('dark');

      if (html.classList.contains('dark')) {
        localStorage.theme = 'dark';
      } else {
        localStorage.theme = 'light';
      }
    }
  },
  mounted() {
    const html = document.documentElement;
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
</script>
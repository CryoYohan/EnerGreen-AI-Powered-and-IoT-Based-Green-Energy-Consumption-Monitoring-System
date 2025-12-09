<template class="dark:bg-gray-900">
  <Header class="sticky top-0 z-50 shadow-sm" ref="header" />
  <div class="dark:bg-gray-900">
    <HeroSection 
      data-aos="fade-up"
      @open-login-modal="showLoginModal = true"
      @toggle-dark-mode="toggleDarkMode" 
    />
    <UpperMidSection class="w-full" data-aos="fade-up" data-aos-delay="200" />
    <MidSection class="w-full" data-aos="fade-up" data-aos-delay="400" />
    <LowerMidSection class="w-full" data-aos="fade-up" data-aos-delay="400" />
    <BottomSection class="w-full" data-aos="fade-up" data-aos-delay="400" />
    <AboutUs  data-aos="fade-up" data-aos-delay="400"/>
    <UpperFooter @open-login-modal="showLoginModal = true" data-aos="fade-up" />
    <Footer data-aos="fade-up" />
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
import AboutUs from '@/components/LandingComponents/AboutUs.vue';
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
    AuthModal,
    AboutUs
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
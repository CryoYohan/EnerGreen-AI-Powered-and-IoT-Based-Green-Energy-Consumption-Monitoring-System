<template>
  <div id="contact" class="w-full px-4 py-8 mt-10 bg-white sm:px-6">
    <!-- Main Content -->
    <div class="flex flex-col flex-wrap items-center justify-between gap-8 pb-8 border-b-2 border-gray-200 md:flex-row">
      <!-- Logo Section -->
      <div class="flex items-center justify-center w-full gap-2 md:w-auto md:justify-start">
        <img class="w-12 h-8 md:w-15 md:h-10" src="/src/Images/logo/energreen-logo.svg" alt="EnerGreen logo">
        <h1 class="text-xl md:text-2xl font-bold font-poppins text-[#059669]">
          Ener<span class="text-[#0D2535]">Green</span>
        </h1>
      </div>

      <!-- Address Section -->
      <div class="w-full text-center md:text-left sm:w-auto">
        <p class="mb-1 text-sm font-semibold text-gray-600 md:text-base">Address</p>
        <p class="text-sm text-gray-500 md:text-base">Level 12, Sample St<br>Syne NSW 2000</p>
      </div>

      <!-- Contact Section -->
      <div class="w-full text-center md:text-left sm:w-auto">
        <p class="mb-1 text-sm font-semibold text-gray-600 md:text-base">Contact</p>
        <p class="text-sm text-gray-500 md:text-base">+61 2 7345 6789</p>
        <p class="text-sm text-gray-500 md:text-base">sample@gmail.com</p>
      </div>

      <!-- Social Media Section -->
      <div class="flex justify-center w-full gap-3 md:gap-4 sm:w-auto">
        <a href="#" class="text-gray-500 hover:text-[#059669] transition">
          <img class="w-6 h-6 md:w-8 md:h-8" src="/src/Images/icons/facebook.svg" alt="Facebook">
        </a>
        <a href="#" class="text-gray-500 hover:text-[#059669] transition">
          <img class="w-6 h-6 md:w-8 md:h-8" src="/src/Images/icons/Instagram.svg" alt="Instagram">
        </a>
        <a href="#" class="text-gray-500 hover:text-[#059669] transition">
          <img class="w-6 h-6 md:w-8 md:h-8" src="/src/Images/icons/X.svg" alt="Twitter/X">
        </a>
        <a href="#" class="text-gray-500 hover:text-[#059669] transition">
          <img class="w-6 h-6 md:w-8 md:h-8" src="/src/Images/icons/LinkedIn.svg" alt="LinkedIn">
        </a>
      </div>
    </div>

    <!-- Bottom Legal Row -->
    <div class="flex flex-col-reverse items-center justify-between w-full gap-4 mt-6 sm:flex-row">
      <div class="text-xs text-gray-400 sm:text-sm">
        <p>© 2023 EnerGreen. All rights reserved.</p>
      </div>
      <div class="flex flex-wrap justify-center gap-2 text-gray-500 sm:gap-4">
        <a href="#" class="text-xs underline sm:text-sm">Privacy Policy</a>
        <a href="#" class="text-xs underline sm:text-sm">Terms of Service</a>
        <a href="#" class="text-xs underline sm:text-sm">Cookies Settings</a>
      </div>
    </div>
  </div>
</template>
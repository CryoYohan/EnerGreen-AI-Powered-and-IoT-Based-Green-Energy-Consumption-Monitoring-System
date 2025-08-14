<template>
  <!-- Responsive floating image gallery -->
  <div class="relative w-full">
    <!-- Container with responsive behavior -->
    <div class="relative xl:absolute top-0 xl:top-[110%] left-0 xl:left-1/2 transform xl:-translate-x-1/2 xl:-translate-y-1/2 z-10 w-full px-4 py-8 xl:py-0">
      <div class="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 lg:gap-8 xl:gap-10 w-full max-w-screen-2xl mx-auto">
        <!-- Images with responsive sizing -->
        <img 
          src="/src/Images/background/img-1.png" 
          class="w-full max-w-[320px] sm:max-w-[360px] md:max-w-[380px] lg:max-w-[420px] shadow-lg rounded-lg"
          alt="Energy solution 1"
        >
        <img 
          src="/src/Images/background/img-2.png" 
          class="w-full max-w-[320px] sm:max-w-[360px] md:max-w-[380px] lg:max-w-[420px] shadow-lg rounded-lg"
          alt="Energy solution 2"
        >
        <img 
          src="/src/Images/background/img-3.png" 
          class="w-full max-w-[320px] sm:max-w-[360px] md:max-w-[380px] lg:max-w-[420px] shadow-lg rounded-lg"
          alt="Energy solution 3"
        >
      </div>
    </div>
  </div>
</template>
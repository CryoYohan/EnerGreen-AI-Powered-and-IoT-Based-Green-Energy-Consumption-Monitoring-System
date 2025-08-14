<template>
  <div class="relative mt-20 md:mt-40 font-poppins">
    <!-- Background Image - Mobile Optimized -->
    <img class="w-full h-[40vh] md:h-[60vh] object-cover" 
         src="/src/Images/background/footer-img.png" 
         alt="Smart energy solutions">

    <!-- Content Overlay - Responsive Positioning -->
    <div class="absolute w-full px-4 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <div class="max-w-4xl mx-auto text-center">
        <!-- Responsive Heading -->
        <h1 class="text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
          Experience Smart Energy Solutions Today
        </h1>
        
        <!-- Responsive Paragraph -->
        <p class="max-w-md py-3 mx-auto text-base text-white sm:py-4 sm:text-lg md:text-xl sm:max-w-xl">
          Join us for a demo and discover how EnerGreen can transform your energy management
        </p>

        <!-- Button Group - Stacked on mobile -->
        <div class="flex flex-col justify-center gap-3 mt-4 sm:flex-row">
          <button  @click="$emit('open-login-modal')"
           class="hover:bg-[#0D2535] rounded-full border px-4 py-2 sm:px-6 sm:py-2 hover:border-[#0D2535] border-[#059669] text-white bg-[#059669] text-sm sm:text-base transition-colors">
            Sign-up
          </button>
          <button class="hover:bg-[#0D2535] rounded-full border px-4 py-2 sm:px-6 sm:py-2 hover:border-[#0D2535] border-[#059669] text-white bg-transparent sm:ml-2 text-sm sm:text-base transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
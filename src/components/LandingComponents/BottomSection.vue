<template>
  <div class="w-full flex flex-col-reverse md:flex-row gap-6 dark:bg-[#0D2535] md:gap-12 mt-20 h-auto md:h-[62.5%]">
    <!-- Image -->
    <div class="flex justify-center w-full md:w-auto md:justify-start">
      <img class="w-full md:w-[720px] h-auto md:h-[620px] object-cover" src="/src/Images/background/monitoring.png" alt="">
    </div>

    <!-- Text Block -->
    <div class="w-full md:w-[60%] flex flex-col bg-[#059669] dark:bg-[#0D2535] font-poppins justify-center px-6 md:px-32 py-8 md:py-0 gap-4 text-center md:text-left">
      <h3 class="text-lg text-white md:text-xl">Empower</h3>
      <h1 class="mb-4 font-semibold text-white" style="font-size: clamp(2rem, 5vw, 4.5rem);">
        Unlock the Future of Energy Management
      </h1>
      <p class="text-base text-white md:text-lg">
        EnerGreen provides innovative solutions for energy monitoring and savings. Experience real-time insights
        and make informed decisions to lower your energy bills.
      </p>

      <!-- Features -->
      <div class="flex flex-col gap-6 mt-6 md:flex-row md:gap-4 md:mt-4">
        <div class="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
          <img src="/src/Images/icons/Relume.svg" alt="">
          <h3 class="font-semibold text-white">Cost Savings</h3>
          <p class="text-sm text-white md:text-base">Reduce your electricity costs with smart monitoring and AI-driven insights.</p>
        </div>
        <div class="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
          <img src="/src/Images/icons/Relume.svg" alt="">
          <h3 class="font-semibold text-white">Eco Friendly</h3>
          <p class="text-sm text-white md:text-base">Lower your carbon footprint while enjoying sustainable energy solutions.</p>
        </div>
      </div>
    </div>
  </div>
</template>

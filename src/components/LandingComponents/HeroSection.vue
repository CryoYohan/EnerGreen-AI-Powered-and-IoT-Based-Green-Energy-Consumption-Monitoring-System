<template>
  <section id="home" class="w-full bg-white dark:bg-gray-900 min-h-[calc(100vh-4rem)] flex items-center">
    <div class="container h-full px-4 mx-auto sm:px-6">
      <div class="flex flex-col items-center justify-center h-full gap-4 py-12 text-center md:gap-6">
        <h1 class="text-5xl font-black md:text-7xl lg:text-9xl font-poppins dark:text-gray-100">
          <span class="text-[#0D2535] dark:text-white">Track. Save.</span> <br>
          <span class="text-[#059669]">Go Green</span>
        </h1>

        <p class="max-w-2xl mx-auto text-lg md:text-xl font-poppins text-[#0D2535] dark:text-gray-300">
          Together, small energy-saving actions lead to a greener, healthier planet for all.
        </p>

        <div class="flex flex-col gap-4 items-center">
          <button
            @click="$emit('open-login-modal')"
            class="px-8 py-3 md:px-10 md:py-4 rounded-full border-2 hover:border-[#0D2535] border-[#059669] bg-[#059669] text-white font-poppins font-bold hover:bg-[#0D2535] transition-colors dark:bg-gray-700 dark:border-gray-700 dark:hover:bg-white dark:hover:text-black dark:text-white"
          >
            Start Monitoring
          </button>
      
        </div>
      </div>
    </div>
  </section>
</template>

<script>

</script>
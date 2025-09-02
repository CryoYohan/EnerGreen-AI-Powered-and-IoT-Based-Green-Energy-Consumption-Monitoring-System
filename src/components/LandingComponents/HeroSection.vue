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
          
          <label for="theme-toggle" class="flex items-center cursor-pointer mt-4">
            <div class="relative">
              <input 
                type="checkbox" 
                id="theme-toggle" 
                class="sr-only" 
                @change="$emit('toggle-dark-mode')"
                :checked="isDarkMode"
              />
              <div class="block bg-[#0D2535] dark:bg-gray-300 w-24 h-12 rounded-full"></div>
              <span class="absolute left-1 top-1 w-10 h-10 rounded-full transition flex items-center justify-center dark:translate-x-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  :class="{'text-gray-800 dark:text-yellow-400': isDarkMode, 'text-yellow-400 dark:text-gray-800': !isDarkMode }"
                  class="w-8 h-8"
                >
                  <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM4.21 4.755a.75.75 0 0 0-1.061 0l-1.59 1.59a.75.75 0 1 0 1.06 1.06l1.59-1.59a.75.75 0 0 0 0-1.061ZM12 18a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V18a.75.75 0 0 1 .75-.75ZM5.06 17.061a.75.75 0 0 0 0 1.06l1.59 1.59a.75.75 0 1 0 1.06-1.06l-1.59-1.59a.75.75 0 0 0-1.06 0ZM18.894 18.894a.75.75 0 0 0 1.06 0l1.591-1.59a.75.75 0 1 0-1.06-1.06l-1.591 1.59a.75.75 0 0 0 0 1.06ZM12 16.5A4.501 4.501 0 0 1 8.25 12h-1.5a6 6 0 0 0 12 0h-1.5a4.501 4.501 0 0 1-3.75 4.5Z" />
                </svg>
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    isDarkMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['open-login-modal', 'toggle-dark-mode']
}
</script>
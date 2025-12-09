<template>
  <div class="container max-w-full p-10 mx-auto font-poppins space-y-4 bg-[#F9FAFB] dark:bg-gray-900">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Featured Videos</h1>
    
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 relative grid-flow-dense" id="video-container">
      
      <div 
        v-for="(video, index) in videos" 
        :key="index"
        class="video-item rounded-lg overflow-hidden shadow-md transition-all duration-300 bg-white dark:bg-gray-800"
        
        :class="{ 
          'col-span-1 sm:col-span-2 lg:col-span-3': expandedVideo === index,
          'hover:-translate-y-1 hover:shadow-xl': expandedVideo !== index
        }"
        
        :style="{ order: expandedVideo === index ? -1 : 0 }"
        
        @click="activateVideo(index)"
      >
        <div 
          class="video-wrapper w-full relative bg-black transition-all duration-500"
          :class="expandedVideo === index ? 'aspect-video h-[500px]' : 'aspect-video'"
        >
          <iframe 
            v-if="expandedVideo === index"
            class="w-full h-full"
            :src="getEmbedUrl(video.id)" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
          ></iframe>

          <div v-else class="relative w-full h-full cursor-pointer group">
            <img 
              :src="`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`" 
              class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              alt="Video thumbnail"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ video.title }}</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">{{ video.subtitle }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { useDarkMode } from "@/composables/useDarkMode.js";

export default {
  setup() {
    const { isDarkMode } = useDarkMode();
    return { isDarkMode };
  },
  data() {
    return {
      expandedVideo: null,
      videos: [
        {
          id: "4HcGYfdZOr4", 
          title: "EnerGreen Explainer Video",
          subtitle: "Take a moment to look and listen to what EnerGreen has to offer."
        },
        {
          id: "4b8x4rKiAhE", 
          title: "Energy Saving Tips",
          subtitle: "Take a moment to look and listen to Energy Saving Tips."
        },
        {
          id: "z7yDjWqAW2w", 
          title: "Top 10 Energy Saving Tips for the Office",
          subtitle: "We just love saving our customers money on their energy bills. That’s why we’ve compiled this checklist of our top 10 energy saving tips for your office. "
        }
      ]
    };
  },
  methods: {
    getEmbedUrl(videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    },
    activateVideo(index) {
      if (this.expandedVideo === index) {
        this.expandedVideo = null; // Close if clicking again
      } else {
        this.expandedVideo = index; // Set as active
        
        // Optional: Scroll the top of the container into view so the user sees the video move to top
        this.$nextTick(() => {
          document.getElementById('video-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  }
};
</script>
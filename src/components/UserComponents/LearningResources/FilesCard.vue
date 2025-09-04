<template>
  <div class="container max-w-full p-10 mx-auto font-poppins space-y-4 bg-[#F9FAFB] dark:bg-gray-900">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Downloadable Resources</h1>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 relative" id="video-container">
      <div 
        v-for="resource in resources" 
        :key="resource.title" 
        class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
      >
        <h2 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{{ resource.title }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ resource.description }}</p>
        <a 
          :href="resource.file" 
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          download
        >
          Download {{ resource.fileType }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      resources: [
        {
          title: "Energy Saving Guide",
          description: "Comprehensive guide on reducing energy consumption.",
          file: "/downloads/energy-saving-guide.pdf",
          fileType: "PDF"
        },
        {
          title: "Energy Calculator",
          description: "Excel template for calculating energy savings.",
          file: "/downloads/energy-calculator.xlsx",
          fileType: "Excel"
        },
        {
          title: "Solar ROI Presentation",
          description: "Detailed analysis of solar investment returns.",
          file: "/downloads/solar-roi-presentation.pptx",
          fileType: "PPT"
        },
        {
          title: "Solar ROI Presentation",
          description: "Detailed analysis of solar investment returns.",
          file: "/downloads/solar-roi-presentation.pptx",
          fileType: "PPT"
        },
        {
          title: "Solar ROI Presentation",
          description: "Detailed analysis of solar investment returns.",
          file: "/downloads/solar-roi-presentation.pptx",
          fileType: "PPT"
        }
      ]
    }
  }
}
</script>

<style scoped>
/* Scoped styles can be updated to include dark mode specific rules if needed,
but for Tailwind, most changes are handled directly in the template. */
.dark .shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
}
.dark .hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.7);
}
</style>
<template>
  <div class="container max-w-full p-10 mx-auto font-poppins space-y-4">
    <h1 class="text-2xl font-bold">Downloadable Resources</h1>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 relative" id="video-container">
      <!-- Resource Cards -->
      <div v-for="resource in resources" :key="resource.title" class="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 class="text-lg font-semibold mb-2">{{ resource.title }}</h2>
        <p class="text-gray-600 mb-4">{{ resource.description }}</p>
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

</style>
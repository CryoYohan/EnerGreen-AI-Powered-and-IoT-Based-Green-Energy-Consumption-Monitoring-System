<template>
  <div class="container max-w-full p-10 mx-auto font-poppins space-y-4 bg-[#F9FAFB] dark:bg-gray-900">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Downloadable Resources</h1>
    
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 relative">
      <div 
        v-for="(resource, index) in resources" 
        :key="index" 
        class="flex flex-col justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
      >
        <div>
          <h2 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{{ resource.title }}</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4 text-sm">{{ resource.description }}</p>
        </div>
        
        <a 
          :href="resource.file" 
          :download="resource.fileName"
          class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors gap-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
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
          file: "/downloads/energy-saving-guide-2022.pdf", // Matches public/downloads folder
          fileName: "energy-saving-guide-2022.pdf", // Optional: Custom name when downloaded
          fileType: "PDF"
        },
        {
          title: "Energy Calculator",
          description: "Excel template for calculating energy savings.",
          file: "/downloads/energy_savings_windows_worksheet.xls",
          fileName: "Energy_Calculator.xlsx",
          fileType: "Excel"
        },
        {
          title: "Solar ROI Presentation",
          description: "Detailed analysis of solar investment returns.",
          file: "/downloads/ROI-solar-energy.pdf",
          fileName: "Solar_ROI_Analysis.pdf",
          fileType: "PDF"
        }
      ]
    }
  }
}
</script>
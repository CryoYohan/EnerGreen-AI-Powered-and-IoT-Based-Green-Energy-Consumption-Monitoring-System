<template>
  <div class="container max-w-full p-10 mx-auto font-poppins space-y-8 bg-[#F9FAFB] dark:bg-gray-900">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Useful Links</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm dark:shadow-md dark:shadow-gray-700 bg-white dark:bg-gray-800">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Government Resources</h2>
        <ul class="space-y-4">
          <li v-for="(link, index) in governmentLinks" :key="'gov-'+index">
            <a 
              :href="link.url" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="group flex items-start gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-1 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span class="font-medium hover:underline">{{ link.title }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm dark:shadow-md dark:shadow-gray-700 bg-white dark:bg-gray-800">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Industry Resources</h2>
        <ul class="space-y-4">
          <li v-for="(link, index) in industryLinks" :key="'ind-'+index">
            <a 
              :href="link.url" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="group flex items-start gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-1 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span class="font-medium hover:underline">{{ link.title }}</span>
            </a>
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      governmentLinks: [
        { 
          title: "DOE - Philippine Energy Plan", 
          url: "https://doe.gov.ph/articles/group/plans-2?category=Energy%20Policy%20and%20Planning&display_type=Card" 
        },
        { 
          title: "DOE - National Renewable Energy Program", 
          url: "https://legacy.doe.gov.ph/national-renewable-energy-program" 
        },
        { 
          title: "DOST - Funding Renewable Innovations", 
          url: "https://www.dost.gov.ph/knowledge-resources/news/84-2024-news/3697-dost-doe-partner-to-fund-renewable-energy-innovations.html" 
        },
        { 
          title: "DOE - Energy Efficiency Overview", 
          url: "https://legacy.doe.gov.ph/energy-efficiency/overview" 
        },
        { 
          title: "DOE - Renewable Energy Developers Incentives", 
          url: "https://legacy.doe.gov.ph/re-developers" 
        }
      ],
      industryLinks: [
        { 
          title: "Solar Energy Industries Association (SEIA)", 
          url: "https://www.seia.org.au/" 
        },
        { 
          title: "Smart Energy International", 
          url: "https://www.enlit.world/" 
        },
        { 
          title: "10 Available Incentives for Using Solar Energy", 
          url: "https://solarnrg.ph/blog/available-solar-incentives/" 
        },
        { 
          title: "Philippines Solar Energy: 2040 Goal", 
          url: "https://www.pvknowhow.com/news/philippines-solar-energy-stunning-2040-goal-of-50-renewable-power/" 
        }
      ]
    }
  }
}
</script>
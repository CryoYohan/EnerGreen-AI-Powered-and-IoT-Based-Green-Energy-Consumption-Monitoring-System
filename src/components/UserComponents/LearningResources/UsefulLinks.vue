<template>
  <div class="container max-w-full p-10 mx-auto font-poppins space-y-8 bg-[#F9FAFB] dark:bg-gray-900">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Useful Links</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm dark:shadow-md dark:shadow-gray-700 bg-white dark:bg-gray-800">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Government Resources</h2>
        <ul class="space-y-3">
          <li v-for="(link, index) in governmentLinks" :key="'gov-'+index" class="flex items-center">
            <input type="checkbox" :id="'gov-'+index" class="mr-3 h-5 w-5 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 checked:bg-blue-600 checked:border-transparent focus:ring-blue-500">
            <label :for="'gov-'+index" class="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              <a :href="link.url" target="_blank" class="hover:underline">{{ link.title }}</a>
            </label>
          </li>
        </ul>
      </div>

      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm dark:shadow-md dark:shadow-gray-700 bg-white dark:bg-gray-800">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Industry Resources</h2>
        <ul class="space-y-3">
          <li v-for="(link, index) in industryLinks" :key="'ind-'+index" class="flex items-center">
            <input type="checkbox" :id="'ind-'+index" class="mr-3 h-5 w-5 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 checked:bg-blue-600 checked:border-transparent focus:ring-blue-500">
            <label :for="'ind-'+index" class="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              <a :href="link.url" target="_blank" class="hover:underline">{{ link.title }}</a>
            </label>
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
        { title: "Department of Energy – Solar Programs", url: "#" },
        { title: "Energy Efficiency Guidelines", url: "#" },
        { title: "Renewable Energy Incentives", url: "#" }
      ],
      industryLinks: [
        { title: "Solar Energy Industries Association", url: "#" },
        { title: "Smart Energy International", url: "#" },
        { title: "Energy Storage Association", url: "#" }
      ]
    }
  }
}
</script>
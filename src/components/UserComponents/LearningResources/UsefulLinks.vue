<template>
  <div class="container max-w-full p-10 mx-auto font-poppins space-y-8">
    <h1 class="text-2xl font-bold">Useful Links</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Government Resources -->
      <div class="border rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-semibold mb-4">Government Resources</h2>
        <ul class="space-y-3">
          <li v-for="(link, index) in governmentLinks" :key="'gov-'+index" class="flex items-center">
            <input type="checkbox" :id="'gov-'+index" class="mr-3 h-5 w-5">
            <label :for="'gov-'+index" class="cursor-pointer hover:text-blue-600">
              <a :href="link.url" target="_blank" class="hover:underline">{{ link.title }}</a>
            </label>
          </li>
        </ul>
      </div>

      <!-- Industry Resources -->
      <div class="border rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-semibold mb-4">Industry Resources</h2>
        <ul class="space-y-3">
          <li v-for="(link, index) in industryLinks" :key="'ind-'+index" class="flex items-center">
            <input type="checkbox" :id="'ind-'+index" class="mr-3 h-5 w-5">
            <label :for="'ind-'+index" class="cursor-pointer hover:text-blue-600">
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


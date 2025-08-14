<template>
  <div class="container max-w-full p-4 mx-auto lg:pr-12 lg:pl-12 font-poppins">
    <h1 class="text-2xl font-bold mb-6">{{ title }}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Emission Sources -->
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Emission Sources</h2>
          <span class="text-sm text-gray-500">{{ emissionSources.length }} items</span>
        </div>
        <div class="space-y-6">
          <div v-for="(source, index) in emissionSources" :key="source.id" class="flex items-center gap-4">
            <div class="w-10 text-right bg-gray-200 rounded-full p-2 flex items-center justify-center">
              <span class="font-medium text-gray-500">{{ index + 1 }}</span>
            </div>
            <div class="flex-1 flex items-center gap-4">
              <div class="w-24">
                <span class="font-medium">{{ source.name }}</span>
              </div>
              <div class="flex-1">
                <div class="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    class="h-4 rounded-full transition-all duration-300" 
                    :class="getSourceColor(source.name)"
                    :style="{ width: source.percentage + '%' }"
                  ></div>
                </div>
              </div>
              <div class="w-12 text-right">
                <span class="font-medium">{{ source.percentage }}%</span>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-4">
              <div class="w-8"></div>
              <div class="w-24">
                <span class="font-bold">Total</span>
              </div>
              <div class="flex-1">
                <div class="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    class="bg-purple-500 h-4 rounded-full transition-all duration-300" 
                    :style="{ width: totalPercentage + '%' }"
                  ></div>
                </div>
              </div>
              <div class="w-12 text-right">
                <span class="font-bold">{{ totalPercentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Emission Tips -->
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Emission Reduction Tips</h2>
          <span class="text-sm text-gray-500">{{ tips.length }} items</span>
        </div>
        <ul class="space-y-4">
          <li v-for="(tip, index) in tips" :key="tip.id" class="flex gap-3">
            <span class="font-medium text-gray-500 w-10 bg-gray-200 rounded-full p-2 flex items-center justify-center">{{ index + 1 }}</span>
            <div>
              <p class="font-medium">{{ tip.title }}</p>
              <p class="text-sm text-gray-600">{{ tip.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Emission Dashboard'
    },
    emissionSources: {
      type: Array,
      required: true
    },
    tips: {
      type: Array,
      required: true
    }
  },
  computed: {
    totalPercentage() {
      if (this.emissionSources.length === 0) return 0;
      const sum = this.emissionSources.reduce((total, source) => total + source.percentage, 0);
      return Math.round(sum / this.emissionSources.length);
    }
  },
  methods: {
    getSourceColor(name) {
      const colors = {
        'Air Conditioning': 'bg-[#EF4444]',
        'Lighting': 'bg-[#F59E0B]',
        'Electronics': 'bg-[#3B82F6]'
      };
      return colors[name] || 'bg-gray-500';
    }
  }
};
</script>

<template>
  <div class="container max-w-full p-4 mx-auto lg:pr-12 lg:pl-12 font-poppins">
    <div class="w-full p-6 bg-white rounded-md shadow">
      <h2 class="mb-4 text-xl font-bold text-gray-800">
        Energy Saving Tips
      </h2>
      <div
        v-for="(tip, index) in tips"
        :key="index"
        class="flex items-center gap-4 p-4 bg-[#F9FAFB]"
      >
        <div>
          <img :class="tip.sizeClasses" :src="tip.icon" alt="" />
        </div>
        <div>
          <h3 class="font-bold">{{ tip.title }}</h3>
          <p class="text-sm text-gray-500">
            {{ tip.definition }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tips: [
        {
          icon: '/src/Images/icons/bulb.svg',
          title: 'Switch to LED Bulbs',
          definition:
            'Your air conditioner is using more power than usual. Try adjusting the temperature or checking the unit for maintenance needs to improve efficiency.',
          sizeClasses: 'w-20 sm:w-10 md:w-10 lg:w-5'
        },
        {
          icon: '/src/Images/icons/ac.svg',
          title: 'Optimize AC Temperature',
          definition:
            'Set your air conditioner to 25°C for optimal energy efficiency and comfort.',
          sizeClasses: 'w-12 sm:w-8 md:w-5 lg:w-5'
        },
        {
          icon: '/src/Images/icons/sun.svg',
          title: 'Consumption Pattern',
          definition:
            'Based on your consumption pattern, adding 2 more solar panels could reduce your bill by 20%.',
          sizeClasses: 'w-16 sm:w-8 md:w-10 lg:w-5'
        },
      ],
    };
  },
};
</script>

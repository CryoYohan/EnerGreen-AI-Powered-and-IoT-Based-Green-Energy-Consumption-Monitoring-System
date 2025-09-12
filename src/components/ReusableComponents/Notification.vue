<template>
  <div 
    class="w-80 bg-white dark:bg-gray-800 shadow-lg dark:shadow-2xl rounded-md z-50 transition-colors duration-300" 
    :class="{'fixed left-[60px] top-12': isMobile, 'absolute right-0 top-8': !isMobile}">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center">
        <h3 class="font-bold text-gray-900 dark:text-white">Notifications</h3>
        <button class="text-sm text-green-600 dark:text-green-400 hover:underline">Mark all as read</button>
      </div>
    </div>
    <div class="max-h-96 overflow-y-auto">
      <div class="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
        <div class="flex justify-between items-start">
          <span class="font-bold text-gray-900 dark:text-white">Energy Tip of the Day</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">Now</span>
        </div>
        <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">Switch off appliances at the socket when not in use to save power.</p>
      </div>
      
      <div class="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
        <div class="flex justify-between items-start">
          <span class="font-bold text-gray-900 dark:text-white">Solar Performance Update</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</span>
        </div>
        <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">Your solar panels generated 12.4 kWh today — great job saving energy!</p>
      </div>
      
      <div class="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
        <div class="flex justify-between items-start">
          <span class="font-bold text-gray-900 dark:text-white">High Usage Alert</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">5 days ago</span>
        </div>
        <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">Your energy usage spiked by 20% compared to last week.</p>
      </div>
      
      <div class="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
        <div class="flex justify-between items-start">
          <span class="font-bold text-gray-900 dark:text-white">Maintenance Reminder</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">3 weeks ago</span>
        </div>
        <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">Don't forget to clean your AC filters this April 12 to keep it energy efficient.</p>
      </div>
      
      <div class="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
        <div class="flex justify-between items-start">
          <span class="font-bold text-gray-900 dark:text-white">Energy Goal Achieved</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">A month ago</span>
        </div>
        <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">Congratulations! You reduced your energy usage by 15% last month.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isMobile: {
      type: Boolean,
      default: false
    }
  }
}
</script>
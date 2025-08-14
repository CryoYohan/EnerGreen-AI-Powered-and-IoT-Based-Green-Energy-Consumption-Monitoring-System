<template>
  <div class="w-80 bg-white shadow-lg rounded-md z-50" 
       :class="{'fixed left-[60px] top-12': isMobile, 'absolute right-0 top-8': !isMobile}">
    <div class="p-4 border-b">
      <div class="flex justify-between items-center">
        <h3 class="font-bold">Notifications</h3>
        <button class="text-sm text-green-600 hover:underline">Mark all as read</button>
      </div>
    </div>
    <div class="max-h-96 overflow-y-auto">
      <div class="p-3 border-b hover:bg-gray-50 cursor-pointer">
        <div class="flex justify-between items-start">
          <span class="font-bold">Energy Tip of the Day</span>
          <span class="text-xs text-gray-500">Now</span>
        </div>
        <p class="text-sm mt-1">Switch off appliances at the socket when not in use to save power.</p>
      </div>
      
      <div class="p-3 border-b hover:bg-gray-50 cursor-pointer">
        <div class="flex justify-between items-start">
          <span class="font-bold">Solar Performance Update</span>
          <span class="text-xs text-gray-500">2 minutes ago</span>
        </div>
        <p class="text-sm mt-1">Your solar panels generated 12.4 kWh today — great job saving energy!</p>
      </div>
      
      <div class="p-3 border-b hover:bg-gray-50 cursor-pointer">
        <div class="flex justify-between items-start">
          <span class="font-bold">High Usage Alert</span>
          <span class="text-xs text-gray-500">5 days ago</span>
        </div>
        <p class="text-sm mt-1">Your energy usage spiked by 20% compared to last week.</p>
      </div>
      
      <div class="p-3 border-b hover:bg-gray-50 cursor-pointer">
        <div class="flex justify-between items-start">
          <span class="font-bold">Maintenance Reminder</span>
          <span class="text-xs text-gray-500">3 weeks ago</span>
        </div>
        <p class="text-sm mt-1">Don't forget to clean your AC filters this April 12 to keep it energy efficient.</p>
      </div>
      
      <div class="p-3 hover:bg-gray-50 cursor-pointer">
        <div class="flex justify-between items-start">
          <span class="font-bold">Energy Goal Achieved</span>
          <span class="text-xs text-gray-500">A month ago</span>
        </div>
        <p class="text-sm mt-1">Congratulations! You reduced your energy usage by 15% last month.</p>
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
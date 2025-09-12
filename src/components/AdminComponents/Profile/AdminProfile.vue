<template>
  <div class="w-full max-w-7xl mx-auto p-8 mt-5 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold dark:text-white">Profile Information</h1>
    </div>

    <div class="flex items-start flex items-center gap-6 mb-8">
      <div>
        <img src="/src/Images/Profile/pfp.png" 
          alt="Profile Picture"
          class="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700">
      </div>

      <div>
        <h2 class="text-xl font-semibold dark:text-gray-100">John Cooper</h2>
        <p class="text-gray-600 dark:text-gray-400">john.Cooper@example.com</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
        <input type="text" 
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white" 
          value="John">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
        <input type="text" 
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white" 
          value="Cooper">
      </div>
    </div>

    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
      <input type="email" 
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white" 
        value="john.Cooper@example.com">
    </div>

    <div class="border-t dark:border-gray-700 pt-8">
      <h2 class="text-xl font-semibold dark:text-gray-100 mb-6">Change Password</h2>
      
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
        <input type="password" 
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white">
      </div>

      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
        <input type="password" 
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white">
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
        <input type="password" 
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white">
      </div>

      <div class="flex justify-end space-x-4">
        <button class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
          Cancel
        </button>
        <button class="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'ProfileInformation'
}
</script>

<style scoped>
/* Custom focus styles for better accessibility */
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

html.dark input:focus {
  box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.5); /* blue-300 at 50% opacity */
}
</style>
Sir, Tapos napo!
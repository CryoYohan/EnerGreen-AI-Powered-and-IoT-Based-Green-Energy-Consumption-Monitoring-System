<template>
  <div class="w-full max-w-7xl mx-auto p-8 mt-5 bg-white rounded-lg shadow-md">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold">Profile Information</h1>
    </div>

    <div class="flex items-start flex items-center gap-6 mb-8">
      <!-- Profile Picture -->
      <div>
        <img src="/src/Images/Profile/pfp.png" 
             alt="Profile Picture"
             class="w-24 h-24 rounded-full object-cover border-2 border-gray-200">
      </div>

      <!-- Profile Header -->
      <div>
        <h2 class="text-xl font-semibold">John Cooper</h2>
        <p class="text-gray-600">john.Cooper@example.com</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
        <input type="text" 
               class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
               value="John">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
        <input type="text" 
               class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
               value="Cooper">
      </div>
    </div>

    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
      <input type="email" 
             class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
             value="john.Cooper@example.com">
    </div>

    <div class="border-t pt-8">
      <h2 class="text-xl font-semibold mb-6">Change Password</h2>
      
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
        <input type="password" 
               class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>

      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
        <input type="password" 
               class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
        <input type="password" 
               class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
      </div>

      <div class="flex justify-end space-x-4">
        <button class="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
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
</style>
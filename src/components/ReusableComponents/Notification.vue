<template>
  <div 
    class="w-80 bg-white dark:bg-gray-800 shadow-lg dark:shadow-2xl rounded-md z-50 transition-colors duration-300" 
    :class="{'fixed left-[60px] top-12': isMobile, 'absolute right-0 top-8': !isMobile}">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center">
        <h3 class="font-bold text-gray-900 dark:text-white">Notifications</h3>
        <button 
          @click="markAllAsRead" 
          :disabled="!hasUnread"
          class="text-sm text-green-600 dark:text-green-400 hover:underline disabled:text-gray-400 disabled:dark:text-gray-500 disabled:cursor-not-allowed">
          Mark all as read
        </button>
      </div>
    </div>
    <div class="max-h-96 overflow-y-auto">
      <div v-if="isLoading" class="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
      <div v-else-if="notifications.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
        You have no new notifications.
      </div>
      <div v-else>
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          class="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
          :class="{ 'bg-green-50 dark:bg-green-900/20': !notification.read }">
          <div class="flex justify-between items-start">
            <span class="font-bold text-gray-900 dark:text-white">{{ notification.title }}</span>
            <div class="flex items-center space-x-2">
                <span 
                    v-if="!notification.read" 
                    class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    Unread
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{{ formatTimeAgo(notification.createdAt) }}</span>
            </div>
          </div>
          <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">{{ notification.message }}</p>
        </div>
      </div>
    </div>

    <!-- Notification Detail Modal -->
    <div v-if="selectedNotification" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center" @click.self="selectedNotification = null">
      <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 transition-colors duration-300">
        <div class="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedNotification.title }}</h3>
          <button @click="selectedNotification = null" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="mt-2 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
          <p>{{ selectedNotification.message }}</p>
        </div>
        <div class="pt-3 text-right">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatTimeAgo(selectedNotification.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import { useNotifications } from '@/composables/useNotifications.js';

defineProps({
  isMobile: {
    type: Boolean,
    default: false
  }
});

const selectedNotification = ref(null);

// Hardcoded App ID for this component
const appId = 'default-app-id'; 

const { user } = useAuth(appId);
const userId = computed(() => user.value?.uid);

const { notifications, isLoading, hasUnread, markAllAsRead, markAsRead } = useNotifications(userId);

async function handleNotificationClick(notification) {
    selectedNotification.value = notification;
    if (!notification.read) {
        await markAsRead(notification.id);
    }
}

function formatTimeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  if (seconds < 10) return "Just now";
  
  return Math.floor(seconds) + " seconds ago";
}
</script>
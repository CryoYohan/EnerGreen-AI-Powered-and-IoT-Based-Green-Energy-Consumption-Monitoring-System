<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 font-poppins">
    <AdminHeader />
    <Heading title="Feedback Management" subtitle="Review and resolve user feedback" />

    <main class="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav class="-mb-px flex space-x-6" aria-label="Tabs">
          <button 
            @click="activeTab = 'new'"
            :class="[
              'px-3 py-2 font-medium text-sm rounded-t-md',
              activeTab === 'new' 
                ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            ]">
            New Feedback
          </button>
          <button 
            @click="activeTab = 'resolved'"
            :class="[
              'px-3 py-2 font-medium text-sm rounded-t-md',
              activeTab === 'resolved' 
                ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            ]">
            Resolved
          </button>
        </nav>
      </div>

      <!-- Loading and Error States -->
      <div v-if="isLoading" class="text-center py-10">
        <p class="text-gray-500 dark:text-gray-400">Loading feedback...</p>
      </div>
      <div v-else-if="error" class="text-center py-10">
        <p class="text-red-500 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- Feedback Tables -->
      <div v-else>
        <!-- New Feedback Table -->
        <div v-if="activeTab === 'new'">
          <div v-if="newFeedback.length === 0" class="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p class="text-gray-500 dark:text-gray-400">No new feedback.</p>
          </div>
          <div v-else class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                  <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="item in newFeedback" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ formatTimestamp(item.createdAt) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">{{ item.uid }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getTypeClass(item.type)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                          {{ item.type }}
                      </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-sm truncate">{{ item.text }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click="handleResolve(item)" class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">
                      Mark as Resolved
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Resolved Feedback Table -->
        <div v-if="activeTab === 'resolved'">
          <div v-if="resolvedFeedback.length === 0" class="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p class="text-gray-500 dark:text-gray-400">No resolved feedback.</p>
          </div>
          <div v-else class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved By</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="item in resolvedFeedback" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ formatTimestamp(item.resolvedAt) }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-sm truncate">{{ item.text }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">{{ item.uid }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">{{ item.resolvedBy }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useFeedback } from '@/composables/useFeedback.js';
import { useToast } from '@/composables/useToast.js';
import AdminHeader from '@/components/ReusableComponents/AdminHeader.vue';
import Heading from '@/components/ReusableComponents/Heading.vue';
import Footer from '@/components/ReusableComponents/Footer.vue';

const activeTab = ref('new');
const { feedback, isLoading, error, resolveFeedback } = useFeedback();
const { showToast } = useToast();

const newFeedback = computed(() => feedback.value.filter(item => !item.status || item.status === 'new'));
const resolvedFeedback = computed(() => feedback.value.filter(item => item.status === 'resolved'));

const handleResolve = async (item) => {
    const result = await resolveFeedback(item);
    if (result.success) {
        showToast('Feedback marked as resolved!', 'success');
    } else {
        showToast(`Error: ${result.error}`, 'error');
    }
};

const formatTimestamp = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getTypeClass = (type) => {
    switch (type) {
        case 'BUG': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'SUGGESTION': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'TIP': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'COMPLAINT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
    }
};
</script>

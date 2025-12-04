<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 font-poppins">
    <AdminHeader />
    <Heading title="Feedback Management" subtitle="Review and resolve user feedback" />

    <main class="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Filter Controls -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex space-x-4">
          <div>
            <label for="status-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select id="status-filter" v-model="filterStatus" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label for="type-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select id="type-filter" v-model="filterType" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="all">All Types</option>
              <option value="BUG">Bug</option>
              <option value="SUGGESTION">Suggestion</option>
              <option value="TIP">Tip</option>
              <option value="COMPLAINT">Complaint</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading and Error States -->
      <div v-if="isLoading" class="text-center py-10">
        <p class="text-gray-500 dark:text-gray-400">Loading feedback...</p>
      </div>
      <div v-else-if="error" class="text-center py-10">
        <p class="text-red-500 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- Unified Feedback Table -->
      <div v-else>
        <div v-if="filteredFeedback.length === 0" class="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p class="text-gray-500 dark:text-gray-400">No feedback matching the current filters.</p>
        </div>
        <div v-else class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved At</th>
                 <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved By</th>
                <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in filteredFeedback" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(item.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ item.status || 'new' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ formatTimestamp(item.createdAt) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">{{ item.uid }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ item.fullName || 'N/A' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getTypeClass(item.type)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ item.type }}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">{{ item.text }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ formatTimestamp(item.resolvedAt) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">{{ item.resolvedBy || 'N/A' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button v-if="!item.status || item.status === 'new'" @click="handleResolve(item)" class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">
                    Mark as Resolved
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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

const { feedback, isLoading, error, resolveFeedback } = useFeedback();
const { showToast } = useToast();

const filterStatus = ref('all');
const filterType = ref('all');

const filteredFeedback = computed(() => {
  return feedback.value.filter(item => {
    const statusMatch = filterStatus.value === 'all' || (item.status || 'new') === filterStatus.value;
    const typeMatch = filterType.value === 'all' || item.type === filterType.value;
    return statusMatch && typeMatch;
  });
});

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

const getStatusClass = (status) => {
    if (!status || status === 'new') {
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    if (status === 'resolved') {
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
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

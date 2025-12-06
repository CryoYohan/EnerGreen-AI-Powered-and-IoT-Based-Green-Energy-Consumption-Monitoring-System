<template>
  <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100 transition-colors duration-300">
    <AdminHeader />
    <Heading title="Sales & Subscriptions" subtitle="Monitor revenue from Hardware and Software" />

    <div class="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      <!-- KPI Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(metric, index) in computedKpiMetrics" :key="index" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ metric.title }}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ metric.value }}</p>
            </div>
            <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
               <component :is="metric.icon" class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-4 flex items-center gap-1">
            <component v-if="metric.trendIcon" :is="metric.trendIcon" class="w-3 h-3" :class="metric.trendColor" />
            <span :class="metric.trendColor">{{ metric.trend }}</span>
            {{ metric.description }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <!-- LEFT: Sold Hardware Log (2/3 Width) -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                <div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white">Sold Hardware</h3>
                  <p class="text-xs text-gray-500">Devices with assigned owners</p>
                </div>
            </div>
            
            <!-- Inventory Status Overview -->
            <div class="p-6 grid grid-cols-2 gap-4 text-center border-b border-gray-100 dark:border-gray-700">
                <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                  <div class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{{ soldDevices.length }}</div>
                  <div class="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mt-1">Sold / Active</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                  <div class="text-3xl font-bold text-gray-600 dark:text-gray-300">{{ inventoryDevices.length }}</div>
                  <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">In Inventory</div>
                </div>
            </div>

            <!-- Sold Device List -->
            <div class="overflow-x-auto max-h-[500px] custom-scrollbar p-0">
              <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
                  <tr>
                    <th class="px-6 py-3 font-semibold">Device ID</th>
                    <th class="px-6 py-3 font-semibold">Assigned Owner</th>
                    <th class="px-6 py-3 font-semibold">Location</th>
                    <th class="px-6 py-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr v-for="device in soldDevices" :key="device.deviceId" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td class="px-6 py-4 font-mono text-xs text-gray-500">{{ device.deviceId }}</td>
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <div class="flex items-center gap-2">
                            <UserGroupIcon class="w-4 h-4 text-gray-400" />
                            {{ device.ownerName }}
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-500 text-xs">{{ device.location || 'Unknown' }}</td>
                    <td class="px-6 py-4 text-right">
                      <span class="px-2.5 py-1 rounded-full text-xs font-bold border bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                        Sold
                      </span>
                    </td>
                  </tr>
                  <tr v-if="soldDevices.length === 0">
                    <td colspan="4" class="px-6 py-12 text-center text-gray-500 flex flex-col items-center">
                      <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-2">
                          <ShoppingCartIcon class="w-6 h-6 text-gray-400" />
                      </div>
                      No devices have been sold yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>

        <!-- RIGHT: Subscription Management (1/3 Width) -->
        <div class="lg:col-span-1 flex flex-col gap-6 h-full">
           
           <!-- Active Subscriptions List -->
           <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col flex-1 min-h-[400px]">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                 <h3 class="text-lg font-bold text-gray-900 dark:text-white">Premium Subscribers</h3>
                 <p class="text-xs text-gray-500 mt-1">Users on paid tier (₱599/mo)</p>
              </div>
              
              <div class="p-4 overflow-y-auto custom-scrollbar flex-1">
                 <div class="space-y-3">
                    <div v-for="sub in premiumUsers" :key="sub.userId" class="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all group">
                       <div class="flex items-center gap-3 overflow-hidden">
                          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                            {{ (sub.name && sub.name.length > 0) ? sub.name.charAt(0).toUpperCase() : 'U' }}
                          </div>
                          <div class="min-w-0">
                             <p class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">{{ sub.name }}</p>
                             <p class="text-[11px] text-gray-500 truncate">{{ sub.email }}</p>
                          </div>
                       </div>
                       <div class="flex flex-col items-end gap-1 flex-shrink-0">
                           <span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">PREMIUM</span>
                           <button @click="openSubModal(sub)" class="text-xs text-gray-400 hover:text-blue-600 underline decoration-blue-300 underline-offset-2">Manage</button>
                       </div>
                    </div>
                    
                    <div v-if="premiumUsers.length === 0" class="h-full flex flex-col items-center justify-center text-center py-12 opacity-60">
                        <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                            <UserGroupIcon class="w-8 h-8 text-gray-400" />
                        </div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">No Premium Users</p>
                        <p class="text-xs text-gray-500 mt-1">Subscribers will appear here.</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <!-- Revenue Insight Card -->
           <div class="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800/50 shadow-sm relative overflow-hidden flex-shrink-0">
             <div class="absolute -right-4 -top-4 w-24 h-24 bg-purple-200/20 dark:bg-purple-600/10 rounded-full blur-xl"></div>
             
             <h4 class="text-sm font-bold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                <ChartBarIcon class="w-4 h-4" /> Revenue Opportunity
             </h4>
             <p class="text-xs text-purple-700 dark:text-purple-300 leading-relaxed font-medium">
               You have <span class="font-bold text-purple-900 dark:text-white text-lg">{{ freeUsersCount }}</span> users on the Free tier.
             </p>
             <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
               Converting just <strong>5%</strong> would increase MRR by approx <span class="font-bold text-green-600 dark:text-green-400">₱{{ (freeUsersCount * 0.05 * 599).toFixed(0) }}</span>/mo.
             </p>
             
             <div class="mt-4 w-full bg-white/50 dark:bg-gray-800/50 h-1.5 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500 rounded-full" :style="{ width: Math.min((premiumUsers.length / (users.length || 1)) * 100, 100) + '%' }"></div>
             </div>
             <div class="flex justify-between mt-1">
                 <span class="text-[10px] text-gray-500">Conversion Rate</span>
                 <span class="text-[10px] font-bold text-purple-700 dark:text-purple-400">{{ ((premiumUsers.length / (users.length || 1)) * 100).toFixed(1) }}%</span>
             </div>
           </div>
        </div>

      </div>
    </div>

    <Footer />

    <!-- Notification Toast -->
    <transition name="fade">
      <div v-if="popup.show" 
           class="fixed top-24 right-5 z-[100] px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-white/10 backdrop-blur-md bg-gray-900 text-white">
        <span class="font-medium text-sm">{{ popup.message }}</span>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import Swal from "sweetalert2";
import { useSalesAnalytics } from "@/composables/useSalesAnalytics.js";

import Heading from "@/components/ReusableComponents/Heading.vue";
import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import { CurrencyDollarIcon, UserGroupIcon, ChartBarIcon, ShoppingCartIcon } from '@heroicons/vue/24/outline';

const {
  users,
  popup,
  soldDevices,
  inventoryDevices,
  premiumUsers,
  freeUsersCount,
  
  initSalesListeners,
  cleanupSalesListeners,
  updateUserSubscription
} = useSalesAnalytics();

onMounted(() => {
  initSalesListeners();
});

onUnmounted(() => {
  cleanupSalesListeners();
});

// View-Specific Computed Props (Metrics)
const computedKpiMetrics = computed(() => {
  const hardwareRevenue = soldDevices.value.length * 4999;
  const monthlyRevenue = premiumUsers.value.length * 599;

  return [
    { 
        title: 'Monthly Recurring (MRR)', 
        value: `₱${monthlyRevenue.toLocaleString()}`, 
        icon: CurrencyDollarIcon, 
        description: 'From active subscriptions',
        trendColor: 'text-gray-400', trend: '', trendIcon: null
    },
    { 
        title: 'Hardware Revenue', 
        value: `₱${hardwareRevenue.toLocaleString()}`, 
        icon: ShoppingCartIcon, 
        description: `${soldDevices.value.length} Units Sold`,
        trendColor: 'text-green-600', trend: '', trendIcon: null
    },
    { 
        title: 'Active Subscribers', 
        value: premiumUsers.value.length.toString(), 
        icon: UserGroupIcon, 
        description: 'Premium tier users',
        trendColor: 'text-blue-600', trend: '', trendIcon: null
    },
    { 
        title: 'Total Users', 
        value: users.value.length.toString(), 
        icon: ChartBarIcon, 
        description: 'Total registered accounts',
        trendColor: 'text-emerald-600', trend: '', trendIcon: null
    },
  ];
});

// UI Interaction
const openSubModal = async (user) => {
    const { value: newTier } = await Swal.fire({
        title: `Manage ${user.name}`,
        text: `Current Tier: ${user.subscriptionTier || 'Free'}`,
        input: 'select',
        inputOptions: {
            'Free': 'Free Tier',
            'Premium': 'Premium Tier'
        },
        inputValue: user.subscriptionTier || 'Free',
        showCancelButton: true,
        confirmButtonText: 'Update Subscription',
        confirmButtonColor: '#059669'
    });

    if (newTier && newTier !== user.subscriptionTier) {
        await updateUserSubscription(user.userId, newTier);
    }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
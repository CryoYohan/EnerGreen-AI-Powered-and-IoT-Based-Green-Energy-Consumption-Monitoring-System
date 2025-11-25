<template>
    <div class="min-h-screen min-w-screen flex flex-col bg-[#F9FAFB] dark:bg-gray-900 font-poppins dark:text-gray-100">
        <AdminHeader />
        <Heading title="Subscription Management Dashboard"
            subtitle="Monitor your key metrics and subscription performance" />

        <!-- Key Performance Indicators -->
        <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div v-for="(metric, index) in kpiMetrics" :key="index"
                    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{{ metric.title }}</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ metric.value }}</p>
                            <div class="flex items-center">
                                <span v-if="metric.trend"
                                    :class="metric.trend.type === 'positive' ? 'text-green-600' : 'text-red-600'"
                                    class="text-sm font-medium flex items-center">
                                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path v-if="metric.trend.type === 'positive'" fill-rule="evenodd"
                                            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                            clip-rule="evenodd" />
                                        <path v-else fill-rule="evenodd"
                                            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    {{ metric.trend.value }}
                                </span>
                                <span v-else class="text-sm text-gray-500 dark:text-gray-400">{{ metric.description
                                    }}</span>
                            </div>
                        </div>
                        <div class="p-3 rounded-lg" :class="metric.iconBg">
                            <component :is="metric.icon" class="w-6 h-6" :class="metric.iconColor" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Left Column -->
                <div class="space-y-8">
                    <!-- Renewals & Expiries -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Renewals & Expiries</h3>
                        </div>
                        <div class="p-6">
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead>
                                        <tr class="border-b border-gray-200 dark:border-gray-700">
                                            <th
                                                class="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Customer</th>
                                            <th
                                                class="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Renewal Date</th>
                                            <th
                                                class="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Tier</th>
                                            <th
                                                class="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(renewal, index) in renewals" :key="index"
                                            class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750">
                                            <td class="py-3 text-sm text-gray-900 dark:text-white">{{ renewal.customer
                                                }}</td>
                                            <td class="py-3 text-sm text-gray-600 dark:text-gray-400">{{
                                                renewal.renewalDate }}</td>
                                            <td class="py-3 text-sm text-gray-600 dark:text-gray-400">{{ renewal.tier }}
                                            </td>
                                            <td class="py-3">
                                                <span
                                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                    :class="getStatusClasses(renewal.status)">
                                                    {{ renewal.status }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Gateway Status -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div class="p-6">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Gateway Status
                            </h3>
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-2xl font-bold text-gray-900 dark:text-white">98.5%</span>
                                <span class="text-sm text-green-600 font-medium">+0.2%</span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Success rate (24h)</p>
                            <div class="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div class="bg-green-600 h-2 rounded-full" style="width: 98.5%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-8">
                    <!-- Installation Pipeline -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Installation Pipeline</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">Installation Pipeline (P4,999
                                projects)</p>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-4 gap-4 mb-6">
                                <div v-for="(stage, index) in pipelineStages" :key="index" class="text-center">
                                    <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ stage.count }}
                                    </div>
                                    <div class="text-xs text-gray-700 dark:text-gray-300 font-medium">{{ stage.label }}
                                    </div>
                                </div>
                            </div>

                            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Installation
                                        Revenue (LTM)</span>
                                    <span class="text-lg font-bold text-gray-900 dark:text-white">P149,970</span>
                                </div>
                                <p class="text-xs text-gray-600 dark:text-gray-300">30 installations completed</p>
                            </div>

                            <!-- Installation Status -->
                            <div>
                                <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-4">Installation Status
                                </h4>
                                <div class="space-y-3">
                                    <div v-for="(installation, index) in installations" :key="index"
                                        class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{
                                                installation.customer }}</div>
                                            <div class="text-xs text-gray-600 dark:text-gray-300">{{ installation.date
                                                }}</div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <span
                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                :class="getInstallationStatusClasses(installation.status)">
                                                {{ installation.status }}
                                            </span>
                                            <button v-if="installation.status === 'Pending Invoice'"
                                                class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                                                Generate Invoice
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pricing Override Log -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Pricing Override Log</h3>
                        </div>
                        <div class="p-6">
                            <div class="space-y-4">
                                <div v-for="(override, index) in pricingOverrides" :key="index"
                                    class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <div class="text-sm font-medium text-gray-900 dark:text-white">{{
                                            override.customer }}</div>
                                        <div class="text-xs text-gray-600 dark:text-gray-300">{{ override.reason }}
                                        </div>
                                    </div>
                                    <button
                                        class="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                        Adjust Subscription
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Footer />
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
    CurrencyDollarIcon,
    UserGroupIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline';

import Heading from "@/components/ReusableComponents/Heading.vue";
import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
// KPI Metrics Data
const kpiMetrics = ref([
    {
        title: 'Monthly Recurring Revenue',
        value: 'P89,850',
        trend: { type: 'positive', value: '+12.5% vs last month' },
        icon: CurrencyDollarIcon,
        iconBg: 'bg-green-50 dark:bg-green-900/20',
        iconColor: 'text-green-600 dark:text-green-400'
    },
    {
        title: 'Customer Lifetime Value',
        value: 'P14,397',
        description: 'Average CLV',
        icon: ChartBarIcon,
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
        title: 'Active Subscribers',
        value: '150',
        trend: { type: 'positive', value: '+8 net new this month' },
        icon: UserGroupIcon,
        iconBg: 'bg-purple-50 dark:bg-purple-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
        title: 'Churn Rate',
        value: '2.4%',
        description: 'Last 30 days',
        icon: ArrowTrendingUpIcon,
        iconBg: 'bg-orange-50 dark:bg-orange-900/20',
        iconColor: 'text-orange-600 dark:text-orange-400'
    }
]);

// Renewals Data
const renewals = ref([
    {
        customer: 'Marja Santos',
        renewalDate: 'Dec 28, 2024',
        tier: 'P599',
        status: 'Due Soon'
    },
    {
        customer: 'Juan Rodríguez',
        renewalDate: 'Dec 25, 2024',
        tier: 'P599',
        status: 'Overdue'
    },
    {
        customer: 'Ana Cruz',
        renewalDate: 'Dec 30, 2024',
        tier: 'P599',
        status: 'Active'
    }
]);

// Installation Pipeline
const pipelineStages = ref([
    { label: 'New Sales', count: 25 },
    { label: 'Scheduled', count: 20 },
    { label: 'In Progress', count: 15 },
    { label: 'Completed', count: 12 }
]);

// Installation Status
const installations = ref([
    {
        orderId: '#INS-001',
        customer: 'Roberto Silva',
        date: 'Dec 20',
        status: 'In Progress'
    },
    {
        orderId: '#INS-002',
        customer: 'Elena Torres',
        date: 'Dec 18',
        status: 'Pending Invoice'
    }
]);

// Pricing Overrides
const pricingOverrides = ref([
    {
        customer: 'Carlos Mendoza',
        reason: 'P499 (Grandfathered)'
    },
    {
        customer: 'Lisa Garcia',
        reason: 'P450 (Custom)'
    }
]);

// Status styling helpers
const getStatusClasses = (status) => {
    const classes = {
        'Due Soon': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
        'Overdue': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
        'Active': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    };
    return classes[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
};

const getInstallationStatusClasses = (status) => {
    const classes = {
        'In Progress': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        'Pending Invoice': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
    };
    return classes[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
};
</script>

<style scoped>
/* Custom styles for better dark mode support */
.bg-gray-750 {
    background-color: #374151;
}
</style>
<template>
    <div class="m-4 sm:m-5 lg:m-10 font-poppins">
        <!-- Search and Filter Section -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div class="relative w-full ">
                <input v-model="searchTerm" type="text" placeholder="Search User"
                    class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <select v-model="selectedLocation"
                    class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">All Location</option>
                    <option v-for="location in uniqueLocations" :key="location" :value="location">
                        {{ location }}
                    </option>
                </select>

                <select v-model="selectedStatus"
                    class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">All Status</option>
                    <option v-for="status in uniqueStatuses" :key="status" :value="status">
                        {{ status }}
                    </option>
                </select>

                <button
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 justify-center">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                </button>
            </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-xl shadow overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th v-for="header in headers" :key="header.key" scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {{ header.label }}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="user in filteredUsers" :key="user.userId">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {{ user.userId }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {{ user.name }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {{ user.location }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {{ user.totalDevices }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span :class="statusClasses(user.status)"
                                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                    {{ user.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 flex gap-3 whitespace-nowrap text-sm text-gray-500">
                                <button class="text-green-600 hover:text-green-900"
                                    @click="openModal(user)">View</button>
                                <button class="text-red-600 hover:text-red-900"
                                >Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal Background -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
        @click.self="closeModal">
        <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-gray-800">User Details</h2>
                <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="space-y-4">
                <div class="w-full flex items-center justify-center">
                    <img class="w-20 h-20" src="/src/Images/profile/pfp.png" alt="">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                    <input type="text" v-model="selectedUser.userId"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        readonly>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" v-model="selectedUser.name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" v-model="selectedUser.location"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total Devices</label>
                    <input type="number" v-model="selectedUser.totalDevices"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <input v-model="selectedUser.status"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">

                </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
                <button @click="closeModal"
                    class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                    Cancel
                </button>
                <button @click="removeUser"
                    class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                    Remove User
                </button>
            </div>
        </div>
    </div>

</template>

<script>
export default {
    data() {
        return {
            showModal: false,
            selectedUser: {
                userId: '',
                name: '',
                location: '',
                totalDevices: 0,
                status: ''
            },
            searchTerm: "",
            selectedLocation: "",
            selectedStatus: "",
            headers: [
                { key: "userId", label: "User ID" },
                { key: "name", label: "Name" },
                { key: "location", label: "Location" },
                { key: "totalDevices", label: "Total Devices" },
                { key: "status", label: "Status" },
                { key: "action", label: "Action" },
            ],
            users: [
                { userId: "U0001", name: "John Bake", location: "Cebu City", totalDevices: 20, status: "Active" },
                { userId: "U0002", name: "Kate Lim", location: "Manila", totalDevices: 15, status: "Active" },
                { userId: "U0003", name: "Marc Homes", location: "Davao", totalDevices: 8, status: "Inactive" },
                { userId: "U0004", name: "Efwin Smith", location: "Cebu City", totalDevices: 12, status: "Active" },
                { userId: "U0005", name: "Dianna Mae", location: "Manila", totalDevices: 5, status: "Pending" },
                { userId: "U0006", name: "Eric Ruz", location: "Cebu City", totalDevices: 18, status: "Active" },
            ]
        };
    },
    computed: {
        uniqueLocations() {
            return [...new Set(this.users.map(user => user.location))];
        },
        uniqueStatuses() {
            return [...new Set(this.users.map(user => user.status))];
        },
        filteredUsers() {
            return this.users.filter((user) => {
                const matchesSearch =
                    user.userId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    user.location.toLowerCase().includes(this.searchTerm.toLowerCase());

                const matchesLocation = this.selectedLocation === "" || user.location === this.selectedLocation;
                const matchesStatus = this.selectedStatus === "" || user.status === this.selectedStatus;

                return matchesSearch && matchesLocation && matchesStatus;
            });
        },
    },
    methods: {
        statusClasses(status) {
            return {
                'bg-green-100 text-green-800': status === 'Active',
                'bg-red-100 text-red-800': status === 'Inactive',
                'bg-yellow-100 text-yellow-800': status === 'Pending',
                'bg-blue-100 text-blue-800': status === 'Maintenance',
            };
        },
        openModal(user) {
            this.selectedUser = { ...user }; // Create a copy of the user object
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        }
    }
};
</script>

<style scoped>
/* Custom styling for the table */
table {
    min-width: 100%;
}

th,
td {
    padding: 12px 15px;
    text-align: left;
}

tr:nth-child(even) {
    background-color: #f9fafb;
}

tr:hover {
    background-color: #f3f4f6;
}
</style>
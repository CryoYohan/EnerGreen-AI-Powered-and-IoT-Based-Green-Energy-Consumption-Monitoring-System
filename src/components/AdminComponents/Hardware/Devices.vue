<template>
  <div class="m-4 sm:m-5 lg:m-10 font-poppins">
    <!-- Search and Filter Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div class="relative w-full md:w-full">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search Devices"
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <select v-model="selectedType" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Types</option>
          <option v-for="type in uniqueTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        
        <select v-model="selectedStatus" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Status</option>
          <option v-for="status in uniqueStatuses" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>
    </div>

    <!-- Devices Table -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th v-for="header in headers" :key="header.key" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ header.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="device in filteredDevices" :key="device.deviceId + device.userId">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ device.deviceId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ device.userId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ device.type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="statusClasses(device.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ device.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ device.firmware }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ device.lastSync }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchTerm: "",
      selectedType: "",
      selectedStatus: "",
      headers: [
        { key: "deviceId", label: "Device ID" },
        { key: "userId", label: "User ID" },
        { key: "type", label: "Type" },
        { key: "status", label: "Status" },
        { key: "firmware", label: "Firmware" },
        { key: "lastSync", label: "Last Sync" },
      ],
      devices: [
        { deviceId: "SP-001", userId: "U0001", type: "Smart-Plug", status: "Active", firmware: "v1.2", lastSync: "2 min ago" },
        { deviceId: "SP-001", userId: "U0001", type: "Solar Panel", status: "Offline", firmware: "v1.2", lastSync: "2 min ago" },
        { deviceId: "S-001", userId: "U0001", type: "Sensors", status: "Maintenance", firmware: "v1.2", lastSync: "2 min ago" },
        { deviceId: "SM-002", userId: "U0002", type: "Smart-Meter", status: "Active", firmware: "v1.2", lastSync: "2 min ago" },
        { deviceId: "SM-003", userId: "U0003", type: "Smart-Meter", status: "Active", firmware: "v1.2", lastSync: "2 min ago" },
      ],
    };
  },
  computed: {
    uniqueTypes() {
      return [...new Set(this.devices.map(device => device.type))];
    },
    uniqueStatuses() {
      return [...new Set(this.devices.map(device => device.status))];
    },
    filteredDevices() {
      return this.devices.filter((device) => {
        const matchesSearch =
          device.deviceId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          device.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          device.userId.toLowerCase().includes(this.searchTerm.toLowerCase());

        const matchesType = this.selectedType === "" || device.type === this.selectedType;
        const matchesStatus = this.selectedStatus === "" || device.status === this.selectedStatus;

        return matchesSearch && matchesType && matchesStatus;
      });
    },
  },
  methods: {
    statusClasses(status) {
      return {
        'bg-green-100 text-green-800': status === 'Active',
        'bg-red-100 text-red-800': status === 'Offline',
        'bg-yellow-100 text-yellow-800': status === 'Maintenance',
      };
    }
  }
};
</script>
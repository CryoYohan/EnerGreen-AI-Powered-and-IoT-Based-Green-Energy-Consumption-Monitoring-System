<template>
  <div class="container max-w-full p-10 mx-auto font-poppins">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Device Cards -->
      <div
        v-for="(device, index) in devices"
        :key="index"
        @click="openModal(device)"
        class="relative p-6 bg-white rounded-lg shadow"
      >
        <!-- Delete Icon (top-right corner) -->
        <button
          @click.stop="removeDevice(index)"
          class="absolute p-1 transition-colors rounded-full top-4 right-4 hover:bg-gray-100"
        >
          <img :src="device.delete" alt="Delete" class="w-5 h-5" />
        </button>

        <div class="space-y-2">
          <img :src="device.icon" alt="" />
          <h3 class="text-lg font-bold text-gray-800">{{ device.name }}</h3>
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm text-gray-600">{{ device.location }}</p>
            <div class="mt-2">
              <span
                class="inline-block px-2 py-1 text-xs rounded-full"
                :class="
                  device.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                "
              >
                {{ device.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mt-2 mb-4">
          <span class="text-sm text-gray-600">Today's Usage:</span>
          <span class="text-sm font-semibold">{{ device.usage }} kWh</span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="h-2.5 rounded-full"
            :class="device.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'"
            :style="{
              width: calculateProgress(device.usage, device.maxUsage) + '%',
            }"
          ></div>
        </div>
      </div>
    </div>
    <DeviceDetailsModal 
      v-if="selectedDevice"
      :device="selectedDevice"
      @close="closeModal"
    />
  </div>
</template>

<script>
import DeviceDetailsModal from '@/components/ModalComponents/DeviceDetailsModal.vue';
export default {
    components: {
    DeviceDetailsModal
  },
  data() {
    return {
      selectedDevice: null,
      devices: [
        {
          icon: "/src/images/icons/tv.svg",
          name: "Smart TV",
          location: "Living Room",
          status: "Active",
          usage: 1.2,
          maxUsage: 2.0,
          delete: "/src/images/icons/delete.svg",
        },
        {
          icon: "/src/images/icons/conditioner.svg",
          name: "Air Conditioner",
          location: "Bedroom",
          status: "Inactive",
          usage: 0.8,
          maxUsage: 3.0,
          delete: "/src/images/icons/delete.svg",
        },
        {
          icon: "/src/images/icons/ref.svg",
          name: "Refrigerator",
          location: "Kitchen",
          status: "Active",
          usage: 2.5,
          maxUsage: 3.0,
          delete: "/src/images/icons/delete.svg",
        },
        {
          icon: "/src/images/icons/ref.svg",
          name: "Refrigerator",
          location: "Kitchen",
          status: "Active",
          usage: 2.5,
          maxUsage: 3.0,
          delete: "/src/images/icons/delete.svg",
        },
      ],
    };
  },
  methods: {
    calculateProgress(usage, maxUsage) {
      const progress = (usage / maxUsage) * 100;
      return Math.min(progress, 100); // Ensure it doesn't exceed 100%
    },
    removeDevice(index) {
      this.devices.splice(index, 1);
      // In a real app, you would also call an API to delete from backend
    },
    openModal(device) {
      this.selectedDevice = device
    },
    closeModal() {
      this.selectedDevice = null
    },
    openModal(device) {
      this.selectedDevice = device;
    }
  },
};
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }
}
</style>

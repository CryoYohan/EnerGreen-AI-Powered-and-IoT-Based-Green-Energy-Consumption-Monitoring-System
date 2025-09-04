<template>
  <div class="container max-w-full p-10 mx-auto font-poppins">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

      <div
        v-for="(panel, index) in panels"
        :key="index"
        @click="openModal(panel)"
        class="relative p-6 bg-white rounded-lg dark:bg-gray-800 shadow cursor-pointer"
      >
        <!-- Delete Icon -->
        <button
          @click.stop="removePanel(index)"
          class="absolute p-1 transition-colors rounded-full top-4 right-4 hover:bg-gray-100"
        >
          <img :src="panel.delete" alt="Delete" class="w-5 h-5" />
        </button>

        <div class="space-y-2">
          <img :src="panel.icon" alt="" />
          <h3 class="text-lg font-bold dark:text-gray-200 text-gray-800">{{ panel.name }}</h3>
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm text-gray-600 dark:text-gray-200">{{ panel.location }}</p>
            <div class="mt-2">
              <span
                class="inline-block px-2 py-1 text-xs rounded-full"
                :class="panel.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'"
              >
                {{ panel.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mt-2 mb-4">
          <span class="text-sm dark:text-gray-200 text-gray-600">Today's Usage:</span>
          <span class="text-sm dark:text-gray-200 font-semibold">{{ panel.usage }} kWh</span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="h-2.5 rounded-full"
            :class="panel.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'"
            :style="{ width: calculateProgress(panel.usage, panel.maxUsage) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <PanelDetailsModal
      v-if="selectedPanel"
      :panel="selectedPanel"
      @close="closeModal"
    />
  </div>
</template>

<script>
import PanelDetailsModal from '@/components/ModalComponents/PanelDetailsModal.vue';

export default {
  components: {
    PanelDetailsModal,
  },
  data() {
    return {
      selectedPanel: null,
      panels: [
        {
          icon: "/src/images/icons/panel.svg",
          name: "Panel Array 1",
          location: "12 Panels - South facing",
          status: "Active",
          usage: 1.2,
          maxUsage: 2.0,
          delete: "/src/images/icons/delete.svg",
        },
        {
          icon: "/src/images/icons/panel.svg",
          name: "Panel Array 2",
          location: "12 Panels - North facing",
          status: "Inactive",
          usage: 0.8,
          maxUsage: 3.0,
          delete: "/src/images/icons/panel.svg",
        },
        {
          icon: "/src/images/icons/panel.svg",
          name: "Panel Array 3",
          location: "12 Panels - West facing",
          status: "Active",
          usage: 2.5,
          maxUsage: 3.0,
          delete: "/src/images/icons/delete.svg",
        },
        {
          icon: "/src/images/icons/panel.svg",
          name: "Panel Array 4",
          location: "9 Panels - East facing",
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
      return Math.min((usage / maxUsage) * 100, 100);
    },
    removePanel(index) {
      this.panels.splice(index, 1);
    },
    openModal(panel) {
      this.selectedPanel = panel;
    },
    closeModal() {
      this.selectedPanel = null;
    },
  },
};
</script>

<style scoped>
@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }
}
</style>

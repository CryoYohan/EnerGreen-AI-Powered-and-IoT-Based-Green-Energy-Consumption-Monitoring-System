<template>
  <div class="lg:mr-[4em]">
    <button 
      @click="openModal"
      class="w-full sm:w-auto bg-[#2C993A] text-white px-[100px] lg:px-4 py-2 rounded-full text-sm hover:bg-[#248531] transition-colors"
    >
      + Add Solar Panel
    </button>

    <PanelDetailsModal
      v-if="showModal"
      :panel="currentPanel"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script>
import PanelDetailsModal from '@/components/ModalComponents/PanelDetailsModal.vue';

export default {
  components: { PanelDetailsModal },
  data() {
    return {
      showModal: false,
      currentPanel: {
        panelCount: 4,
        model: 'Monocrystalline 400W',
        // Add other default values matching your modal's fields
        installation: {
          direction: 'South',
          roofType: 'Asphalt Shingles',
          angle: 30,
          shading: 'No Shading',
          date: new Date().toISOString().split('T')[0]
        }
      }
    };
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    handleSave(updatedPanel) {
      // Handle the saved panel data (add to your system)
      console.log('Saved panel:', updatedPanel);
      this.showModal = false;
      
      // You would typically:
      // 1. Add to your panels array
      // 2. Send to API
      // 3. Update state management
    }
  }
};
</script>
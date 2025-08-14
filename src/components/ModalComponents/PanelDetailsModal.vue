<template>
  <div
    v-if="panel"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="$emit('close')"
  >
    <div
      class="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto font-poppins"
    >
      <button
        @click="$emit('close')"
        class="absolute text-2xl text-gray-500 top-4 right-4 hover:text-gray-700"
      >
        &times;
      </button>

      <h2 class="mb-4 text-xl font-bold">Solar Panel Configuration</h2>

      <!-- Basic Info -->
      <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Number of Panels</label
          >
          <div class="flex items-center w-full mt-1">
            <!-- Decrement Button -->
            <button
              @click="decrement"
              class="flex items-center justify-center w-8 h-10 text-xl text-gray-600 bg-gray-100 border-2 border-gray-300 rounded-l-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              -
            </button>

            <!-- Number Input Display -->
            <input
              type="number"
              v-model="panelCount"
              readonly
              class="flex items-center justify-center w-full h-10 text-center border-t-2 border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <!-- Increment Button -->
            <button
              @click="increment"
              class="flex items-center justify-center w-8 h-10 text-xl text-gray-600 bg-gray-100 border-2 border-gray-300 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              +
            </button>
          </div>
        </div>

        <div class="relative w-full">
          <label class="block text-sm font-medium text-gray-700"
            >Panel Type</label
          >
          <div class="relative w-full">
            <select
              class="block w-full px-3 py-2 pr-8 mt-1 text-gray-500 truncate border-2 border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option disabled selected class="truncate">Select an option</option>
              <option class="truncate">Monocrystalline</option>
              <option class="truncate">Polycrystalline</option>
              <option class="truncate">Thin-Film</option>
              <option class="truncate">Passivated</option>
              <option class="truncate">Bifacial</option>
              <option class="truncate">Heterojunction(HJT)</option>
            </select>


            <!-- Dropdown icon -->
            <div
              class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
            >
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Wattage per Panel</label
          >
          <p
            class="px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md"
          >
            {{ panel.model || "No model specified" }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Installation Direction</label
          >
          <select
            class="w-full px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option class="w-[200px]" disabled selected>
              Select an option
            </option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </div>

      <!-- Installation Details -->
      <h3 class="mb-2 text-lg font-semibold text-gray-800">
        Installation Details
      </h3>
      <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Roof Type</label
          >
          <select
            class="w-full px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option class="w-[200px]" disabled selected>
              Select an option
            </option>
            <option value="Asphalt Shingles">Asphalt Shingles</option>
            <option value="Metal">Metal</option>
            <option value="Tile">Tile</option>
            <option value="Flat Roof">Flat Roof</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Roof Angle (degrees)</label
          >
          <p
            class="px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md"
          >
            30
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Shading Factor</label
          >
          <select
            class="w-full px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option class="w-[200px]" disabled selected>
              Select an option
            </option>
            <option value="No Shading">No Shading</option>
            <option value="Light Shading">
              Light Shading (Morning or Evening)
            </option>
            <option value="Partial Shading">Partial Shading (Midday)</option>
            <option value="Heavy Shading">
              Heavy Shading (Most of the Day)
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Installation Date</label
          >
          <input
            type="date"
            class="w-full px-3 py-2 mt-1 text-gray-500 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <!-- Estimated Output -->
      <h3 class="mb-2 text-lg font-semibold text-gray-800">Estimated Output</h3>
      <div
        class="grid grid-cols-1 gap-4 p-4 text-center rounded-lg bg-green-50 sm:grid-cols-3"
      >
        <div>
          <p class="text-sm text-gray-600">Daily Average</p>
          <p class="text-xl font-bold text-green-700">24 kWh</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Monthly Average</p>
          <p class="text-xl font-bold text-green-700">650 kWh</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Annual Projection</p>
          <p class="text-xl font-bold text-green-700">7,924 kWh</p>
        </div>
      </div>
      <div class="flex justify-end gap-4 mt-8">
        <button
          class="px-4 py-2 border border-gray-500 rounded-lg text-gray hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-[#059669] border border-[#059669] text-white rounded-lg hover:bg-[#047857] focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Save Configuration
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    panel: Object, // Receive device data from parent
  },
  emits: ["close", "update:panelCount"], // Declare emitted events
  data() {
    return {
      panelCount: this.panel?.panelCount || 4, // Initialize with device data or default
    };
  },
  methods: {
    increment() {
      this.panelCount++;
      this.$emit("update:panelCount", this.panelCount);
    },
    decrement() {
      if (this.panelCount > 1) {
        // Prevent going below 1 panel
        this.panelCount--;
        this.$emit("update:panelCount", this.panelCount);
      }
    },
  },
};
</script>

<style scoped>
/* Force dropdown width to match select */
select {
  min-width: 100%;
}
select option {
  white-space: normal;
  max-width: 100%;
}
</style>

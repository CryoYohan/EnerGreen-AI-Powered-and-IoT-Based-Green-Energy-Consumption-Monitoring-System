<template>
  <div
    v-if="panel"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="$emit('close')"
  >
    <div
      class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto font-poppins text-gray-900 dark:text-gray-100"
    >
      <button
        @click="$emit('close')"
        class="absolute text-2xl text-gray-500 dark:text-gray-400 top-4 right-4 hover:text-gray-700 dark:hover:text-gray-200"
      >
        &times;
      </button>

      <h2 class="mb-4 text-xl font-bold">Solar Panel Configuration</h2>

      <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Number of Panels</label
          >
          <div class="flex items-center w-full mt-1">
            <button
              @click="decrement"
              class="flex items-center justify-center w-8 h-10 text-xl text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-l-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              -
            </button>

            <input
              type="number"
              v-model="panelCount"
              readonly
              class="flex items-center justify-center w-full h-10 text-center border-t-2 border-b-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
            />

            <button
              @click="increment"
              class="flex items-center justify-center w-8 h-10 text-xl text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              +
            </button>
          </div>
        </div>

        <div class="relative w-full">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Panel Type</label
          >
          <div class="relative w-full">
            <select
              class="block w-full px-3 py-2 pr-8 mt-1 text-gray-500 dark:text-gray-400 truncate border-2 border-gray-300 dark:border-gray-600 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
            >
              <option disabled selected class="truncate">Select an option</option>
              <option class="truncate">Monocrystalline</option>
              <option class="truncate">Polycrystalline</option>
              <option class="truncate">Thin-Film</option>
              <option class="truncate">Passivated</option>
              <option class="truncate">Bifacial</option>
              <option class="truncate">Heterojunction(HJT)</option>
            </select>

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
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Wattage per Panel</label
          >
          <p
            class="px-3 py-2 mt-1 text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          >
            {{ panel.model || "No model specified" }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Installation Direction</label
          >
          <select
            class="w-full px-3 py-2 mt-1 text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
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

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Installation Details
      </h3>
      <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Roof Type</label
          >
          <select
            class="w-full px-3 py-2 mt-1 text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
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
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Roof Angle (degrees)</label
          >
          <p
            class="px-3 py-2 mt-1 text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          >
            30
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Shading Factor</label
          >
          <select
            class="w-full px-3 py-2 mt-1 text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
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
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Installation Date</label
          >
          <input
            type="date"
            class="w-full px-3 py-2 mt-1 text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
          />
        </div>
      </div>

      <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">Estimated Output</h3>
      <div
        class="grid grid-cols-1 gap-4 p-4 text-center rounded-lg bg-green-50 dark:bg-green-950 sm:grid-cols-3"
      >
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-300">Daily Average</p>
          <p class="text-xl font-bold text-green-700 dark:text-green-400">24 kWh</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-300">Monthly Average</p>
          <p class="text-xl font-bold text-green-700 dark:text-green-400">650 kWh</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-300">Annual Projection</p>
          <p class="text-xl font-bold text-green-700 dark:text-green-400">7,924 kWh</p>
        </div>
      </div>
      <div class="flex justify-end gap-4 mt-8">
        <button
          class="px-4 py-2 border border-gray-500 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
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
// NOTE: You need to import the useDarkMode composable here to make the dark mode work on this component.
import { useDarkMode } from "@/composables/useDarkMode.js";

export default {
  props: {
    panel: Object, // Receive device data from parent
  },
  emits: ["close", "update:panelCount"], // Declare emitted events
  // Add the setup method to use the composable
  setup() {
    const { isDarkMode } = useDarkMode();
    return { isDarkMode };
  },
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
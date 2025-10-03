<template>
  <div class="flex flex-wrap items-center gap-4 p-6 bg-white dark:bg-gray-800 shadow-sm rounded-2xl">
    <input
      type="text"
      placeholder="🔍 Search by name or email..."
      v-model="filters.search"
      @input="emitFilters"
      class="flex-1 border rounded-xl px-4 py-2 dark:bg-gray-700 dark:text-white focus:ring focus:ring-green-400"
    />

    <select v-model="filters.role" @change="emitFilters"
      class="border rounded-xl px-4 py-2 dark:bg-gray-700 dark:text-white focus:ring focus:ring-green-400">
      <option value="">All Roles</option>
      <option value="admin">Admin</option>
      <option value="user">User</option>
    </select>

    <select v-model="filters.status" @change="emitFilters"
      class="border rounded-xl px-4 py-2 dark:bg-gray-700 dark:text-white focus:ring focus:ring-green-400">
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>
</template>

<script setup>
import { ref } from "vue";

const filters = ref({ search: "", role: "", status: "" });
const emit = defineEmits(["filter"]);
const emitFilters = () => emit("filter", filters.value);
</script>

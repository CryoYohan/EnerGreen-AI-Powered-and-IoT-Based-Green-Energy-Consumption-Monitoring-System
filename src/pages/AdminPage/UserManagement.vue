<template>
  <div
    class="min-h-screen dark:bg-gray-900 min-w-screen flex flex-col bg-[#F9FAFB] font-poppins"
  >
    <AdminHeader />
    <Heading title="User Management" />

    <!-- ✅ Key Metrics (preserved as requested) -->
    <MetricsCard :metrics="dailyMetrics" size="large" />

    <!-- Advanced Insights + Eco Heroes (side by side) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <!-- Left: Insights -->
      <UserInsights :insights="insights" />

      <!-- Right: Eco Heroes -->
      <EcoHeroes :heroes="ecoHeroes" />
    </div>

    <!-- Users Table with Actions -->
    <div class="px-6 pb-20">
      <UsersTable
        :users="filteredUsers"
        @suspend="suspendUser"
        @delete="deleteUser"
      />
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { collectionGroup, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

import AdminHeader from "@/components/ReusableComponents/AdminHeader.vue";
import Heading from "@/components/ReusableComponents/Heading.vue";
import Footer from "@/components/ReusableComponents/Footer.vue";
import MetricsCard from "@/components/ReusableComponents/MetricsCard.vue";

import UserInsights from "@/components/AdminComponents/Users/UserInsights.vue";
import EcoHeroes from "@/components/AdminComponents/Users/EcoHeroes.vue";
import UsersTable from "@/components/AdminComponents/Users/UsersTable.vue";

// 📊 Metrics data (preserved)
const dailyMetrics = [
  { title: "Total Users", icon: "/src/Images/Icons/totalusers.svg", cost: "127" },
  { title: "Active Users", icon: "/src/Images/Icons/users.svg", cost: "123" },
  { title: "Inactive Users", icon: "/src/Images/Icons/inactiveusers.svg", cost: "4" },
  { title: "New Users", icon: "/src/Images/Icons/newusers.svg", cost: "12" },
];

const insights = ref({});
const ecoHeroes = ref([]);
const users = ref([]);

// 🔎 Filtering
const filters = ref({ search: "", role: "", status: "" });
const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const matchesSearch =
      !filters.value.search ||
      u.name?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      u.location?.toLowerCase().includes(filters.value.search.toLowerCase());

    const matchesRole = !filters.value.role || u.role === filters.value.role;
    const matchesStatus = !filters.value.status || u.status === filters.value.status;

    return matchesSearch && matchesRole && matchesStatus;
  });
});


// 🚀 Firestore Fetch (admin only)
onMounted(async () => {
  try {
    // query all userProfile subcollections across users
    const profilesQuery = collectionGroup(db, "userProfile");
    const profilesSnap = await getDocs(profilesQuery);

    const loadedUsers = profilesSnap.docs.map((docSnap) => {
      const profileData = docSnap.data();
      const uid = docSnap.ref.parent.parent.id; // parent userId

      return {
        userId: uid,
        name: profileData.fullName || profileData.name || "Unnamed",
        location: profileData.address || profileData.location || "Unknown",
        smartMeterID: profileData.deviceId || 0,
        status: profileData.status || "Active",
        ...profileData,
      };
    });

    users.value = loadedUsers;
  } catch (err) {
    console.error("Error fetching user profiles:", err);
  }
});
</script>

<template>
    <div class="grid m-4 sm:m-5 lg:m-10 grid-cols-1 md:grid-cols-2 gap-6 font-poppins">
        <!-- Top Eco-Heroes -->
        <Rankings 
            title="Top Eco-Heroes" 
            subtitle="Monthly Rankings" 
            :heroes="ecoHeroes" 
        />

        <!-- New Users -->
        <div class="p-6 bg-white rounded-xl shadow h-full">
            <h2 class="text-lg font-semibold text-gray-800 mb-1">👋 New Users</h2>
            <p class="text-sm text-gray-500 mb-4">Recently joined users and their signup dates.</p>
            <div class="space-y-3 text-sm max-h-[340px] overflow-y-auto pr-2">
                <div 
                    v-for="(user, index) in newUsers"
                    :key="index"
                    class="flex items-center justify-between p-3 rounded-lg bg-gray-100"
                >
                    <div class="flex items-center space-x-3">
                        <img :src="user.img" class="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <span class="text-gray-800 font-medium block">{{ user.name }}</span>
                            <span class="text-xs text-gray-500">{{ user.joinDate }}</span>
                        </div>
                    </div>
                    <span class="text-xs text-gray-500">{{ user.status }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Rankings from '@/components/ReusableComponents/Rankings.vue';
export default {
    components: {
        Rankings,
    },
    data() {
        return {
            ecoHeroes: [
                { name: "John Bake", co2: "29.4 kg", img: "/src/Images/profile/pfp.png" },
                { name: "Kate Lim", co2: "18 kg", img: "/src/Images/profile/pfp.png" },
                { name: "Marc Homes", co2: "13 kg", img: "/src/Images/profile/pfp.png" },
            ],
            newUsers: [
                { name: "Efwin Smith", joinDate: "May 2025", img: "/src/Images/profile/pfp.png", status: "Active" },
                { name: "Dianna Mae", joinDate: "May 2025", img: "/src/Images/profile/pfp.png", status: "Active" },
                { name: "Eric Ruz", joinDate: "April 2025", img: "/src/Images/profile/pfp.png", status: "Active" },
                { name: "Sarah Johnson", joinDate: "April 2025", img: "/src/Images/profile/pfp.png", status: "Active" },
                { name: "Michael Chen", joinDate: "March 2025", img: "/src/Images/profile/pfp.png", status: "Active" },
                { name: "Lisa Wong", joinDate: "March 2025", img: "/src/Images/profile/pfp.png", status: "Active" },
                { name: "David Kim", joinDate: "February 2025", img: "/src/Images/profile/pfp.png", status: "Active" },
            ]
        }
    }
}
</script>

<style scoped>
/* Custom scrollbar styling */
::-webkit-scrollbar {
    width: 4px;
}
::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}
::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
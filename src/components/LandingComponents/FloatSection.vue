<template>
  <div class="relative w-full overflow-hidden py-8">
    <div class="relative">
      <div class="flex animate-scroll space-x-6 md:space-x-8 lg:space-x-10">
        <div v-for="(imageSet, setIndex) in 2" :key="setIndex" class="flex space-x-6 md:space-x-8 lg:space-x-10">
          <div v-for="(image, index) in images" :key="index" 
               class="flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-96 transform transition-transform duration-300 hover:scale-105">
            <img 
              :src="image.src" 
              :alt="image.alt"
              class="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover rounded-xl shadow-lg"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      images: [
        {
          src: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          alt: "Energy usage chart with a downward trend"
        },
        {
          src: "https://images.unsplash.com/photo-1587840134468-f9b769229ce5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          alt: "Dashboard with various charts and data visualizations"
        },
        {
          src: "https://images.unsplash.com/photo-1627873645770-80f0f4897865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          alt: "Geothermal energy facility"
        },
        {
          src: "https://images.unsplash.com/photo-1550571343-4e36502ed3a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          alt: "Digital interface showing a clean energy chart"
        },
        {
          src: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
          alt: "Hydroelectric power plant"
        },
        {
          src: "https://images.unsplash.com/photo-1601334641944-12343940c061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          alt: "Close-up of a renewable energy grid on a graph"
        },
        {
          src: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80",
          alt: "Solar panels on a roof"
        },
        {
          src: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          alt: "Wind turbines in a field"
        }
      ]
    };
  }
};
</script>

<style scoped>
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-100% / 2));
  }
}

.animate-scroll {
  animation: scroll 30s linear infinite;
}

.animate-scroll:hover {
  animation-play-state: paused;
}
</style>
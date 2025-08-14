<template>
  <div class="container max-w-full p-10 mx-auto font-poppins space-y-4">
    <h1 class="text-2xl font-bold">Featured Videos</h1>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 relative" id="video-container">
      <!-- Videos will be inserted here -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      expandedVideo: null,
      currentlyPlaying: null,
      videos: [
        {
          src: "./src/Videos/Energreen Explainer Video.mp4",
          title: "EnerGreen Explainer Video 1",
          subtitle: "Take a moment to look and listen to what EnerGreen has to offer."
        },
        {
          src: "./src/Videos/SolarPanel.mp4",
          title: "Solar Panel Demo",
          subtitle: "Take a moment to look and listen to what EnerGreen has to offer."
        },
        {
          src: "./src/Videos/windmill.mp4",
          title: "Windmill Demo",
          subtitle: "Every month my electricity bill goes up, and I don't even know why!"
        }
      ],
      originalOrder: [] // store order
    }
  },
  mounted() {
    const container = document.getElementById('video-container');

    this.videos.forEach((video, index) => {
      const videoDiv = document.createElement('div');
      videoDiv.className = 'video-item bg-white rounded-lg overflow-hidden shadow-md transition-all';
      videoDiv.dataset.index = index;

      videoDiv.innerHTML = `
        <div class="video-wrapper aspect-video">
          <video class="w-full h-full" controls>
            <source src="${video.src}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="p-4">
          <h3 class="text-lg font-semibold">${video.title}</h3>
          <p class="text-gray-600 text-sm">${video.subtitle}</p>
        </div>
      `;

      const videoElement = videoDiv.querySelector('video');

      videoElement.addEventListener('play', () => this.handleVideoPlay(index, videoElement));
      videoElement.addEventListener('pause', () => this.handleVideoPause(index));
      videoElement.addEventListener('ended', () => this.handleVideoEnd(index));

      videoDiv.addEventListener('click', (e) => {
        if (e.target.tagName === 'VIDEO' || e.target.tagName === 'SOURCE') return;
        this.expandedVideo = this.expandedVideo === index ? null : index;
        this.updateVideoLayout();
      });

      container.appendChild(videoDiv);
      this.originalOrder.push(videoDiv);
    });
  },
  methods: {
        handleVideoPlay(index, videoElement) {
        // Pause all others
        document.querySelectorAll('video').forEach((vid, i) => {
            if (i !== index) vid.pause();
        });

        this.currentlyPlaying = index;
        this.expandedVideo = index;

        // Update styles only — no DOM reorder
        this.updateVideoLayout();

        // Scroll into view
        const videoItem = document.querySelector(`.video-item[data-index="${index}"]`);
        videoItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        },

    handleVideoPause(index) {
      if (this.currentlyPlaying === index) {
        const videoItem = document.querySelector(`.video-item[data-index="${index}"]`);
        videoItem.style.zIndex = '';
        videoItem.style.position = '';
        this.currentlyPlaying = null;
        this.resetVideoOrder(); // optional: restores original order
      }
    },
    handleVideoEnd(index) {
      this.handleVideoPause(index);
      this.expandedVideo = null;
      this.updateVideoLayout();
    },

updateVideoLayout() {
  const videoItems = document.querySelectorAll('.video-item');
  const videoWrappers = document.querySelectorAll('.video-wrapper');

  videoItems.forEach((item, index) => {
    // Reset styles
    item.style.order = '0';

    if (this.expandedVideo === index) {
      // Expand + push visually on top
      item.classList.add('col-span-1', 'sm:col-span-2', 'lg:col-span-3');
      videoWrappers[index].classList.add('expanded');
      item.style.order = '-1'; // brings to top
    } else {
      item.classList.remove('col-span-1', 'sm:col-span-2', 'lg:col-span-3');
      videoWrappers[index].classList.remove('expanded');
    }
  });
},
    resetVideoOrder() {
      const container = document.getElementById('video-container');
      this.originalOrder.forEach((el) => container.appendChild(el));
    }
  }
}
</script>

<style scoped>
.video-item {
  transition: all 0.3s ease;
  cursor: pointer;
}
.video-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.video-wrapper {
  position: relative;
  transition: all 0.3s ease;
}

.video-wrapper.expanded {
  max-height: 70vh;
  min-height: 400px;
}

.video-wrapper:not(.expanded) {
  max-height: 300px;
}

.video-wrapper video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

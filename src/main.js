// src/main.js

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import PullToRefresh from 'pulltorefreshjs';

// 1. Import the necessary Auth function and your initialized 'auth' instance
import { onAuthStateChanged, auth } from './firebase';

// This flag ensures the app only mounts once
let app = null;

// --- Core Fix: Wait for Auth State to Load ---
onAuthStateChanged(auth, () => {
  // Check if the app is already mounted
  if (!app) {
    // Initialize the app ONLY when the Auth state is ready
    app = createApp(App);

    app.use(router);

    // Initialize external libraries BEFORE mounting the app
    AOS.init({
      once: false,
      offset: 120,
      delay: 0,
      duration: 400,
      easing: 'ease-in-out',
    });

    PullToRefresh.init({
      mainElement: 'body',
      onRefresh: () => {
        window.location.reload();
      },
      distThreshold: 90,
    });

    app.mount('#app');
  }
  // Any subsequent auth state changes (e.g., a user logs out) can be handled here
});

// Remove the standalone app.mount('#app') which was previously at the end
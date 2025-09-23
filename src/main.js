import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css'; // Keep only one import for your main CSS
import AOS from 'aos';
import 'aos/dist/aos.css';
import PullToRefresh from 'pulltorefreshjs';

const app = createApp(App);

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
  onRefresh: () => { // Fixed the syntax error here
    window.location.reload();
  },
  distThreshold: 90,
});

app.mount('#app');
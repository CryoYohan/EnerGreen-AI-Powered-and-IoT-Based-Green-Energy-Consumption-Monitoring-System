import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/pages/LandingPage/LandingPage.vue';  // new landing page
import Home from '@/pages/UserPage/Home.vue';       // your user home page
import Forecast from '@/pages/UserPage/Forecast.vue'; // Forecast page
import Appliances from '@/pages/UserPage/Appliances.vue'; // Appliances page
import SolarPanel from '@/pages/UserPage/SolarPanel.vue'; // Solar Panel Integration page
import Simulation from '@/pages/UserPage/Simulation.vue'; // Simulation page
import CarbonEmission from '@/pages/UserPage/CarbonEmission.vue'; // Carbon Emission page
import PredictiveAnalytics from '@/pages/UserPage/PredictiveAnalytics.vue'; // Predictive Analytics for Carbon Emission only page
import Resources from '@/pages/UserPage/Resources.vue'; // Resources page
import Profile from '@/pages/UserPage/Profile.vue'; // User Profile page
import AdminHome from '@/pages/AdminPage/AdminHome.vue'; // Admin Home page
import Hardware from '@/pages/AdminPage/Hardware.vue'; // Hardware Management page
import UserManagement from '@/pages/AdminPage/UserManagement.vue'; // User Management page
import MonitoringAnalytics from '@/pages/AdminPage/MonitoringAnalytics.vue'; // Monitoring and Analytics page
import AdminProfile from '@/pages/AdminPage/AdminProfile.vue'; // Admin Profile page
import Cost from '@/pages/UserPage/CostPage.vue'
const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
  {
    path: '/appliances',
    name: 'Appliances',
    component: Appliances,
  },
  {
    path: '/forecast',
    name: 'Forecast',
    component: Forecast,
  },
  {
    path: '/solarpanel',
    name: 'SolarPanel',
    component: SolarPanel,
  },
  {
    path: '/simulation',
    name: 'Simulation',
    component: Simulation,
  },
  {
    path: '/carbonemission',
    name: 'CarbonEmission',
    component: CarbonEmission,
  },
  {
    path: '/predictiveanalytics',
    name: 'PredictiveAnalytics',
    component: PredictiveAnalytics,
  },
  {
    path: '/resources',
    name: 'Resources',
    component: Resources,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
  {
    path: '/adminhome',
    name: 'AdminHome',
    component: AdminHome,
  },
  {
    path: '/hardware',
    name: 'Hardware',
    component: Hardware,
  },
  {
    path: '/usermanagement',
    name: 'UserManagement',
    component: UserManagement,
  },
  {
    path: '/monitoring',
    name: 'Monitoring',
    component: MonitoringAnalytics,
  },
  {
    path: '/adminprofile',
    name: 'AdminProfile',
    component: AdminProfile,
  },
  {
    path: '/cost',
    name: 'Cost',
    component: Cost,
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

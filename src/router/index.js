import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/pages/LandingPage/LandingPage.vue';  // new landing page
import Home from '@/pages/UserPage/Home.vue';       // your user home page
import Appliances from '@/pages/UserPage/Appliances.vue';
import SolarPanel from '@/pages/UserPage/SolarPanel.vue';
import Simulation from '@/pages/UserPage/Simulation.vue';
import CarbonEmission from '@/pages/UserPage/CarbonEmission.vue';
import PredictiveAnalytics from '@/pages/UserPage/PredictiveAnalytics.vue';
import Resources from '@/pages/UserPage/Resources.vue';
import Profile from '@/pages/UserPage/Profile.vue';
import AdminHome from '@/pages/AdminPage/AdminHome.vue';
import Hardware from '@/pages/AdminPage/Hardware.vue';
import UserManagement from '@/pages/AdminPage/UserManagement.vue';
import MonitoringAnalytics from '@/pages/AdminPage/MonitoringAnalytics.vue';
import AdminProfile from '@/pages/AdminPage/AdminProfile.vue';
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
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

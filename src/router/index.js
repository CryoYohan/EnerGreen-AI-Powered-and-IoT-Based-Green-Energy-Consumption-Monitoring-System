import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/firebase.js';

// --- Pages ---
import LandingPage from '@/pages/LandingPage/LandingPage.vue';
import AboutUs from '@/components/LandingComponents/AboutUs.vue'; // Added Import
import Unauthorized from '@/pages/Unauthorized.vue';
import UpgradePage from '@/pages/Subscription/UpgradePage.vue';
import FutureUpgradePage from '@/pages/Subscription/FutureUpgradePage.vue'; // Import FutureUpgradePage // Import Upgrade Page

// User Pages
import Home from '@/pages/UserPage/Home.vue';
import Forecast from '@/pages/UserPage/Forecast.vue';
import Appliances from '@/pages/UserPage/Appliances.vue';
import SolarPanel from '@/pages/UserPage/SolarPanel.vue';
import Simulation from '@/pages/UserPage/Simulation.vue';
import CarbonEmission from '@/pages/UserPage/CarbonEmission.vue';
import Resources from '@/pages/UserPage/Resources.vue';
import Profile from '@/pages/UserPage/Profile.vue';
import Cost from '@/pages/UserPage/CostPage.vue';

// Admin Pages
import AdminHome from '@/pages/AdminPage/AdminHome.vue';
import Hardware from '@/pages/AdminPage/Hardware.vue';
import UserManagement from '@/pages/AdminPage/UserManagement.vue';
import MonitoringAnalytics from '@/pages/AdminPage/MonitoringAnalytics.vue';
import AdminProfile from '@/pages/AdminPage/AdminProfile.vue';
import SalesManagement from '@/pages/AdminPage/SalesManagement.vue';
import RatesManagement from '@/pages/AdminPage/RatesManagement.vue';
import FeedbackManagement from '@/pages/AdminPage/FeedbackManagement.vue';

const db = getFirestore(app);
const auth = getAuth(app);

const routes = [
  // Public
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
  },
  {
    path: '/about-us', // New Route
    name: 'AboutUs',
    component: AboutUs,
  },
  {
    path: '/401',
    name: 'Unauthorized',
    component: Unauthorized,
  },
  {
    path: '/upgrade',
    name: 'Upgrade',
    component: UpgradePage,
    meta: { requiresAuth: true } // This page requires auth to know who to upgrade
  },
  {
    path: '/future-upgrade',
    name: 'FutureUpgrade',
    component: FutureUpgradePage,
    meta: { requiresAuth: false } // No auth required for this informational page
  },

  // --- USER ROUTES (Role: 'user') ---
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/appliances',
    name: 'Appliances',
    component: Appliances,
    meta: { requiresAuth: true, role: 'user', requiresPremium: true } // Mark as premium
  },
  {
    path: '/forecast',
    name: 'Forecast',
    component: Forecast,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/solarpanel',
    name: 'SolarPanel',
    component: SolarPanel,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/simulation',
    name: 'Simulation',
    component: Simulation,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/carbonemission',
    name: 'CarbonEmission',
    component: CarbonEmission,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/resources',
    name: 'Resources',
    component: Resources,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/cost',
    name: 'Cost',
    component: Cost,
    meta: { requiresAuth: true, role: 'user' }
  },

  // --- ADMIN ROUTES (Role: 'admin') ---
  {
    path: '/adminhome',
    name: 'AdminHome',
    component: AdminHome,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/hardware',
    name: 'Hardware',
    component: Hardware,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/ratesmanagement',
    name: 'RatesManagement',
    component: RatesManagement,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/usermanagement',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/monitoring',
    name: 'Monitoring',
    component: MonitoringAnalytics,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/adminprofile',
    name: 'AdminProfile',
    component: AdminProfile,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/salesmanagement',
    name: 'SalesManagement',
    component: SalesManagement,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/feedback',
    name: 'FeedbackManagement',
    component: FeedbackManagement,
    meta: { requiresAuth: true, role: 'admin' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- SECURITY NAVIGATION GUARD ---

// 1. Helper: Wait for Firebase Auth to initialize
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(auth, (user) => {
      removeListener();
      resolve(user);
    }, reject);
  });
};

// 2. Helper: Fetch User Profile Data from Firestore
const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, `artifacts/default-app-id/users/${uid}/userProfile/profile`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null; // Return null if no profile
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null; // Fail safe
  }
};


// 3. The Guard Logic
router.beforeEach(async (to, from, next) => {
  const currentUser = await getCurrentUser();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // A. Route requires auth, but user is NOT logged in -> Redirect to Landing
  if (requiresAuth && !currentUser) {
    return next('/');
  }

  // B. Route requires auth, and user IS logged in -> Check Role & Subscription
  if (requiresAuth && currentUser) {
    const profile = await getUserProfile(currentUser.uid);
    const role = profile?.role || 'user';
    const subscription = profile?.subscriptionTier || 'Free';

    // Role mismatch (e.g. User trying to access Admin page) -> Redirect to 401
    if (to.meta.role && to.meta.role !== role) {
      return next('/401');
    }

    // Subscription mismatch (e.g. Free user trying to access Premium page)
    if (to.meta.requiresPremium && subscription !== 'Premium') {
      return next({ name: 'Upgrade' });
    }
    
    // All checks passed
    return next();
  }

  // C. If user is logged in and tries to visit Landing Page ('/'), redirect to their Dashboard
  if (to.path === '/' && currentUser) {
    const profile = await getUserProfile(currentUser.uid);
    const role = profile?.role || 'user';
    if (role === 'admin') return next('/adminhome');
    else return next('/home');
  }

  // D. Allow public routes
  next();
});

export default router;
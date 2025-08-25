<script setup>
import { ref, onMounted } from 'vue'
import { 
  auth,
  onAuthStateChanged,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from './../../firebase.js';

// Reactive data
const email = ref('');
const password = ref('');
const message = ref(null);
const userEmail = ref('');

// Listen for auth state changes to update the UI
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmail.value = user.email;
      message.value = { text: 'Login successful!', type: 'success' };
    } else {
      userEmail.value = '';
      message.value = null;
    }
  });
});

// Method for user registration
const register = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    console.log("Registered and logged in:", auth.currentUser.email);
    // The onAuthStateChanged listener will handle UI updates
  } catch (error) {
    console.error("Registration error:", error.message);
    message.value = { text: error.message, type: 'error' };
  }
};

// Method for user login
const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log("Logged in:", auth.currentUser.email);
    // The onAuthStateChanged listener will handle UI updates
  } catch (error) {
    console.error("Login error:", error.message);
    message.value = { text: error.message, type: 'error' };
  }
};

// Method for user logout
const logout = async () => {
  try {
    await signOut(auth);
    console.log("Logged out successfully");
    message.value = { text: 'Logged out successfully', type: 'success' };
  } catch (error) {
    console.error("Logout error:", error.message);
    message.value = { text: error.message, type: 'error' };
  }
};
</script>

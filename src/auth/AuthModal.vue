<template>
  <!-- Modal Backdrop -->
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" @click.self="closeModal">
    <!-- Modal Container -->
    <div class="flex w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
      <!-- Left Side: Welcome -->
      <div class="relative flex-col justify-center hidden w-1/2 md:flex">
        <img src="/src/Images/background/loginbg.png" alt="Background" class="absolute inset-0 object-cover w-full h-full opacity-70">
        <div class="relative z-10 p-8 text-black">
          <div class="flex items-center mb-6">
            <img src="/src/Images/logo/energreen-logo.svg" alt="EnerGreen Logo" class="w-12 h-12 mr-3">
            <h2 class="text-3xl font-bold"><span class="text-[#059669]">Ener</span>Green</h2>
          </div>
          <h3 class="mb-4 text-2xl font-bold">Welcome to EnerGreen!</h3>
          <p class="text-base leading-relaxed">Register now to start tracking your energy and make a difference.</p>
        </div>
      </div>

      <!-- Right Side: Content Switch -->
      <div class="w-full md:w-1/2 bg-[#059669] p-8 flex flex-col justify-center text-white">
        <div class="flex items-center justify-between mb-8">
          <!-- Centered header for Verify Email -->
          <div class="w-full text-center" v-if="isVerifyingEmail">
            <h3 class="text-3xl font-bold">Verify Email</h3>
          </div>

          <!-- Centered header for Success State -->
          <div class="w-full text-center" v-else-if="isEmailVerifiedSuccess">
            <h3 class="text-3xl font-bold">Success!</h3>
          </div>

          <!-- Fallback for other modes -->
          <div class="flex items-center justify-between" v-else>
            <h3 class="text-3xl font-bold">{{ isLoginMode ? 'Log in Account' : 'Create Account' }}</h3>
          </div>
        </div>

        <!-- Verification Success State -->
        <template v-if="isEmailVerifiedSuccess">
          <div class="flex flex-col items-center text-center">
            <!-- Checkmark Animation -->
            <svg class="checkmark mb-4 w-20 h-20 text-white" viewBox="0 0 52 52">
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
              <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
            <p class="mb-4 text-gray-200 text-lg">Your email has been successfully verified!</p>
            <p class="mb-6 text-gray-200">You can now log in with your new account.</p>
            <button
              @click="switchToLogin"
              class="w-full py-2 mt-2 font-bold text-black transition bg-white rounded-lg hover:bg-gray-200"
            >
              Go to Login
            </button>
          </div>
        </template>

        <!-- Email Verification State (before success) -->
        <template v-else-if="isVerifyingEmail">
          <img class="self-center w-40 h-20" src="/src/Images/icons/mail.svg" alt="mail">
          <p class="mb-6 text-center text-gray-200">
            Email verification has been sent to <span class="font-bold">{{ maskedEmail }}</span>.
          </p>
          <div class="flex justify-center mb-6 space-x-2">
            <p>Verification link has been sent to your email.</p>
          </div>
          <button
            type="button"
            @click="handleResendVerification"
            :disabled="isResendDisabled"
            class="w-full py-2 mt-2 font-bold transition rounded-md"
            :class="{ 'bg-gray-400 text-gray-700 cursor-not-allowed': isResendDisabled, 'bg-white text-black hover:bg-gray-200': !isResendDisabled }"
          >
            {{ isResendDisabled ? `Resend in ${resendTimer}s` : 'Resend Verification Email' }}
          </button>
        </template>

        <!-- Login/Register Forms -->
        <template v-else>
          <p class="mb-6 text-gray-200">Please fill in your information below</p>
          <form @submit.prevent="isLoginMode ? handleLogin() : handleRegister()">
            <div v-if="!isLoginMode" class="mb-2">
              <label class="block text-white">Full Name</label>
              <input type="text" v-model="fullName" required 
                     class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
            </div>
            <div class="mb-2">
              <label class="block text-white">Email</label>
              <input type="text" v-model="email" required 
                     class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
            </div>
            <div v-if="!isLoginMode" class="mb-2">
              <label class="block text-white">Phone Number</label>
              <input type="tel" v-model="phoneNumber" required 
                     class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
            </div>
            <div v-if="!isLoginMode" class="mb-2">
              <label class="block text-white">Address</label>
              <input type="text" v-model="address" required 
                     class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
            </div>
            <div v-if="!isLoginMode" class="mb-2">
              <label class="block text-white">Device ID</label>
              <input type="text" v-model="deviceId" required 
                     class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
            </div>
            <div class="mb-2">
              <label class="block text-white">Password</label>
              <input type="password" v-model="password" required 
                     class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
            </div>
            <div v-if="!isLoginMode" class="mb-2">
              <label class="block text-white">Confirm Password</label>
              <input type="password" v-model="confirmPassword" required 
                     class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
            </div>
            <button type="submit" class="w-full py-2 mt-2 font-bold text-black transition bg-white rounded-lg hover:bg-gray-200">
              {{ isLoginMode ? 'Log in' : 'Sign up' }}
            </button>
            <div v-if="error" class="p-2 mt-4 mb-4 text-sm bg-red-600 rounded text-red-100">
              {{ error }}
            </div>
          </form>
          <div class="mt-6 text-center">
            <button @click="toggleMode" class="text-white hover:underline">
              {{ isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Log in" }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
} from '../firebase.js';
import { db, doc, setDoc } from '../firebase.js';

// The global app ID and Firestore config are provided by the canvas environment.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const props = defineProps({
  isOpen: Boolean,
  initialMode: {
    type: String,
    default: 'login'
  }
});

const emit = defineEmits(['close']);
const router = useRouter();

// Reactive state
const isLoginMode = ref(props.initialMode === 'login');
const isVerifyingEmail = ref(false);
const isEmailVerifiedSuccess = ref(false);
const fullName = ref('');
const email = ref('');
const phoneNumber = ref('');
const address = ref('');
const deviceId = ref(''); // New state for the device ID
const password = ref('');
const confirmPassword = ref('');
const error = ref('');

// State for resend button and timer
const isResendDisabled = ref(false);
const resendTimer = ref(0);
let timerInterval = null;
let verificationPollInterval = null;

// Mask the email address
const maskedEmail = computed(() => {
  if (!email.value) return '';
  const [username, domain] = email.value.split('@');
  if (!username || !domain) return email.value;
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 1);
  return `${maskedUsername}@${domain}`;
});

// Watch for changes in initialMode prop to reset the form
watch(() => props.initialMode, (newVal) => {
  isLoginMode.value = newVal === 'login';
  resetForm();
});

// Watch for modal open state to reset timer
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

// --- Component Methods ---
const closeModal = () => {
  emit('close');
  resetForm();
};

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  resetForm();
};

const switchToLogin = () => {
  isEmailVerifiedSuccess.value = false;
  isLoginMode.value = true;
  closeModal();
};

const resetForm = () => {
  error.value = '';
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
  fullName.value = '';
  phoneNumber.value = '';
  address.value = '';
  deviceId.value = ''; // Reset device ID
  isVerifyingEmail.value = false;
  isEmailVerifiedSuccess.value = false;
  clearTimers();
};

const clearTimers = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (verificationPollInterval) {
    clearInterval(verificationPollInterval);
    verificationPollInterval = null;
  }
  isResendDisabled.value = false;
  resendTimer.value = 0;
};

// Polling function to check verification status
const checkEmailVerificationStatus = async () => {
  if (auth.currentUser) {
    // Force reload the user's latest data from Firebase
    await auth.currentUser.reload();
    // Now check if the email is verified
    if (auth.currentUser.emailVerified) {
      console.log('Email verified! Stopping polling and showing success modal.');
      clearTimers();
      isVerifyingEmail.value = false;
      isEmailVerifiedSuccess.value = true;
      // After a short delay, switch to login mode and close the modal
      setTimeout(() => {
        isLoginMode.value = true;
        isEmailVerifiedSuccess.value = false;
        closeModal();
      }, 3000); // 3-second delay
    }
  }
};

const handleLogin = async () => {
  error.value = '';
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log('Successfully logged in.');
    closeModal();
    // Redirect the user to the Home page
    router.push('/home');
  } catch (err) {
    console.error('Login error:', err.message);
    error.value = err.message;
  }
};

const handleRegister = async () => {
  error.value = '';
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords don't match!";
    return;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const userId = userCredential.user.uid;

    // Create a new document in Firestore with user profile data, including the device ID
    await setDoc(doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`), {
      fullName: fullName.value,
      email: email.value,
      phoneNumber: phoneNumber.value,
      address: address.value,
      deviceId: deviceId.value, // Save the device ID
    });
    console.log('User profile and device ID data saved to Firestore.');
    
    // Immediately send a verification email
    await sendEmailVerification(userCredential.user);
    
    console.log('Successfully registered and verification email sent.');
    isVerifyingEmail.value = true;
    startResendTimer();
    
    // Start polling to check for verification
    if (verificationPollInterval) clearInterval(verificationPollInterval); // Clear any old timer
    verificationPollInterval = setInterval(checkEmailVerificationStatus, 2000); // Poll every 2 seconds
    
  } catch (err) {
    console.error('Registration error:', err.message);
    error.value = err.message;
  }
};

const startResendTimer = () => {
  // Clear any existing timer to prevent multiple timers running
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  isResendDisabled.value = true;
  resendTimer.value = 60;
  
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--;
    } else {
      clearInterval(timerInterval);
      isResendDisabled.value = false;
    }
  }, 1000);
};

const handleResendVerification = async () => {
  error.value = '';
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      console.log('Verification email resent.');
      startResendTimer();
    } else {
      console.error('No user is currently logged in.');
      error.value = 'Could not resend email. Please try logging in again.';
    }
  } catch (err) {
    console.error('Error resending email:', err.message);
    error.value = err.message;
  }
};

// Clean up the timers when the component is unmounted to prevent memory leaks
onUnmounted(() => {
  clearTimers();
});
</script>

<style scoped>
/* Checkmark animation styles */
.checkmark {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #4caf50;
  stroke-miterlimit: 10;
  box-shadow: inset 0px 0px 0px #4caf50;
  animation: fill .4s cubic-bezier(0.650, 0.000, 0.450, 1.000) 1s forwards;
}

.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #fff;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.650, 0.000, 0.450, 1.000) forwards;
}

.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.650, 0.000, 0.450, 1.000) 0.8s forwards;
  stroke: #fff;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 30px #4caf50;
  }
}
</style>

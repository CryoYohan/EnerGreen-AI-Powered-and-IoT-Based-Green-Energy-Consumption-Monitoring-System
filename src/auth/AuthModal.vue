<template>
  <transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="closeModal">
      
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/50 z-200">
        <div class="text-center text-white">
          <div
            class="w-16 h-16 border-4 border-t-4 border-white border-solid rounded-full animate-spin border-t-transparent">
          </div>
          <p class="mt-4 text-lg font-semibold">Processing...</p>
        </div>
      </div>

      <div class="flex w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div class="relative flex-col justify-center hidden w-1/2 md:flex">
          <img src="/src/Images/background/loginbg.png" alt="Background"
            class="absolute inset-0 object-cover w-full h-full opacity-70">
          <div class="relative z-10 p-8 text-black">
            <div class="flex items-center mb-6">
              <img src="/src/Images/logo/energreen-logo.svg" alt="EnerGreen Logo" class="w-12 h-12 mr-3">
              <h2 class="text-3xl font-bold"><span class="text-[#059669]">Ener</span>Green</h2>
            </div>
            <h3 class="mb-4 text-2xl font-bold">Welcome to EnerGreen!</h3>
            <p class="text-base leading-relaxed">Register now to start tracking your energy and make a difference.</p>
          </div>
        </div>

        <div class="w-full md:w-1/2 bg-[#059669] dark:bg-[#0D2535] p-8 flex flex-col justify-center text-white">
          
          <div class="flex items-center justify-between mb-8">
            <div class="w-full text-center" v-if="isVerifyingEmail">
              <h3 class="text-3xl font-bold">Verify Email</h3>
            </div>
            <div class="w-full text-center" v-else-if="isEmailVerifiedSuccess || isPasswordResetSuccess">
              <h3 class="text-3xl font-bold">Success!</h3>
            </div>
            <div class="w-full text-center" v-else-if="isForgotPasswordMode">
              <h3 class="text-3xl font-bold">Password Recovery</h3>
            </div>
            <div class="flex items-center justify-between" v-else>
              <h3 class="text-3xl font-bold">{{ isLoginMode ? 'Log in Account' : 'Create Account' }}</h3>
            </div>
          </div>

          <template v-if="isEmailVerifiedSuccess">
            <div class="flex flex-col items-center text-center">
              <svg class="checkmark mb-4 w-20 h-20 text-white" viewBox="0 0 52 52">
                <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
              <p class="mb-4 text-gray-200 text-lg">Your email has been successfully verified!</p>
              <button @click="switchToLogin"
                class="w-full py-2 mt-2 font-bold text-black transition bg-white rounded-lg hover:bg-gray-200">
                Go to Login
              </button>
            </div>
          </template>

          <template v-else-if="isVerifyingEmail">
            <img class="self-center w-40 h-20" src="/src/Images/icons/mail.svg" alt="mail">
            <p class="mb-6 text-center text-gray-200">
              Email verification has been sent to <span class="font-bold">{{ maskedEmail }}</span>.
            </p>
            <button type="button" @click="handleResendVerification" :disabled="isResendDisabled"
              class="w-full py-2 mt-2 font-bold transition rounded-md"
              :class="{ 'bg-gray-400 text-gray-700 cursor-not-allowed': isResendDisabled, 'bg-white text-black hover:bg-gray-200': !isResendDisabled }">
              {{ isResendDisabled ? `Resend in ${resendTimer}s` : 'Resend Verification Email' }}
            </button>
          </template>

          <template v-else-if="isForgotPasswordMode && isPasswordResetSuccess">
            <div class="flex flex-col items-center text-center">
              <svg class="checkmark mb-4 w-20 h-20 text-white" viewBox="0 0 52 52">
                <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
              <p class="mb-4 text-gray-200 text-lg">Password reset link sent!</p>
              <button @click="switchToLogin"
                class="w-full py-2 mt-2 font-bold text-black transition bg-white rounded-lg hover:bg-gray-200">
                Go to Login
              </button>
            </div>
          </template>

          <template v-else-if="isForgotPasswordMode">
            <p class="mb-6 text-gray-200">Enter your email to receive a password reset link.</p>
            <form @submit.prevent="handleForgotPassword">
              <div class="mb-2">
                <label class="block text-white">Email</label>
                <input type="email" v-model="email" required
                  class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
              </div>
              <button type="submit" :disabled="passwordResetCountdown > 0"
                class="w-full py-2 mt-2 font-bold text-black transition rounded-lg" :class="{
                  'bg-white hover:bg-gray-200': passwordResetCountdown === 0,
                  'bg-gray-400 cursor-not-allowed text-gray-700': passwordResetCountdown > 0
                }">
                <span v-if="passwordResetCountdown === 0">Send Reset Link</span>
                <span v-else>Resend in {{ passwordResetCountdown }}s</span>
              </button>
              <div v-if="error" class="p-2 mt-4 mb-4 text-sm bg-red-600 rounded text-red-100">
                {{ error }}
              </div>
            </form>
            <div class="mt-6 text-center">
              <button @click="switchToLogin" class="text-white hover:underline">Back to Login</button>
            </div>
          </template>

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
                <input type="email" v-model="email" required
                  class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
              </div>

              <div v-if="!isLoginMode">
                <div class="mb-2">
                  <label class="block text-white">Phone Number</label>
                  <input type="tel" v-model="phoneNumber" required
                    class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
                </div>
                <div class="mb-2">
                  <label class="block text-white">Address</label>
                  <input type="text" v-model="address" required
                    class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
                </div>
                
                <div class="mb-2">
                  <label class="block text-white">Electricity Provider</label>
                  <select v-model="electricityProvider" required
                    class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
                    <option value="" disabled>Select your provider</option>
                    <option value="veco">Veco</option>
                    <option value="cebeco">Cebeco</option>
                  </select>
                </div>


              </div>

              <div class="mb-4 relative">
                <label for="password" class="block text-gray-300 mb-1">Password</label>
                <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required
                  class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
                
                <p v-if="!isLoginMode && passwordError" class="text-sm text-yellow-300 mt-1">{{ passwordError }}</p>

                <button type="button" @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 focus:outline-none"
                  :class="{'top-[1.5rem]': !isLoginMode && passwordError, 'top-6': !passwordError}">
                  <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.38-3.882m3.184-2.3A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.338 5.223M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                  </svg>
                </button>
              </div>

              <div v-if="!isLoginMode" class="mb-2 relative">
                <label for="confirmPassword" class="block text-white mb-1">Confirm Password</label>
                <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" v-model="confirmPassword" required
                  class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
                
                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-300 focus:outline-none">
                  <svg v-if="!showConfirmPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.38-3.882m3.184-2.3A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.338 5.223M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                  </svg>
                </button>
              </div>

              <button type="submit"
                class="w-full py-2 mt-2 font-bold text-black transition bg-white rounded-lg hover:bg-gray-200">
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
            <div v-if="isLoginMode" class="mt-2 text-center">
              <button @click="toggleToForgotPassword" class="text-white hover:underline text-sm">
                Forgot Password?
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  db,
  doc,
  setDoc,
  getDoc,
  setPersistence,
  browserSessionPersistence
} from '../firebase.js';

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

// UI States
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoginMode = ref(props.initialMode === 'login');
const isVerifyingEmail = ref(false);
const isEmailVerifiedSuccess = ref(false);
const isForgotPasswordMode = ref(false);
const isPasswordResetSuccess = ref(false);
const passwordResetCountdown = ref(0);
const isLoading = ref(false);

// Form Data
const fullName = ref('');
const email = ref('');
const phoneNumber = ref('');
const address = ref('');
const electricityProvider = ref('');
const password = ref('');
const confirmPassword = ref('');

// Error States
const error = ref('');
const passwordError = ref(''); 
const deviceError = ref(''); 

// Timer Refs
const isResendDisabled = ref(false);
const resendTimer = ref(0);
let timerInterval = null;
let verificationPollInterval = null;
let passwordResetTimerInterval = null;

// Mask the email address
const maskedEmail = computed(() => {
  if (!email.value) return '';
  const [username, domain] = email.value.split('@');
  if (!username || !domain) return email.value;
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 1);
  return `${maskedUsername}@${domain}`;
});

// Watch for changes in initialMode prop
watch(() => props.initialMode, (newVal) => {
  isLoginMode.value = newVal === 'login';
  resetForm();
});

// Watch for modal open state
watch(() => props.isOpen, (newVal) => {
  if (!newVal) resetForm();
});

// --- UPDATED: Realtime Password Validation ---
// We watch the password variable and validate on every change
watch(password, (newVal) => {
  if (!isLoginMode.value && newVal) {
    validatePasswordRealtime(newVal);
  } else {
    passwordError.value = '';
  }
});

const validatePasswordRealtime = (pass) => {
  if (pass.length < 8) {
    passwordError.value = "Password must be at least 8 characters long.";
    return false;
  }
  if (!/(?=.*[A-Z])/.test(pass)) {
    passwordError.value = "Password must contain at least one uppercase letter.";
    return false;
  }
  if (!/(?=.*[a-z])/.test(pass)) {
    passwordError.value = "Password must contain at least one lowercase letter.";
    return false;
  }
  if (!/(?=.*\d)/.test(pass)) {
    passwordError.value = "Password must contain at least one number.";
    return false;
  }
  if (!/(?=.*[^a-zA-Z0-9])/.test(pass)) {
    passwordError.value = "Must contain at least one special character (e.g., !@#$%^&*).";
    return false;
  }
  passwordError.value = '';
  return true;
};
// --- END REALTIME VALIDATOR ---

// --- Claim Device Logic ---
const claimDeviceOnServer = async (id, uid, name) => {
    try {
        await fetch('/api/public/claim-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                deviceId: id, 
                userId: uid, 
                fullName: name 
            })
        });
        // We don't strictly need to wait for the response or block the UI 
        // if it fails, as the user is already created, but it's good practice.
    } catch (e) {
        console.error("Failed to claim device on server:", e);
        // Optional: You could show a toast warning here saying "Account created but device link failed"
    }
};

// DEVICE VALIDATOR FROM PROXY
const checkDeviceIDWithServer = async (id) => {
    try {
        // UPDATE: Changed path to match your index.js mounting point
        const response = await fetch('/api/public/check-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: id })
        });

        const data = await response.json();
        
        if (!data.exists) {
            return { valid: false, message: "Invalid Device ID. Device not found." };
        }
        if (data.isTaken) {
            return { valid: false, message: "Device is already registered to another user." };
        }
        return { valid: true, message: "" };

    } catch (e) {
        console.error("Error verifying device:", e);
        return { valid: false, message: "Could not verify device. Please try again." };
    }
};
// --- END DEVICE ID VALIDATION ---

const closeModal = () => {
  emit('close');
  resetForm();
};

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  isForgotPasswordMode.value = false;
  resetForm();
};

const switchToLogin = () => {
  isEmailVerifiedSuccess.value = false;
  isLoginMode.value = true;
  isForgotPasswordMode.value = false;
  isPasswordResetSuccess.value = false;
  closeModal();
};

const toggleToForgotPassword = () => {
  isForgotPasswordMode.value = true;
  isLoginMode.value = false;
  resetForm();
};

const resetForm = () => {
  error.value = '';
  passwordError.value = ''; 
  deviceError.value = ''; 
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
  fullName.value = '';
  phoneNumber.value = '';
  address.value = '';
  electricityProvider.value = ''; 
  isVerifyingEmail.value = false;
  isEmailVerifiedSuccess.value = false;
  isPasswordResetSuccess.value = false;
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
  if (passwordResetTimerInterval) {
    clearInterval(passwordResetTimerInterval);
    passwordResetTimerInterval = null;
  }
  isResendDisabled.value = false;
  resendTimer.value = 0;
  passwordResetCountdown.value = 0;
};

const checkEmailVerificationStatus = async () => {
  if (auth.currentUser) {
    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      clearTimers();
      isVerifyingEmail.value = false;
      isEmailVerifiedSuccess.value = true;
      setTimeout(() => {
        isLoginMode.value = true;
        isEmailVerifiedSuccess.value = false;
        closeModal();
      }, 3000);
    }
  }
};

const handleLogin = async () => {
  error.value = '';
  isLoading.value = true;
  try {
    // Set persistence to 'session' before signing in
    await setPersistence(auth, browserSessionPersistence);
    
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const userId = userCredential.user.uid;
    
    const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`);
    const userDoc = await getDoc(userDocRef);

    let role = "user"; 
    if (userDoc.exists() && userDoc.data().role) {
      role = userDoc.data().role;
    }

    isLoading.value = false;
    closeModal();

    if (role === "admin") {
      router.push("/adminhome");
    } else {
      router.push("/home");
    }
  } catch (err) {
    console.error("Login error:", err.message);
    isLoading.value = false;
    
    // --- CUSTOM ERROR MESSAGES ---
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        // This covers both "User does not exist" and "Wrong Password"
        error.value = "User does not exist or invalid password."; 
        break;
      case 'auth/too-many-requests':
        error.value = "Too many failed attempts. Please try again later.";
        break;
      case 'auth/network-request-failed':
        error.value = "Network error. Please check your internet connection.";
        break;
      default:
        // Fallback for other errors
        error.value = "Login failed. Please try again.";
    }
  }
};

const handleRegister = async () => {
  error.value = '';
  passwordError.value = ''; 
  deviceError.value = ''; 

  // Password Check
  if (!validatePasswordRealtime(password.value)) {
    return; 
  }
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords don't match!";
    return;
  }
  
  // Electricity Provider Check
  if (!electricityProvider.value) {
    error.value = "Please select an Electricity Provider.";
    return;
  }

  try {
    isLoading.value = true;

    // 1. Create Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const userId = userCredential.user.uid;

    // 2. Create Profile in Firestore
    await setDoc(doc(db, `artifacts/${appId}/users/${userId}/userProfile/profile`), {
      fullName: fullName.value,
      email: email.value,
      phoneNumber: phoneNumber.value,
      address: address.value,
      electricityProvider: electricityProvider.value,
      role: "user",
      status: "active",
      subscriptionStatus: "Active", // Added
      subscriptionTier: "Free",     // Added
    });

    // 3. Send Verification
    await sendEmailVerification(userCredential.user);

    isLoading.value = false;
    isVerifyingEmail.value = true;
    startResendTimer();

    if (verificationPollInterval) clearInterval(verificationPollInterval);
    verificationPollInterval = setInterval(checkEmailVerificationStatus, 2000);

  } catch (err) {
    console.error('Registration error:', err.message);
    isLoading.value = false;
    error.value = err.message;
  }
};

const startResendTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
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
      startResendTimer();
    } else {
      error.value = 'Could not resend email. Please try logging in again.';
    }
  } catch (err) {
    error.value = err.message;
  }
};

const handleForgotPassword = async () => {
  error.value = '';
  try {
    await sendPasswordResetEmail(auth, email.value);
    isPasswordResetSuccess.value = true;
    startPasswordResetCountdown();
  } catch (err) {
    error.value = err.message;
  }
};

const startPasswordResetCountdown = () => {
  if (passwordResetTimerInterval) clearInterval(passwordResetTimerInterval);
  passwordResetCountdown.value = 60;
  passwordResetTimerInterval = setInterval(() => {
    if (passwordResetCountdown.value > 0) {
      passwordResetCountdown.value--;
    } else {
      clearInterval(passwordResetTimerInterval);
    }
  }, 1000);
};

onUnmounted(() => {
  clearTimers();
});
</script>

<style scoped>
.checkmark {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #fff;
  stroke-miterlimit: 10;
  box-shadow: inset 0px 0px 0px #059669;
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
    box-shadow: inset 0px 0px 0px 30px #059669;
  }
}
</style>
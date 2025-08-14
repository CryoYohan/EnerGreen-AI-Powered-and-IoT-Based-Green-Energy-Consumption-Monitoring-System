import router from '@/router'

<template>
  <!-- Modal Backdrop -->
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" @click.self="closeModal">
    <!-- Modal Container -->

    <div class="flex w-full max-w-4xl bg-white rounded-lg shadow-xl overflo2w-hidden">
      
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


        <!-- Fallback for other modes -->
        <div class="flex items-center justify-between" v-else>
          <h3 class="text-3xl font-bold">{{ isLoginMode ? 'Log in Account' : 'Create Account' }}</h3>
        </div>
      </div>

      <template v-if="isVerifyingEmail">
        <img class="self-center w-40 h-20" src="/src/Images/icons/mail.svg" alt="mail">
        <p class="mb-6 text-center text-gray-200">
          Please enter the verification code we sent to <br>
          <span class="font-bold">{{ obfuscatedEmail }}</span>
        </p>
        <div class="flex justify-center mb-6 space-x-2">
          <input
            v-for="(digit, index) in verificationCode"
            :key="index"
            type="text"
            maxlength="1"
            v-model="verificationCode[index]"
            class="w-12 h-12 text-2xl text-center bg-transparent border rounded-lg text-b-2lack focus:outline-none"
          />
        </div>
        <button type="button" @click="handleSubmit" class="w-full py-2 mt-2 font-bold text-black transition bg-white rounded-md hover:bg-gray-200">
          Create Account
        </button>
        <p class="mt-4 text-sm text-center text-gray-200">
          Didn’t receive code? <button class="underline">Resend Again</button>
        </p>
      </template>

      <template v-else-if="isLoginMode">
        <p class="mb-6 text-gray-200">Please fill in your information below</p>
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block mb-2 text-white">Email</label>
            <input type="text" v-model="email" required
                  class="w-full px-4 py-2 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
          </div>
          <div class="mb-6">
            <label class="block mb-2 text-white">Password</label>
            <input type="password" v-model="password" required
                  class="w-full px-4 py-2 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
          </div>
          <button type="submit" class="w-full py-2 mt-2 font-bold text-black transition bg-white rounded-lg hover:bg-gray-200">
            Log in
          </button>
          <div v-if="error" class="p-2 mt-4 mb-4 text-sm bg-red-600 rounded text -red-100">
          {{ error }}
        </div>
        </form>
        <div class="mt-6 text-center">
          <button @click="toggleMode" class="text-white hover:underline">
            Don't have an account? Sign up
          </button>
        </div>
      </template>

      <template v-else>
        <p class="mb-6 text-gray-200">Please fill in your information below</p>
        <form @submit.prevent="handleSubmit">
          <div class="mb-2">
            <label class="block text-white">Full Name</label>
            <input type="text" v-model="fullName" required
                  class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
          </div>
          <div class="mb-2">
            <label class="block text-white">Email</label>
            <input type="text" v-model="email" required
                  class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
          </div>
          <div class="mb-2">
            <label class="block text-white">Password</label>
            <input type="password" v-model="password" required
                  class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
          </div>
          <div class="mb-2">
            <label class="block text-white">Confirm Password</label>
            <input type="password" v-model="confirmPassword" required
                  class="w-full px-4 py-1 placeholder-white bg-transparent border border-white rounded-lg focus:outline-none focus:bg-white focus:text-black">
          </div>
          <button type="submit" class="w-full py-2 mt-2 font-bold text-black transition bg-white rounded-lg hover:bg-gray-200">
            Sign up
          </button>
        </form>
        <div class="mt-6 text-center">
          <button @click="toggleMode" class="text-white hover:underline">
            Already have an account? Log in
          </button>
        </div>
      </template>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: Boolean,
    initialMode: {
      type: String,
      default: 'login'
    }
  },
  data() {
    return {
      isLoginMode: this.initialMode === 'login',
      isVerifyingEmail: false,
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      verificationCode: ['', '', '', '', '', ''],
      error: '' // Add error message
    }
  },
  computed: {
    obfuscatedEmail() {
      if (!this.email) return '';
      const [name, domain] = this.email.split('@');
      return `${name[0]}${'*'.repeat(name.length-1)}@${domain}`;
    }
  },
  watch: {
    initialMode(newVal) {
      this.isLoginMode = newVal === 'login';
      this.resetForm();
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
      this.resetForm();
    },
    toggleMode() {
      this.isLoginMode = !this.isLoginMode;
      this.resetForm();
    },
    resetForm() {
      this.error = '';
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
      this.fullName = '';
      this.isVerifyingEmail = false;
    },
    handleSubmit() {
      if (this.isVerifyingEmail) {
        console.log('Verifying code:', this.verificationCode.join(''));
        // You would call your backend API here
        this.closeModal();
        return;
      }

      if (this.isLoginMode) {
        this.handleLogin();
      } else {
        this.handleRegister();
      }
    },
      handleLogin() {           
        console.log('Router object:', this.$router); // Should be defined

        if (this.email === 'admin' && this.password === 'admin') {
          this.error = '';
          this.closeModal();
          console.log('Redirecting to /adminhome');
          this.$router.push('/adminhome').catch(err => {
            console.error('Router error:', err);
          });
        } else if (this.email === 'user' && this.password === 'user') {
          this.error = '';
          this.closeModal();
          console.log('Redirecting to /home');
          this.$router.push('/home').catch(err => {
            console.error('Router error:', err);
          });
        } else {
          this.error = 'Invalid credentials. Use email: user/admin, password: user/admin';
        }
      },



    handleRegister() {
      if (this.password !== this.confirmPassword) {
        this.error = "Passwords don't match!";
        return;
      }
      
      // Registration logic would go here
      this.error = '';
      console.log('Registering:', this.fullName, this.email, this.password);
      // Simulate sending verification email:
      this.isVerifyingEmail = true;
    }
  }
}
</script>
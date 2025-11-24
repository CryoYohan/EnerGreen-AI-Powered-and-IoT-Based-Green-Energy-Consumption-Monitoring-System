// src/services/api.js
import axios from 'axios';
import { auth } from '@/firebase.js'; // Import your firebase auth instance

// 1. Create the Axios Instance
// This reads the VITE_API_BASE_URL from your .env files
// Prod: Uses the proxy (relative path)
// Dev: Uses localhost
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    headers: {
        'Content-Type': 'application/json'
    },
    // Timeout after 2 minutes (good for slow calculations like predictions)
    timeout: 120000
});

// 2. REQUEST INTERCEPTOR (The "Token Injector")
// Before every request is sent...
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;

    if (user) {
        // Get the valid token (Firebase SDK handles refreshing automatically)
        // forceRefresh: false is default, which is good for performance
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// 3. RESPONSE INTERCEPTOR (The "Error Catcher")
// When the response comes back...
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Global Error Logging
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(`API Error: ${error.response.status} - ${error.response.data.error || error.message}`);

            // Handle 401 (Unauthorized) globally
            if (error.response.status === 401) {
                // Optional: You could trigger a logout or redirect here
                console.warn("Session expired or invalid token.");
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error("API Error: No response received from server.");
        } else {
            // Something happened in setting up the request
            console.error("API Error:", error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
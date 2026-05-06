import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';

// Create a professional Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request Interceptor: Attach the Token to ALL requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle session expiry
        if (error.response?.status === 401) {
            console.warn("🔐 Connectivity Protocol Breach: Auto-purging stale identifiers.");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login if not already there and if user was supposed to be logged in
            const publicPaths = ['/login', '/register', '/', '/forgot-password', '/reset-password'];
            const isPublic = publicPaths.some(path => window.location.pathname === path || window.location.pathname.startsWith('/reset-password/'));
            
            if (!isPublic && !window.location.pathname.includes('login')) {
                window.location.href = '/login';
            }
        }
        
        // Debug Logger for the developer
        console.error(`🌐 [API_ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, 
            error.response?.data?.message || error.message);
            
        return Promise.reject(error);
    }
);

export default apiClient;

import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { playSound } from '../utils/soundManager';

// Set base URL for all axios requests - Automatically adapt to mobile/production environments
// Set base URL for all axios requests - Automatically adapt to mobile/production environments
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(window.location.hostname);
axios.defaults.baseURL = (isLocalhost || isIP) ? `http://${window.location.hostname}:5000` : `${window.location.protocol}//${window.location.host}`;
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (err) {
            console.error('Error parsing stored user:', err);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return null;
        }
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial load: Check if user is logged in
    useEffect(() => {
        // GLOBAL INTERCEPTOR FOR SESSION EXPIRY / IDENTIFIER BREACHES
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.warn("🔐 Session Protocol Breach: Auto-purging stale identifiers.");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    delete axios.defaults.headers.common['Authorization'];
                    setUser(null);
                    // Force refresh if on administrative route to prevent stale UI
                    if (window.location.pathname.includes('/admin')) {
                        window.location.href = '/admin-login';
                    }
                }
                return Promise.reject(error);
            }
        );

        const checkLoggedIn = async () => {
            try {
                // We'll use a token stored in localStorage for frontend persistence
                const token = localStorage.getItem('token');
                if (token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await axios.get('/api/v1/auth/me');
                    if (res.data.success) {
                        const userData = res.data.data;
                        if (!userData.id) userData.id = userData._id;
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                } else {
                    setUser(null);
                    localStorage.removeItem('user');
                }
            } catch (err) {
                console.error('Initial auth check failed', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    // Register user
    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (userData.role === 'organizer' && userData.organizationDetails?.logo) {
                // Use FormData for multipart/form-data
                const formData = new FormData();
                formData.append('name', userData.name);
                formData.append('email', userData.email);
                formData.append('phone', userData.phone);
                formData.append('password', userData.password);
                formData.append('role', userData.role);
                formData.append('registrationNumber', userData.organizationDetails.registrationNumber || '');
                
                // Extract logo and put other details back in organizationDetails
                const { logo, ...otherOrgDetails } = userData.organizationDetails;
                formData.append('logo', logo);
                formData.append('organizationDetails', JSON.stringify(otherOrgDetails));

                res = await axios.post('/api/v1/auth/register', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await axios.post('/api/v1/auth/register', userData);
            }

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setUser(res.data.user);
                return { success: true, user: res.data.user };
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Registration failed';
            setError(errorMsg);
            playSound('error');
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (identifier, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/v1/auth/login', { identifier, password });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setError(null);
                setUser(res.data.user);
                playSound('login');
                return { success: true, user: res.data.user };
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
            playSound('error');
            console.error('[AUTH_DEBUG] ERROR:', msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    // Admin stealth login
    const adminLogin = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/v1/auth/admin-login', { email, password });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setUser(res.data.user);
                playSound('login');
                return { success: true, user: res.data.user };
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Admin login failed');
            playSound('error');
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    // Logout user
    const logout = async () => {
        try {
            await axios.get('/api/v1/auth/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            playSound('logout');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    // Refresh user data from server
    const refreshUser = async () => {
        try {
            const res = await axios.get('/api/v1/auth/me');
            if (res.data.success) {
                const userData = res.data.data;
                if (!userData.id) userData.id = userData._id;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
        } catch (err) {
            console.error('Refresh user failed', err);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                register,
                login,
                adminLogin,
                logout,
                refreshUser,
                setError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

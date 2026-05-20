import { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';
import { playSound } from '../utils/soundManager';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
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
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await apiClient.get('/api/v1/auth/me');
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
                // Only purge session if the server explicitly rejects the credentials (401/403)
                // Prevents accidental logouts on transient errors, 502 gateways, or rate-limiting (429)!
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    // Register user
    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (userData.role === 'organizer' && userData.organizationDetails?.logo) {
                const formData = new FormData();
                formData.append('name', userData.name);
                formData.append('email', userData.email);
                formData.append('phone', userData.phone);
                formData.append('password', userData.password);
                formData.append('role', userData.role);
                formData.append('registrationNumber', userData.organizationDetails.registrationNumber || '');
                
                const { logo, ...otherOrgDetails } = userData.organizationDetails;
                formData.append('logo', logo);
                formData.append('organizationDetails', JSON.stringify(otherOrgDetails));

                res = await apiClient.post('/api/v1/auth/register', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await apiClient.post('/api/v1/auth/register', userData);
            }

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
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
            const res = await apiClient.post('/api/v1/auth/login', { identifier, password });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
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
            const res = await apiClient.post('/api/v1/auth/admin-login', { email, password });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
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
    const logout = async () => {
        try {
            await apiClient.get('/api/v1/auth/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            playSound('logout');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    // Refresh user data from server
    const refreshUser = async () => {
        try {
            const res = await apiClient.get('/api/v1/auth/me');
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

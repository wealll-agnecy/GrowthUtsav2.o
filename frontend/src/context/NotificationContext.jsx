import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get('/api/v1/notifications', { withCredentials: true });
            if (res.data.success) {
                setNotifications(res.data.data);
                setUnreadCount(res.data.data.filter(n => !n.isRead).length);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        // Initialize Socket
        const newSocket = io(window.location.origin.includes('5173') ? 'http://localhost:5000' : '/', {
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('🔌 Connected to Notification Stream');
            newSocket.emit('join', user._id || user.id);
        });

        newSocket.on('notification', (notif) => {
            console.log('🔔 New Real-time Notification:', notif);
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show Premium Toast
            toast.success(notif.title || 'New Notification', {
                description: notif.message,
                duration: 5000,
                icon: '🔔'
            });
        });

        setSocket(newSocket);
        fetchNotifications();

        return () => newSocket.disconnect();
    }, [user, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            const res = await axios.patch(`/api/v1/notifications/${id}/read`, {}, { withCredentials: true });
            if (res.data.success) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const clearAll = async () => {
        try {
            const res = await axios.delete('/api/v1/notifications/clear', { withCredentials: true });
            if (res.data.success) {
                setNotifications([]);
                setUnreadCount(0);
                toast.success('Clearance complete');
            }
        } catch (err) {
            console.error('Failed to clear notifications:', err);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            clearAll,
            fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

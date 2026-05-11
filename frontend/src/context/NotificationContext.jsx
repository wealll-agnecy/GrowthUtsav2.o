import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

import API_BASE_URL from '../config/apiConfig';

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
        const newSocket = io(API_BASE_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('ðŸ”Œ Connected to Notification Stream');
            newSocket.emit('join', user._id || user.id);
        });

        const playNotificationSound = () => {
            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play();
            } catch (err) {
                console.warn('Audio playback blocked or failed:', err);
            }
        };

        newSocket.on('notification', (notif) => {
            console.log('ðŸ”” New Real-time Notification:', notif);
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Play notification sound
            playNotificationSound();
            
            // Extract Event ID for redirection
            const eventId = notif.eventId?._id || notif.eventId || notif.event?._id || notif.event;

            // Show Clickable Premium Toast
            toast((t) => (
                <div 
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
                    onClick={() => {
                        if (eventId) {
                            window.location.href = `/events/${eventId}`;
                        } else {
                            window.location.href = '/notifications';
                        }
                        toast.dismiss(t.id);
                    }}
                >
                    <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>ðŸ””</span> {notif.title || 'New Signal'}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{notif.message}</div>
                </div>
            ), {
                duration: 6000,
                position: 'top-right',
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

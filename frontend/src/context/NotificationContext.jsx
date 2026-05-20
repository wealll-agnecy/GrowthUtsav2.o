import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import socketService from '../utils/socketService';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationKeysRef = useRef(new Set());

    const getNotificationKey = useCallback((notif) => {
        if (!notif) return null;
        if (notif._id) return notif._id.toString();
        if (notif.id) return notif.id.toString();

        const eventId = notif.eventId?._id || notif.eventId || notif.event?._id || notif.event;
        if (eventId && notif.type) {
            return `${notif.type}:${eventId}:${notif.title || ''}:${notif.message || ''}`;
        }

        return null;
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await apiClient.get('/api/v1/notifications');
            if (res.data.success) {
                const data = res.data.data;
                notificationKeysRef.current = new Set(data.map(getNotificationKey).filter(Boolean));
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, [user, getNotificationKey]);

    useEffect(() => {
        if (!user) {
            notificationKeysRef.current.clear();
            socketService.disconnect();
            return;
        }

        const socketInstance = socketService.connect(user._id || user.id);

        const playNotificationSound = () => {
            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play();
            } catch (err) {
                console.warn('Audio playback blocked or failed:', err);
            }
        };

        const handleNotification = (notif) => {
            console.log('[SIGNAL] New Real-time Notification:', notif);
            const notificationKey = getNotificationKey(notif);
            if (notificationKey && notificationKeysRef.current.has(notificationKey)) {
                return;
            }

            if (notificationKey) {
                notificationKeysRef.current.add(notificationKey);
            }

            setNotifications(prev => [notif, ...prev]);
            if (!notif.isRead) {
                setUnreadCount(prev => prev + 1);
            }
            
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
                        <span>[!]</span> {notif.title || 'New Signal'}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{notif.message}</div>
                </div>
            ), {
                duration: 6000,
                position: 'top-right',
            });
        };

        // Ensure we don't attach duplicate listeners on double effect mounts (StrictMode)
        socketInstance.off('notification');
        socketInstance.on('notification', handleNotification);

        fetchNotifications();

        return () => {
            socketInstance.off('notification', handleNotification);
        };
    }, [user, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            const res = await apiClient.patch(`/api/v1/notifications/${id}/read`);
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
            const res = await apiClient.delete('/api/v1/notifications/clear');
            if (res.data.success) {
                setNotifications([]);
                setUnreadCount(0);
                notificationKeysRef.current.clear();
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

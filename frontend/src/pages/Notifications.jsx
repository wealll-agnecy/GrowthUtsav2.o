import React from 'react';
import { Container } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
    const { notifications, markAsRead, clearAll } = useNotifications();
    const navigate = useNavigate();

    const getEmoji = (type) => {
        switch (type) {
            case 'new_event': return '🎉';
            case 'event_reminder': return '⏰';
            case 'booking_confirmed': return '🎟️';
            default: return '🔔';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const handleNotifClick = (notif) => {
        if (!notif.isRead && notif._id) markAsRead(notif._id);

        const targetEventId = notif.eventId?._id || notif.eventId;
        if (targetEventId) {
            navigate(`/events/${targetEventId}`);
        }
    };

    return (
        <div className="page-wrapper min-vh-100">
            <Container className="notifications-container">
                <div className="notifications-header">
                    <h3>Notifications</h3>
                    {notifications.length > 0 && (
                        <button className="mark-read-btn" onClick={clearAll}>
                            Mark all as read
                        </button>
                    )}
                </div>

                <AnimatePresence mode="popLayout">
                    {notifications.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="empty-state"
                        >
                            <p>No notifications yet</p>
                        </motion.div>
                    ) : (
                        <div className="notifications-list">
                            {notifications.map((notif, i) => (
                                <motion.div
                                    key={notif._id || i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`notification-card ${notif.isRead ? "" : "unread"}`}
                                    onClick={() => handleNotifClick(notif)}
                                >
                                    <div className="notif-left">
                                        <span className="notif-icon">{getEmoji(notif.type)}</span>
                                    </div>

                                    <div className="notif-content">
                                        <h4 className="notif-title">{notif.title}</h4>
                                        <p className="notif-message">{notif.message}</p>
                                    </div>

                                    <div className="notif-right">
                                        <span className="notif-time">{formatTime(notif.createdAt)}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </Container>
        </div>
    );
};

export default Notifications;


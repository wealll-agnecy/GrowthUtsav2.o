import React from 'react';
import { Container, Badge, Button, Row, Col, Card } from 'react-bootstrap';
import { FaBell, FaCheck, FaCalendarAlt, FaTicketAlt, FaShieldAlt, FaTrashAlt, FaPlusCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { notifications, markAsRead, clearAll } = useNotifications();
    const navigate = useNavigate();

    const getIcon = (type) => {
        switch (type) {
            case 'new_event': return <FaPlusCircle className="text-primary" />;
            case 'event_reminder': return <FaCalendarAlt className="text-warning" />;
            case 'booking_confirmed': return <FaTicketAlt className="text-success" />;
            default: return <FaBell className="text-info" />;
        }
    };

    const handleNotifClick = (notif) => {
        console.log('🔗 [DEBUG]: Notification Clicked:', notif);
        if (!notif.isRead && notif._id) markAsRead(notif._id);

        const targetEventId = notif.eventId?._id || notif.eventId;
        if (targetEventId) {
            console.log(`🚀 [NAVIGATE]: Redirecting to Event ${targetEventId}`);
            navigate(`/events/${targetEventId}`);
        } else {
            console.warn('⚠️ [DEBUG]: No eventId found in notification');
        }
    };

    return (
        <div className="page-wrapper pb-5 min-vh-100">
            <Container fluid className="px-md-5">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5 mt-4 d-flex justify-content-between align-items-end">
                    <div>
                        <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                            <FaShieldAlt className="me-2" /> Global Alert Node
                        </Badge>
                        <h1 className="fw-black m-0 tracking-tighter text-white" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                            <span className="gradient-text">Notifications</span>
                        </h1>
                    </div>
                    {notifications.length > 0 && (
                        <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                            onClick={clearAll}
                        >
                            <FaTrashAlt size={12} /> Clear All
                        </Button>
                    )}
                </motion.div>

                <Row className="justify-content-center">
                    <Col lg={8}>
                        <AnimatePresence mode="popLayout">
                            {notifications.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Card className="glass-panel text-center py-5 rounded-5 border-white/5 shadow-2xl">
                                        <div className="display-4 opacity-10 mb-4">📡</div>
                                        <h4 className="fw-black text-white-50 uppercase tracking-widest">No Signals Detected</h4>
                                        <p className="text-soft mt-2 fw-medium">All quadrants are clear. Check back later for event updates.</p>
                                    </Card>
                                </motion.div>
                            ) : (
                                notifications.map((notif, i) => (
                                    <motion.div
                                        key={notif._id || i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`glass-panel p-4 mb-3 rounded-4 border-white/5 shadow-premium transition-all cursor-pointer ${!notif.isRead ? 'border-primary/30 bg-primary/5' : 'opacity-80'}`}
                                        onClick={() => handleNotifClick(notif)}
                                    >
                                        <Row className="align-items-center g-3">
                                            <Col xs="auto">
                                                <div className={`rounded-circle p-3 d-flex align-items-center justify-content-center shadow-lg bg-dark border border-white/5`}>
                                                    {getIcon(notif.type)}
                                                </div>
                                            </Col>
                                            <Col>
                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                    <Badge bg="transparent" className="text-primary p-0 small fw-black text-uppercase tracking-widest mb-2 border-0 opacity-80" style={{ fontSize: '0.65rem' }}>{notif.type.replace('_', ' ')}</Badge>
                                                    <span className="text-soft small opacity-40 font-monospace" style={{ fontSize: '0.65rem' }}>{new Date(notif.createdAt).toLocaleString()}</span>
                                                </div>
                                                <h5 className="text-bright fw-bold mb-1 mb-0">{notif.title}</h5>
                                                <p className={`fw-medium mb-0 ${!notif.isRead ? 'text-soft' : 'text-muted'}`} style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>{notif.message}</p>
                                            </Col>
                                            <Col xs="auto">
                                                {!notif.isRead && (
                                                    <div className="unread-dot bg-primary shadow-glow-primary"></div>
                                                )}
                                            </Col>
                                        </Row>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Notifications;

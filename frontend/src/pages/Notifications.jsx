import { useState, useEffect } from 'react';
import { Container, Badge, Button, Row, Col, Card } from 'react-bootstrap';
import { FaBell, FaCheck, FaCalendarAlt, FaTicketAlt, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/v1/auth/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/v1/auth/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark read');
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'event_created': return <FaPlusCircle className="text-primary" />;
            case 'event_reminder': return <FaCalendarAlt className="text-warning" />;
            case 'booking_confirmed': return <FaTicketAlt className="text-success" />;
            default: return <FaBell className="text-info" />;
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <FaBell size={40} className="animate-pulse text-primary opacity-50" />
        </div>
    );

    return (
        <div className="page-wrapper pb-5">
            <Container fluid className="px-md-5">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5 mt-4">
                    <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                        <FaShieldAlt className="me-2" /> Global Alert Node
                    </Badge>
                    <h1 className="fw-black m-0 tracking-tighter text-white" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        In-App <span className="gradient-text">Signals</span>
                    </h1>
                </motion.div>

                <Row className="justify-content-center">
                    <Col lg={8}>
                        <AnimatePresence>
                            {notifications.length === 0 ? (
                                <Card className="glass-panel text-center py-5 rounded-5 border-white/5 shadow-2xl">
                                    <div className="display-4 opacity-10 mb-4 animate-float">📡</div>
                                    <h4 className="fw-black text-white-50 uppercase tracking-widest">No Signals Detected</h4>
                                    <p className="text-soft mt-2 fw-medium">All quadrants are clear. Check back later for event updates.</p>
                                </Card>
                            ) : (
                                notifications.map((notif, i) => (
                                    <motion.div 
                                        key={notif._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`glass-panel p-4 mb-3 rounded-4 border-white/5 shadow-premium transition-all hover-scale-sm ${!notif.isRead ? 'border-primary/30 bg-primary/5' : ''}`}
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
                                                <h6 className={`fw-black mb-1 p-0 m-0 ${!notif.isRead ? 'text-bright' : 'text-soft opacity-60'}`} style={{ fontSize: '1rem', lineHeight: 1.4 }}>{notif.message}</h6>
                                            </Col>
                                            <Col xs="auto">
                                                {!notif.isRead && (
                                                    <Button 
                                                        variant="link" 
                                                        className="p-2 rounded-circle hover-bg-white/5 shadow-none text-primary"
                                                        onClick={() => markAsRead(notif._id)}
                                                        title="Dismiss Alert"
                                                    >
                                                        <FaCheck />
                                                    </Button>
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

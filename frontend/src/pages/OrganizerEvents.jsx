import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as eventApi from '../api/eventApi';
import * as analyticsApi from '../api/analyticsApi';
import { Button, Badge, Row, Col } from 'react-bootstrap';
import OrganizerEventCard from '../components/events/OrganizerEventCard';
import StatsCard from '../components/analytics/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSatellite, FaRocket, FaWallet, FaTicketAlt, FaCalendarCheck } from 'react-icons/fa';


const OrganizerEvents = () => {
    const [events, setEvents] = useState([]);
    const [orgStats, setOrgStats] = useState({ totalEvents: 0, totalRevenue: 0, totalTicketsSold: 0 });
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const [showCeleb, setShowCeleb] = useState(false);

    useEffect(() => {
        if (user?.role === 'organizer' && user?.status === 'verified') {
            const hasCelebrated = localStorage.getItem(`celebrated_${user.id}`);
            if (!hasCelebrated) {
                setShowCeleb(true);
            }
        }
    }, [user]);

    const closeCeleb = () => {
        localStorage.setItem(`celebrated_${user.id}`, 'true');
        setShowCeleb(false);
    };

    const fetchEvents = async () => {
        try {
            const [eventsRes, statsRes] = await Promise.all([
                eventApi.getMyEvents(),
                analyticsApi.getOrganizerStats()
            ]);
            setEvents(eventsRes.data?.data || []);
            setOrgStats(statsRes.data?.data || { totalEvents: 0, totalRevenue: 0, totalTicketsSold: 0 });
        } catch (err) {
            console.error('Failed to fetch node data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);


    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-transparent">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <FaRocket size={50} className="text-primary opacity-50" />
            </motion.div>
        </div>
    );

    return (
        <div className="dashboard-content-premium">
            <AnimatePresence>
                {showCeleb && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.5, y: 100 }}
                            className="glass-card p-5 text-center rounded-5 border-primary shadow-2xl overflow-hidden position-relative"
                            style={{ maxWidth: '500px' }}
                        >
                            <motion.div 
                                className="position-absolute top-0 start-0 w-100 h-100 opacity-20"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                style={{ background: 'conic-gradient(from 0deg, var(--primary), transparent, var(--secondary), transparent, var(--primary))' }}
                            />
                            <div className="position-relative">
                                <div className="display-1 mb-4">🏆</div>
                                <h2 className="fw-black text-white mb-3 uppercase tracking-tighter" style={{ fontSize: '2.5rem' }}>Verified!</h2>
                                <p className="text-white-50 fs-5 mb-5 fw-medium">🎉 Congratulations! You are now a part of GrowthUtsav</p>
                                <Button 
                                    variant="primary" 
                                    onClick={closeCeleb}
                                    className="rounded-pill w-100 btn fw-medium px-4 py-2"
                                >
                                    Let's Go!
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-4 pt-4"
            >
                <div className="flex-grow-1">
                    <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                        <FaSatellite className="me-2" /> Global Management Hub
                    </Badge>
                    <h1 className="fw-black m-0 tracking-tighter text-white" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1 }}>
                        My <span className="gradient-text">Events</span>
                    </h1>
                    <p className="text-white-50 mt-3 fw-medium tracking-wide text-uppercase small opacity-60">
                        Monitoring {orgStats.totalEvents} active event nodes across the infrastructure
                    </p>
                </div>
                <Button
                    as={Link}
                    to="/organizer/create-event"
                    className="d-flex align-items-center gap-3 transition-all btn rounded-pill fw-medium px-4 py-2"
                >
                    <FaPlus /> Create Event
                </Button>
            </motion.div>

            {/* ─── Stats Row ─── */}
            <Row className="g-4 mb-5">
                <Col lg={4}>
                    <StatsCard 
                        title="Aggregate Revenue" 
                        value={`₹${(orgStats.totalRevenue || 0).toLocaleString()}`} 
                        icon={<FaWallet />} 
                        color="#8b5cf6" 
                        delay={0.1}
                    />
                </Col>
                <Col lg={4}>
                    <StatsCard 
                        title="Ticket Circulation" 
                        value={orgStats.totalTicketsSold} 
                        icon={<FaTicketAlt />} 
                        color="#ec4899" 
                        delay={0.2}
                    />
                </Col>
                <Col lg={4}>
                    <StatsCard 
                        title="Active Nodes" 
                        value={orgStats.approvedEvents} 
                        icon={<FaCalendarCheck />} 
                        color="#06b6d4" 
                        delay={0.3}
                    />
                </Col>
            </Row>


            {(events || []).length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-5 glass-card rounded-5 border-white/5 shadow-2xl"
                >
                    <div className="display-1 mb-4 opacity-10">🔭</div>
                    <h4 className="fw-black text-white-50 mb-4 tracking-widest uppercase">No Events Detected</h4>
                    <Button as={Link} to="/organizer/create-event" variant="primary" className="rounded-pill btn fw-medium px-4 py-2">INITIALIZE FIRST EVENT</Button>
                </motion.div>
            ) : (
                <Row className="g-4">
                    {(events || []).map((event, idx) => (
                        <Col key={event._id} xl={4} lg={6} md={6}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <OrganizerEventCard event={event} />
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default OrganizerEvents;

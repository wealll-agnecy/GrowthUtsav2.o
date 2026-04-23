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
        <div className="dashboard-page">
            <AnimatePresence>
                {showCeleb && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ zIndex: 9999, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="dashboard-card p-5 text-center shadow-2xl"
                            style={{ maxWidth: '500px' }}
                        >
                            <div className="display-1 mb-4">🏆</div>
                            <h2 className="dashboard-title-main mb-3 uppercase tracking-tighter">Verified!</h2>
                            <p className="dashboard-subtext fs-5 mb-5 fw-medium">🎉 Congratulations! You are now a part of GrowthUtsav</p>
                            <Button 
                                className="btn btn-pink w-100 fw-bold py-3 px-5 rounded-pill"
                                onClick={closeCeleb}
                            >
                                Let's Go!
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-4">
                <div>
                    <h1 className="dashboard-title-main">My Events</h1>
                    <p className="dashboard-subtext">
                        Monitoring {orgStats.totalEvents} active event nodes across the infrastructure.
                    </p>
                </div>
                <Button
                    as={Link}
                    to="/organizer/create-event"
                    className="btn btn-pink d-flex align-items-center gap-3 transition-all rounded-pill fw-bold px-4 py-3"
                >
                    <FaPlus /> Create Event
                </Button>
            </div>

            {/* ─── Stats Grid ─── */}
            <div className="stats-grid-saas mb-5">
                <div className="dashboard-card shadow-sm">
                    <span className="card-title-sm">Aggregate Revenue</span>
                    <h3 className="card-value-lg">₹{(orgStats.totalRevenue || 0).toLocaleString()}</h3>
                    <div className="mt-2 text-success small fw-bold">Global Balance</div>
                </div>
                <div className="dashboard-card shadow-sm">
                    <span className="card-title-sm">Ticket Circulation</span>
                    <h3 className="card-value-lg">{orgStats.totalTicketsSold}</h3>
                    <div className="mt-2 text-pink small fw-bold">Sold Out Capacity</div>
                </div>
                <div className="dashboard-card shadow-sm">
                    <span className="card-title-sm">Active Nodes</span>
                    <h3 className="card-value-lg">{orgStats.approvedEvents}</h3>
                    <div className="mt-2 text-slate small fw-bold">Live Catalog</div>
                </div>
            </div>


            {(events || []).length === 0 ? (
                <div className="dashboard-card text-center py-5 shadow-sm">
                    <div className="display-1 mb-4 opacity-10">🔭</div>
                    <h4 className="dashboard-title-main mb-4" style={{ fontSize: '1.5rem' }}>No Events Detected</h4>
                    <Button as={Link} to="/organizer/create-event" className="btn btn-pink rounded-pill fw-bold px-4 py-2">INITIALIZE FIRST EVENT</Button>
                </div>
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

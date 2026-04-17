import React, { useState, useEffect } from 'react';
import { Row, Col, Badge, Card, Button, Spinner } from 'react-bootstrap';
import { 
    FaQrcode, FaShieldAlt, FaMapMarkerAlt, FaUsers, FaArrowRight, 
    FaClock, FaCheckCircle, FaExclamationTriangle, FaSatellite
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StaffDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ totalScans: 0, activeEventsCount: 0, staffRole: 'Gate' });
    const [loading, setLoading] = useState(true);
    const [todayEvents, setTodayEvents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [meRes, statsRes, todayRes] = await Promise.all([
                    axios.get('/api/v1/auth/me'),
                    axios.get('/api/v1/analytics/staff'),
                    axios.get('/api/v1/tickets/today')
                ]);
                setUser(meRes.data.data);
                setStats(statsRes.data.data);
                setTodayEvents(todayRes.data.data);
            } catch (err) {
                console.error('Failed to fetch operational node data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-transparent">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <FaShieldAlt size={50} className="text-primary opacity-50" />
            </motion.div>
        </div>
    );

    const displayStats = [
        { label: 'Scanner Nodes', value: 'ONLINE', icon: <FaQrcode />, color: '#10b981', delay: 0.1 },
        { label: 'Today\'s Volume', value: (stats?.todayScans || 0).toLocaleString(), icon: <FaShieldAlt />, color: '#3b82f6', delay: 0.2 },
        { label: 'Total Inflow', value: (stats?.totalScans || 0).toLocaleString(), icon: <FaUsers />, color: '#ec4899', delay: 0.3 }
    ];

    const assignedEvents = user?.assignedEvents || [];
    const recentScans = stats?.recentScans || [];

    return (
        <div className="dashboard-content-premium">
            {/* ─── Header ─── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="mb-5 d-flex justify-content-between align-items-end"
            >
                <div>
                    <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                        <FaShieldAlt className="me-2" /> Operations Console
                    </Badge>
                    <h1 className="fw-black m-0 tracking-tighter text-white" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1 }}>
                        Sector <span className="gradient-text">Operations</span>
                    </h1>
                </div>
                <div className="text-end d-none d-md-block">
                    <div className="text-white-50 small uppercase tracking-widest fw-black opacity-40">Active Operator</div>
                    <div className="text-white fw-bold">{user?.name}</div>
                </div>
            </motion.div>


            {/* ─── High-Fidelity Stats ─── */}
            <Row className="g-4 mb-5">
                {displayStats.map((stat, i) => (
                    <Col key={i} lg={4} md={6}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: stat.delay }}
                            className="glass-card p-4 rounded-4 border-white/5 shadow-2xl d-flex align-items-center gap-4 hover-scale transition-all"
                        >
                            <div
                                className="rounded-4 p-3 d-flex align-items-center justify-content-center shadow-lg"
                                style={{ background: `${stat.color}15`, color: stat.color, border: `1px solid ${stat.color}30` }}
                            >
                                {stat.icon}
                            </div>
                            <div>
                                <div className="text-white-50 small fw-black uppercase tracking-widest opacity-60" style={{ fontSize: '0.65rem' }}>{stat.label}</div>
                                <div className="fw-black h2 m-0 text-white tracking-widest uppercase">{stat.value}</div>
                            </div>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            {/* ─── Recent Scans (New) ─── */}
            <div className="mb-5">
                <h5 className="text-white fw-black m-0 ms-1 mb-4 small uppercase tracking-widest d-flex align-items-center gap-3">
                    <FaCheckCircle className="text-success" /> Recent Clearances
                </h5>
                <Card className="saas-card border-0 rounded-5 shadow-2xl overflow-hidden bg-white/2">
                    <div className="table-responsive">
                        <table className="table table-dark table-hover m-0">
                            <thead>
                                <tr className="border-white/5">
                                    <th className="px-4 py-3 small uppercase tracking-widest opacity-40 fw-black">Attendee</th>
                                    <th className="px-4 py-3 small uppercase tracking-widest opacity-40 fw-black">Identification</th>
                                    <th className="px-4 py-3 small uppercase tracking-widest opacity-40 fw-black">Node Type</th>
                                    <th className="px-4 py-3 small uppercase tracking-widest opacity-40 fw-black">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentScans.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5 text-white-50 small uppercase tracking-widest opacity-30">No scans recorded in current session</td>
                                    </tr>
                                ) : (
                                    recentScans.map((scan, i) => (
                                        <tr key={i} className="border-white/5 align-middle">
                                            <td className="px-4 py-3 fw-bold">{scan.attendee}</td>
                                            <td className="px-4 py-3 font-monospace small opacity-70">{scan.code}</td>
                                            <td className="px-4 py-3">
                                                <Badge className="bg-white/10 text-white-50 px-3 py-1 rounded-pill small fw-bold">{scan.type}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-white-50 small">{new Date(scan.time).toLocaleTimeString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* ─── Assigned Events Grid ─── */}
            <div className="mb-4">
                <h5 className="text-white fw-black m-0 ms-1 mb-4 small uppercase tracking-widest d-flex align-items-center gap-3">
                    <FaClock className="text-primary" /> Assigned Deployment Nodes
                </h5>

                <Row className="g-4">
                    {assignedEvents.length === 0 ? (
                        <Col xs={12}>
                            <Card className="saas-card p-5 text-center border-0 rounded-5 shadow-2xl bg-white/2">
                                <h4 className="fw-black text-white-50 mb-0 tracking-widest uppercase small">No specific nodes assigned</h4>
                            </Card>
                        </Col>
                    ) : (
                        assignedEvents.map((event, idx) => (
                            <Col key={event._id} xl={4} lg={6} md={6}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="saas-card border-0 rounded-5 overflow-hidden shadow-2xl h-100 hover-scale transition-all cursor-pointer">
                                        <Card.Body className="p-4 d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-start mb-4">
                                                <Badge className="bg-success-subtle text-success border border-success-light px-3 py-2 rounded-pill fw-black uppercase tracking-widest small active-glow">
                                                    {event.status === 'live' ? 'LIVE NOW' : 'STANDBY'}
                                                </Badge>
                                                <div className="text-white-50 fw-black font-monospace opacity-30">#{event._id.slice(-6).toUpperCase()}</div>
                                            </div>
                                            <h4 className="fw-black text-white mb-2 tracking-tighter">{event.title}</h4>
                                            <p className="text-white-50 small fw-medium mb-4 d-flex align-items-center gap-2">
                                                <FaMapMarkerAlt className="text-primary" /> {event.venue}
                                            </p>
                                            <div className="mt-auto pt-4 border-top border-white/5 d-flex justify-content-between align-items-center">
                                                <div className="text-white-50 small fw-black tracking-widest uppercase opacity-60">
                                                    {new Date(event.date).toLocaleDateString()}
                                                </div>
                                                <Button
                                                    as={Link}
                                                    to="/staff/scanner"
                                                    state={{ eventId: event._id, eventTitle: event.title }}
                                                    className="px-4 py-2 btn rounded-pill fw-medium"
                                                >
                                                    ENGAGE <FaArrowRight className="ms-1" />
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))
                    )}
                </Row>
            </div>

            {/* ─── Global Daily Deployments ─── */}
            <div className="mb-5 mt-5">
                <h5 className="text-white fw-black m-0 ms-1 mb-4 small uppercase tracking-widest d-flex align-items-center gap-3">
                    <FaSatellite className="text-primary" /> Global Daily Deployments
                </h5>
                <Row className="g-4">
                    {todayEvents.length === 0 ? (
                        <Col xs={12}>
                            <Card className="saas-card pt-4 pb-4 text-center border-0 rounded-5 bg-white/2">
                                <p className="text-white-50 m-0 small fw-bold uppercase tracking-widest opacity-40">No other active nodes detected for today</p>
                            </Card>
                        </Col>
                    ) : (
                        todayEvents.map((event, idx) => (
                            <Col key={event._id} xl={4} lg={6} md={6}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <div className="glass-panel p-4 rounded-5 border-white/5 d-flex align-items-center justify-content-between hover-bg-white/5 transition-all shadow-lg bg-white/2">
                                        <div>
                                            <h6 className="text-white fw-black m-0 mb-1 tracking-tight">{event.title}</h6>
                                            <div className="text-white-50 small opacity-60 uppercase tracking-widest fw-black" style={{ fontSize: '0.6rem' }}>
                                                {event.status} • {event.venue}
                                            </div>
                                        </div>
                                        <Button
                                            as={Link}
                                            to="/staff/scanner"
                                            state={{ eventId: event._id, eventTitle: event.title }}
                                            className="rounded-pill py-2 btn fw-medium px-4"
                                            style={{ fontSize: '0.65rem' }}
                                        >
                                            SELECT
                                        </Button>
                                    </div>
                                </motion.div>
                            </Col>
                        ))
                    )}
                </Row>
            </div>
        </div>
    );
};

export default StaffDashboard;

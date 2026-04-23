import { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, Card, Button, Table, Spinner } from 'react-bootstrap';
import { 
    FaTicketAlt, FaHistory, FaUserCircle, FaCompass, 
    FaCalendarCheck, FaArrowRight, FaRocket, FaShieldAlt, FaExternalLinkAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as bookingApi from '../api/bookingApi';

const AttendeeDashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await bookingApi.getMyBookings();
                setBookings(res.data.data || []);
            } catch (err) {
                console.error('Data Sync Failure:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const activeTicketsCount = bookings.filter(b => b.paymentStatus === 'completed').length;
    const totalSpent = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    const stats = [
        { label: 'Active Tickets', value: activeTicketsCount, icon: <FaTicketAlt />, color: '#8b5cf6', delay: 0.1 },
        { label: 'Total Reservations', value: bookings.length, icon: <FaHistory />, color: '#ec4899', delay: 0.2 },
        { label: 'Aggregate Spend', value: `₹${totalSpent}`, icon: <FaRocket />, color: '#06b6d4', delay: 0.3 }
    ];

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-transparent">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <FaCompass size={50} className="text-primary opacity-50" />
            </motion.div>
        </div>
    );

    return (
        <div className="dashboard-content-premium">
            {/* ─── Header ─── */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="mb-5 d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 pt-4 pt-md-2"
            >
                <div className="flex-grow-1">
                    <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                       <FaUserCircle className="me-2" /> Attendee Protocol Node
                    </Badge>
                    <h1 className="fw-black m-0 tracking-tighter text-white" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1 }}>
                        Welcome, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}</span>
                    </h1>
                    <p className="text-white-50 mt-3 mb-0 fw-medium text-uppercase small tracking-widest opacity-60">
                        Monitoring your participation infrastructure and clearance passes
                    </p>
                </div>
                <Button 
                    as={Link} 
                    to="/events" 
                    className="btn btn-pink px-4 px-md-5 d-flex align-items-center justify-content-center gap-3 transition-all w-100 w-lg-auto mt-3 mt-lg-0 rounded-pill fw-medium py-2"
                >
                    <FaCompass /> Discover Events
                </Button>
            </motion.div>


            {/* ─── Stats ─── */}
            <Row className="g-3 g-md-4 mb-5">
                {stats.map((stat, i) => (
                    <Col key={i} lg={4} xs={12} md={6}>
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
                                <div className="fw-black h2 m-0 text-white tracking-widest">{stat.value}</div>
                            </div>
                        </motion.div>
                    </Col>
                ))}
            </Row>


            {/* ─── Upcoming Events Section ─── */}
            <h5 className="text-white fw-black mb-4 small uppercase tracking-widest d-flex align-items-center gap-3">
                <FaCalendarCheck className="text-primary" /> Impending Deployments (Upcoming)
            </h5>
            <Row className="g-4 mb-5">
                {bookings.filter(b => new Date(b.event?.date) > new Date()).slice(0, 3).map((booking, idx) => (
                    <Col key={idx} md={4}>
                        <motion.div whileHover={{ y: -5 }} className="glass-card p-4 rounded-4 border-white/5 shadow-2xl h-100">
                            <div className="d-flex justify-content-between mb-3 border-bottom border-white/5 pb-3">
                                <Badge bg="primary-subtle" text="primary" className="fw-black px-3 py-2 rounded-pill small uppercase tracking-widest">{booking.event?.category}</Badge>
                                <span className="text-primary-light fw-black small font-monospace tracking-tighter shadow-glow">T-{(Math.ceil((new Date(booking.event?.date) - new Date()) / (1000 * 60 * 60 * 24)))} DAYS</span>
                            </div>
                            <h6 className="fw-black text-bright mb-3 tracking-tighter fs-5">{booking.event?.title}</h6>
                            <div className="text-soft small mb-4 fw-medium flex-grow-1">
                                <div className="mb-2"><FaCalendarCheck className="me-2 text-primary" /> {new Date(booking.event?.date).toLocaleDateString()}</div>
                                <div>📍 {booking.event?.venue}</div>
                            </div>
                            <Button as={Link} to={`/tickets/${booking._id}`} className="btn btn-outline-pink w-100 transition-all rounded-pill fw-medium px-4 py-2">Access Passport</Button>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            {/* ─── Main Content Grid ─── */}
            <Row className="g-4">
                <Col lg={12}>

                    <Card className="saas-card h-100 p-0 border-0 overflow-hidden shadow-2xl">
                        <div className="p-4 d-flex justify-content-between align-items-center bg-white/2 border-bottom border-white/5">
                            <h5 className="text-white fw-black m-0 small uppercase tracking-widest d-flex align-items-center gap-3">
                                <FaCalendarCheck className="text-primary" /> Active Ticket manifest
                            </h5>
                            <Badge className="bg-primary-subtle text-primary px-3 py-2 rounded-pill small fw-black uppercase tracking-widest border border-primary/20">
                                {activeTicketsCount} ACTIVE PASSPORT{activeTicketsCount !== 1 ? 'S' : ''}
                            </Badge>
                        </div>
                        <Card.Body className="p-0">
                            {bookings.length === 0 ? (
                                <div className="p-5 text-center py-5">
                                    <div className="display-1 opacity-10 mb-4 animate-pulse">🎫</div>
                                    <h4 className="fw-black text-white-50 mb-4 tracking-widest uppercase">No Deployments Detected</h4>
                                    <Button as={Link} to="/events" className="btn btn-pink rounded-pill fw-medium px-4 py-2">Initialize Discovery</Button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table className="m-0 text-white align-middle" hover variant="dark" style={{ background: 'transparent' }}>
                                        <thead className="bg-white/2">
                                            <tr>
                                                <th className="px-4 py-3 border-0 small fw-black text-white-50 text-uppercase tracking-widest">Event Node</th>
                                                <th className="py-3 border-0 small fw-black text-white-50 text-uppercase tracking-widest">Clearance Type</th>
                                                <th className="py-3 border-0 small fw-black text-white-50 text-uppercase tracking-widest">Qty</th>
                                                <th className="py-3 border-0 small fw-black text-white-50 text-uppercase tracking-widest">Status</th>
                                                <th className="py-3 border-0 small fw-black text-white-50 text-uppercase tracking-widest">Amount</th>
                                                <th className="px-4 py-3 border-0 text-end pe-5 small fw-black text-white-50 text-uppercase tracking-widest">Command</th>
                                            </tr>
                                        </thead>
                                        <tbody className="border-0">
                                            {bookings.map((booking, idx) => (
                                                <tr key={booking._id} className="border-bottom border-white/5 hover-bg-white/5 transition-all">
                                                    <td className="px-4 py-4 fw-bold">
                                                        <div className="text-white fs-6 mb-1">{booking.event?.title || 'Unknown Event'}</div>
                                                        <div className="text-white-50 small font-monospace opacity-50">#{booking._id.slice(-8).toUpperCase()}</div>
                                                    </td>
                                                    <td className="py-4 text-white-50">{booking.ticketType}</td>
                                                    <td className="py-4 text-white-50">{booking.quantity}</td>
                                                    <td className="py-4">
                                                        <Badge bg={booking.paymentStatus === 'completed' ? 'success-subtle' : 'warning-subtle'} 
                                                               text={booking.paymentStatus === 'completed' ? 'success' : 'warning'}
                                                               className="rounded-pill px-3 py-2 fw-black small text-uppercase tracking-widest">
                                                            {booking.paymentStatus}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 fw-black text-primary-light">₹{booking.totalAmount}</td>
                                                    <td className="px-4 py-4 text-end pe-5">
                                                        <Button 
                                                            as={Link} 
                                                            to={`/tickets/${booking._id}`}
                                                            disabled={booking.paymentStatus !== 'completed'}
                                                            className="btn btn-pink px-4 py-2 d-inline-flex align-items-center gap-2 rounded-pill fw-medium"
                                                        >
                                                            ACCESS PASS <FaExternalLinkAlt size={10} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AttendeeDashboard;

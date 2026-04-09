import { useState, useEffect } from 'react';
import * as bookingApi from '../api/bookingApi';
import { Container, Row, Col, Card, Badge, Alert, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaRocket, FaClock, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await bookingApi.getMyBookings();
                setBookings(res.data?.data || []);
            } catch (err) {
                setError('Failed to fetch your bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: '80vh', paddingTop: 'var(--navbar-height)' }}
            >
                <FaTicketAlt size={40} className="text-primary-light mb-3" />
                <p className="text-soft fw-black">Loading your bookings...</p>
            </div>
        );
    }

    const getBannerUrl = (booking) => {
        const img = booking.event?.bannerImage;
        if (!img || img === 'no-photo.jpg') return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800';
        return img;
    };

    return (
        <div className="page-wrapper pb-5">
            <Container fluid className="px-md-5">
                {/* ─── Header ─── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5 mt-4 mt-md-2"
                >
                    <div className="flex-grow-1">
                        <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                            <FaTicketAlt className="me-2" /> Digital Asset Vault
                        </Badge>
                        <h1 className="fw-black m-0 tracking-tighter text-bright" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1 }}>
                            My <span className="gradient-text">Bookings</span>
                        </h1>
                    </div>
                    <div className="text-md-end d-flex align-items-center gap-3">
                        <span className="text-soft fw-black uppercase tracking-widest small">Active Clearances:</span>
                        <span className="text-primary-light fw-black h2 m-0 gradient-text shadow-glow">{(bookings || []).length}</span>
                    </div>
                </motion.div>


                {/* ─── Error ─── */}
                {error && (
                    <Alert variant="danger" className="d-flex align-items-center gap-3 mb-4">
                        <FaShieldAlt size={18} className="flex-shrink-0" />
                        <span className="fw-semibold">{error}</span>
                    </Alert>
                )}

                {/* ─── Bookings List ─── */}
                <AnimatePresence mode="wait">
                    {bookings.length === 0 ? (
                        <motion.div
                            initial={{ scale: 0.97, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-panel rounded-4 text-center py-5 px-4"
                        >
                            <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🎫</div>
                            <h4 className="fw-bold mb-2 text-bright">No Bookings Yet</h4>
                            <p className="text-soft" style={{ maxWidth: 380, margin: '0 auto 1.5rem' }}>
                                You haven't booked any events. Explore hundreds of exciting events and secure your spot!
                            </p>
                            <Button
                                as={Link}
                                to="/events"
                                variant="primary"
                                className="fw-bold px-5"
                            >
                                <FaRocket className="me-2" /> Explore Events
                            </Button>
                        </motion.div>
                    ) : (
                        <Row className="g-4">
                            {bookings.map((booking, i) => (
                                <Col key={booking._id} lg={6}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08, type: 'spring', damping: 20 }}
                                    >
                                        <div className="booking-card">
                                            {/* Left accent */}
                                            <div className="left-accent" />

                                            <Row className="g-0" style={{ minHeight: 200 }}>
                                                {/* Image */}
                                                <Col xs={4} sm={4}>
                                                    <div className="h-100 position-relative overflow-hidden">
                                                        <img
                                                            src={getBannerUrl(booking)}
                                                            alt={booking.event?.title}
                                                            className="w-100 h-100 position-absolute"
                                                            style={{ objectFit: 'cover', top: 0, left: 0 }}
                                                        />
                                                    </div>
                                                </Col>

                                                {/* Content */}
                                                <Col xs={8} sm={8}>
                                                    <div
                                                        className="h-100 d-flex flex-column"
                                                        style={{ padding: '1.25rem 1.25rem 1.25rem 1rem' }}
                                                    >
                                                        {/* Category */}
                                                        <Badge
                                                            className="mb-2 align-self-start"
                                                            style={{
                                                                background: 'rgba(99,102,241,0.2)',
                                                                color: '#818cf8',
                                                                border: '1px solid rgba(99,102,241,0.3)',
                                                                fontSize: '0.68rem',
                                                                letterSpacing: '0.05em',
                                                            }}
                                                        >
                                                            {booking.event?.category}
                                                        </Badge>

                                                        {/* Title */}
                                                        <h6
                                                            className="fw-bold mb-2 text-bright"
                                                            style={{
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden',
                                                                lineHeight: 1.35,
                                                                fontSize: '0.95rem',
                                                            }}
                                                        >
                                                            {booking.event?.title}
                                                        </h6>

                                                        {/* Date & Venue */}
                                                        <div className="mb-3 text-soft" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                                <FaCalendarAlt size={11} className="text-primary-light" style={{ flexShrink: 0 }} />
                                                                {booking.event?.date && new Date(booking.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <FaMapMarkerAlt size={11} className="text-primary-light" style={{ flexShrink: 0 }} />
                                                                <span
                                                                    style={{
                                                                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
                                                                    }}
                                                                >
                                                                    {booking.event?.venue}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Ticket Info */}
                                                        <div
                                                            className="rounded-3 mb-3"
                                                            style={{
                                                                background: 'rgba(255,255,255,0.04)',
                                                                border: '1px solid rgba(255,255,255,0.08)',
                                                                padding: '0.6rem 0.75rem',
                                                            }}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <div className="text-primary-light" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                                        {booking.ticketType}
                                                                    </div>
                                                                    <div className="text-soft" style={{ fontSize: '0.72rem' }}>
                                                                        {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className="fw-black"
                                                                    style={{
                                                                        fontSize: '1.1rem',
                                                                        background: 'linear-gradient(135deg, #818cf8, #06b6d4)',
                                                                        WebkitBackgroundClip: 'text',
                                                                        backgroundClip: 'text',
                                                                        WebkitTextFillColor: 'transparent',
                                                                    }}
                                                                >
                                                                    ₹{booking.totalAmount}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Footer */}
                                                        <div className="mt-auto d-flex justify-content-between align-items-center">
                                                            <span style={{ fontSize: '0.68rem', color: '#475569', fontFamily: 'monospace' }}>
                                                                #{booking._id.slice(-8).toUpperCase()}
                                                            </span>
                                                            {booking.ticketId ? (
                                                                <Button
                                                                    as={Link}
                                                                    to={`/tickets/${booking.ticketId}`}
                                                                    size="sm"
                                                                    className="d-flex align-items-center gap-1 fw-bold"
                                                                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem', borderRadius: 8 }}
                                                                >
                                                                    <FaTicketAlt size={11} /> View Pass
                                                                </Button>
                                                            ) : (
                                                                <Badge
                                                                    className="d-flex align-items-center gap-1 px-3 py-2 text-soft bg-white/5 border-white/10"
                                                                    style={{
                                                                        fontSize: '0.72rem',
                                                                    }}
                                                                >
                                                                    <FaClock size={10} /> Processing
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    )}
                </AnimatePresence>
            </Container>
        </div>
    );
};

export default MyBookings;

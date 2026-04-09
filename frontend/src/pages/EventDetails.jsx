import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as eventApi from '../api/eventApi';
import * as bookingApi from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Button, Badge, Card, Spinner, Alert, Form } from 'react-bootstrap';
import {
    FaMapMarkerAlt, FaCalendarAlt, FaClock, FaTag, FaCheckCircle,
    FaShoppingCart, FaArrowLeft, FaShieldAlt, FaTicketAlt, FaUser
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import './EventDetails.css';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTier, setSelectedTier] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await eventApi.getEvent(id);
                setEvent(res.data.data);
                if (res.data.data.ticketTypes.length > 0) {
                    setSelectedTier(res.data.data.ticketTypes[0].name);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Event not found');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleBooking = async () => {
        if (!user) { navigate('/login'); return; }

        if (user.role === 'organizer' && user.status === 'pending') {
            alert('Booking is not available until your organizer account is verified.');
            return;
        }

        // Ensure quantity is parsed correctly
        const parsedQuantity = parseInt(quantity);
        if (!parsedQuantity || parsedQuantity < 1) {
            alert('Please select a valid quantity.');
            return;
        }

        // Navigate to the full booking/checkout flow
        navigate('/checkout', {
            state: {
                event,
                ticketType: selectedTier,
                quantity: parsedQuantity,
                totalPrice: (event.ticketTypes.find(t => t.name === selectedTier)?.price || 0) * parsedQuantity
            }
        });
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center loader-screen-center">
                <div className="text-center">
                    <FaTicketAlt size={40} className="loader-icon-indigo" />
                    <p className="text-soft">Loading event...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-wrapper d-flex align-items-center justify-content-center min-vh-70">
                <Container fluid className="px-md-5">
                    <Row className="justify-content-center">
                        <Col md={6} className="text-center">
                            <Alert variant="danger" className="rounded-4 p-4 mb-4">
                                <FaShieldAlt size={32} className="mb-3 error-screen-badge" />
                                <h5 className="fw-bold mb-1">Event Not Found</h5>
                                <p className="mb-0 small">{error}</p>
                            </Alert>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    if (!event) return null;

    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    const bannerUrl = (event.bannerImage && event.bannerImage !== 'no-photo.jpg')
        ? event.bannerImage
        : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2000';

    const selectedTicket = event.ticketTypes.find(t => t.name === selectedTier);
    const totalPrice = (selectedTicket?.price || 0) * quantity;
    const allSoldOut = event.ticketTypes.every(t => t.quantity - t.sold <= 0);

    return (
        <div className="pb-5">
            {/* ─── Cinematic Banner ─── */}
            <section
                className="position-relative text-white overflow-hidden cinematic-header-section"
            >
                {/* Background image with high-fidelity mask */}
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: [0.19, 1, 0.22, 1] }}
                    className="position-absolute top-0 start-0 w-100 h-100 bg-cover-center"
                    style={{ backgroundImage: `url("${bannerUrl}")` }}
                />
                <div
                    className="position-absolute top-0 start-0 w-100 h-100 header-gradient-overlay"
                />

                <Container
                    fluid
                    className="position-relative d-flex flex-column justify-content-end pb-5 px-3 px-md-5 header-content-container"
                >

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >

                        {/* Category + status */}
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            <Badge className="category-badge-exclusive">
                                {event.category}
                            </Badge>
                            <Badge className="status-badge-outline">
                                ● LIVE
                            </Badge>
                        </div>

                        {/* Title */}
                        <h1
                            className="fw-black mb-4 h1-responsive main-title-cinematic"
                        >
                            {event.title}
                        </h1>

                        {/* Date, Time, Venue - Premium Chips */}
                        <div className="d-flex flex-wrap gap-2 gap-md-3">
                            {[
                                { icon: <FaCalendarAlt />, text: formattedDate },
                                { icon: <FaClock />, text: event.time },
                                { icon: <FaMapMarkerAlt />, text: event.venue },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="glass-card px-3 px-md-4 py-2 py-md-3 d-flex align-items-center gap-2 gap-md-3 border-white/5"
                                >
                                    <span className="text-primary-light h6 h5-md m-0 d-flex">{item.icon}</span>
                                    <span className="text-soft fw-black uppercase tracking-widest x-small">
                                        {item.text}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                    </motion.div>
                </Container>
            </section>

            {/* ─── Content ─── */}
            <Container fluid className="mt-4 px-md-5">
                <Row className="g-4">
                    {/* ─── Left: Description ─── */}
                    <Col lg={8}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            {/* About - High Density Info */}
                            <div className="glass-card p-4 p-md-5 mb-4 border-white/5 position-relative overflow-hidden">
                                <div className="position-absolute top-0 start-0 p-3 opacity-10">
                                    <FaTag size={120} />
                                </div>
                                <h4 className="fw-black text-bright uppercase tracking-tighter mb-4 d-flex align-items-center gap-3">
                                    <span className="text-primary-light"><FaTag /></span> Event Protocol
                                </h4>
                                <div
                                    className="text-soft fw-medium lh-lg protocol-description-text"
                                >
                                    {event.description}
                                </div>
                            </div>

                            {/* Event Details Grid */}
                            <Card className="mb-4 rounded-5">
                                <Card.Body className="p-4 bg-transparent">
                                    <h4 className="fw-bold mb-4 text-bright">
                                        Event Details
                                    </h4>
                                    <Row className="g-3">
                                        <Col sm={6}>
                                            <div className="info-block">
                                                <div className="info-label">Date</div>
                                                <div className="info-value">{formattedDate}</div>
                                            </div>
                                        </Col>
                                        <Col sm={6}>
                                            <div className="info-block">
                                                <div className="info-label">Time</div>
                                                <div className="info-value">{event.time}</div>
                                            </div>
                                        </Col>
                                        <Col xs={12}>
                                            <div className="info-block">
                                                <div className="info-label">Venue</div>
                                                <div className="info-value">{event.venue}</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Organizer */}
                            <Card className="rounded-5">
                                <Card.Body className="p-4 d-flex align-items-center gap-4 bg-transparent">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${event.organizer?.name}&background=6366f1&color=fff&bold=true&size=60`}
                                        alt={event.organizer?.name}
                                        className="rounded-circle flex-shrink-0"
                                        width={56}
                                        height={56}
                                    />
                                    <div>
                                        <div className="organizer-label-small">
                                            Organized By
                                        </div>
                                        <div className="fw-bold text-bright fs-5">
                                            {event.organizer?.name}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>

                    {/* ─── Right: Booking Sidebar ─── */}
                    <Col lg={4}>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="booking-sidebar-sticky"
                        >
                            <Card className="glass-card tilt-3d border-0 shadow-2xl rounded-5 overflow-hidden">
                                {/* High-Contrast Booking Header */}
                                <div className="bg-primary p-4 text-center position-relative overflow-hidden">
                                    <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20 booking-header-gradient-mask" />
                                    <FaTicketAlt size={32} className="text-white mb-2 shadow-2xl" />
                                    <h5 className="fw-black text-white uppercase tracking-widest m-0">Secure Booking</h5>
                                    <p className="text-white-50 small m-0 fw-bold">Official Ticketing Partner</p>
                                </div>

                                <Card.Body className="p-4 bg-transparent">
                                    {/* Ticket Type */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ticket Type</Form.Label>
                                        <Form.Select
                                            value={selectedTier}
                                            onChange={(e) => setSelectedTier(e.target.value)}
                                        >
                                            {event.ticketTypes.map((tier, idx) => (
                                                <option
                                                    key={idx}
                                                    value={tier.name}
                                                    disabled={tier.quantity - tier.sold <= 0}
                                                >
                                                    {tier.name} — ₹{tier.price}
                                                    {tier.quantity - tier.sold <= 0 ? ' (Sold Out)' : ` (${tier.quantity - tier.sold} left)`}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    {/* Quantity */}
                                    <Form.Group className="mb-4">
                                        <Form.Label>Quantity</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                        />
                                    </Form.Group>

                                    {/* Total Price */}
                                    <div
                                        className="rounded-3 p-3 mb-4 d-flex justify-content-between align-items-center amount-summary-box"
                                    >
                                        <span className="amount-summary-label">
                                            Total Amount
                                        </span>
                                        <span
                                            className="fw-black total-price-gradient-text"
                                        >
                                            ₹{totalPrice}
                                        </span>
                                    </div>

                                    {/* Book Button */}
                                    {user?.role === 'organizer' && user?.status === 'pending' ? (
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-4 opacity-60"
                                            onClick={() => alert("Booking is not available until your organizer account is verified.")}
                                        >
                                            <FaShoppingCart /> Verification Pending
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-4"
                                            onClick={handleBooking}
                                            disabled={bookingLoading || allSoldOut}
                                        >
                                            {bookingLoading ? (
                                                <><Spinner size="sm" /> Processing...</>
                                            ) : allSoldOut ? (
                                                'Sold Out'
                                            ) : (
                                                <><FaShoppingCart /> Book Now</>
                                            )}
                                        </Button>
                                    )}

                                    {/* Trust badge */}
                                    <div className="text-center mt-3">
                                        <small className="d-flex align-items-center justify-content-center gap-2 text-soft fw-bold x-small">
                                            <FaCheckCircle size={12} className="text-success" />
                                            Secure & encrypted checkout
                                        </small>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Guarantee Box */}
                            <div
                                className="mt-3 rounded-3 p-3 d-flex align-items-center gap-3 guarantee-badge-box"
                            >
                                <FaShieldAlt size={20} className="text-primary-light flex-shrink-0" />
                                <div>
                                    <div className="fw-semibold text-bright small">
                                        Verified Event
                                    </div>
                                    <div className="text-soft x-small">
                                        Approved by GrowthUtsav admin team
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EventDetails;

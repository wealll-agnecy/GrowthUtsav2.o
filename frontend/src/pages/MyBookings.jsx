import { useState, useEffect } from 'react';
import * as bookingApi from '../api/bookingApi';
import { Container, Row, Col, Card, Badge, Alert, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaRocket, FaClock, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Modal, Form, ProgressBar } from 'react-bootstrap';
import { FaWallet, FaSync } from 'react-icons/fa';
import '../css/mybookings.css';

const RAZORPAY_SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInstallmentModal, setShowInstallmentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [installmentAmount, setInstallmentAmount] = useState('');
    const [isPaying, setIsPaying] = useState(false);
    const [sdkLoaded, setSdkLoaded] = useState(false);

    useEffect(() => {
        const loadRazorpay = () => {
            if (window.Razorpay) {
                setSdkLoaded(true);
                return;
            }
            const script = document.createElement('script');
            script.src = RAZORPAY_SDK_URL;
            script.async = true;
            script.onload = () => setSdkLoaded(true);
            document.body.appendChild(script);
        };
        loadRazorpay();

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

    const handlePayInstallment = async (e) => {
        e.preventDefault();
        if (!installmentAmount || parseFloat(installmentAmount) <= 0) {
            return toast.error('Please enter a valid amount');
        }

        const remaining = selectedBooking.totalAmount - selectedBooking.amountPaid;
        if (parseFloat(installmentAmount) > remaining) {
            return toast.error(`Amount exceeds remaining balance of ₹${remaining}`);
        }

        setIsPaying(true);
        try {
            const res = await bookingApi.initiateInstallment(selectedBooking._id, installmentAmount);
            const { order } = res.data;

            if (!order || !order.id) {
                // Demo Mode or Error
                if (res.data.success && !order) {
                    await bookingApi.verifyInstallment({ bookingId: selectedBooking._id, amount: installmentAmount });
                    toast.success('Payment updated (Demo Mode)');
                    window.location.reload();
                    return;
                }
                throw new Error('Order creation failed');
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount: order.amount,
                currency: order.currency,
                name: 'GrowthUtsav',
                description: `Installment for ${selectedBooking.event.title}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await bookingApi.verifyInstallment({
                            ...response,
                            bookingId: selectedBooking._id,
                            amount: installmentAmount
                        });
                        if (verifyRes.data.success) {
                            toast.success('Installment Paid Successfully!');
                            window.location.reload();
                        }
                    } catch (err) {
                        toast.error('Verification failed');
                    }
                },
                prefill: { name: user?.name, email: user?.email },
                theme: { color: '#ec407a' }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setIsPaying(false);
            setShowInstallmentModal(false);
        }
    };

    const getBannerUrl = (booking) => {
        const img = booking.event?.bannerImage;
        if (!img || img === 'no-photo.jpg') return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800';
        return img;
    };

    return (
        <div className="mybooking-wrapper">
            <Container fluid className="px-md-5">
                {/* ─── Header ─── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5 mt-4 mt-md-2"
                >
                    <div className="flex-grow-1 mybooking-header">
                        <Badge className="booking-status status-confirmed mb-3 shadow-sm">
                            <FaTicketAlt className="me-2" /> Digital Asset Vault
                        </Badge>
                        <h1 className="fw-black m-0 tracking-tighter text-bright">
                            My <span style={{ color: '#ee749fff' }}>Bookings</span>
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
                            className="no-booking-container"
                        >
                            <div className="no-booking-icon">🎫</div>
                            <h4 className="no-booking-title">No Bookings Yet</h4>
                            <p className="no-booking-text">
                                You haven't booked any events. Explore hundreds of exciting events and secure your spot!
                            </p>
                            <Button
                                as={Link}
                                to="/events"
                                className="btn btn-pink"
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
                                        <div className="booking-card-premium">
                                            {/* Left accent */}
                                            <div className="left-accent" style={{ background: 'linear-gradient(to bottom, #f25f90ff, #ed619eff)' }} />

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
                                                        {/* Status Badge */}
                                                        <div className="mb-3">
                                                            <span className={`booking-status ${booking.ticketId ? 'status-confirmed' : 'status-pending'}`}>
                                                                {booking.ticketId ? <FaShieldAlt size={10} /> : <FaClock size={10} />}
                                                                {booking.ticketId ? 'Confirmed' : 'Processing'}
                                                            </span>
                                                        </div>

                                                        {/* Category */}
                                                        <div className="small fw-bold text-uppercase tracking-widest text-pink-600 mb-1" style={{ fontSize: '0.65rem', color: '#000000ff' }}>
                                                            {booking.event?.category}
                                                        </div>

                                                        {/* Title */}
                                                        <h6 className="booking-title">
                                                            {booking.event?.title}
                                                        </h6>

                                                        {/* Date & Venue */}
                                                        <div className="mb-3 d-flex flex-column gap-1">
                                                            <div className="booking-info">
                                                                <FaCalendarAlt size={12} style={{ color: '#1871ddff' }} />
                                                                {booking.selectedDays && booking.selectedDays.length > 0
                                                                    ? `${booking.selectedDays.length} Day(s) Selected`
                                                                    : ((booking.selectedDate || booking.event?.date) && new Date(booking.selectedDate || booking.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))}
                                                            </div>
                                                            <div className="booking-info">
                                                                <FaMapMarkerAlt size={12} style={{ color: '#2681e3ff' }} />
                                                                <span className="text-truncate">{booking.event?.venue}</span>
                                                            </div>
                                                        </div>

                                                        {/* Ticket Info */}
                                                        <div
                                                            className="rounded-4 mb-4 p-3"
                                                            style={{
                                                                background: 'rgba(236, 64, 122, 0.05)',
                                                                border: '1px solid rgba(173, 61, 98, 0.1)',
                                                            }}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <div style={{ color: '#3d3a3aff', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                                        {booking.ticketType}
                                                                    </div>
                                                                    <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>
                                                                        {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className="fw-black h4 m-0"
                                                                    style={{
                                                                        color: '#AD1457',
                                                                        letterSpacing: '-1px'
                                                                    }}
                                                                >
                                                                    ₹{booking.totalAmount}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Payment Progress */}
                                                        <div className="mb-4">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <span className="small fw-bold text-muted uppercase" style={{ fontSize: '0.6rem' }}>Payment Status</span>
                                                                <span className="small fw-bold" style={{ fontSize: '0.6rem', color: (booking.amountPaid || 0) >= booking.totalAmount ? '#4caf50' : '#ff9800' }}>
                                                                    {Math.round(((booking.amountPaid || 0) / booking.totalAmount) * 100)}% Collected
                                                                </span>
                                                            </div>
                                                            <ProgressBar 
                                                                now={((booking.amountPaid || 0) / booking.totalAmount) * 100} 
                                                                variant={(booking.amountPaid || 0) >= booking.totalAmount ? "success" : "warning"}
                                                                style={{ height: '6px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)' }}
                                                            />
                                                            <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.65rem' }}>
                                                                <span className="text-muted fw-bold">Paid: ₹{booking.amountPaid || 0}</span>
                                                                <span className="text-dark fw-bold">Total: ₹{booking.totalAmount}</span>
                                                            </div>
                                                        </div>

                                                        {/* Footer */}
                                                        <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
                                                            <span style={{ fontSize: '0.68rem', color: '#475569', fontFamily: 'monospace' }} className="d-none d-sm-inline">
                                                                #{booking._id.slice(-8).toUpperCase()}
                                                            </span>
                                                            <div className="d-flex gap-2 w-100 justify-content-end">
                                                                {(booking.amountPaid || 0) < booking.totalAmount && (
                                                                    <Button 
                                                                        variant="outline-primary" 
                                                                        className="btn-sm rounded-pill px-3 fw-bold"
                                                                        onClick={() => {
                                                                            setSelectedBooking(booking);
                                                                            setInstallmentAmount((booking.totalAmount - (booking.amountPaid || 0)).toString());
                                                                            setShowInstallmentModal(true);
                                                                        }}
                                                                        style={{ fontSize: '0.7rem', color: '#ec407a', borderColor: '#ec407a' }}
                                                                    >
                                                                        <FaWallet size={10} className="me-1" /> Pay Due
                                                                    </Button>
                                                                )}
                                                                {booking.ticketId ? (
                                                                    <Button
                                                                        as={Link}
                                                                        to={`/tickets/${booking.ticketId}`}
                                                                        className="btn btn-pink btn-sm rounded-pill px-3"
                                                                        style={{ fontSize: '0.7rem' }}
                                                                    >
                                                                        <FaTicketAlt size={10} className="me-1" /> View Pass
                                                                    </Button>
                                                                ) : (
                                                                    <span className="booking-status status-pending">
                                                                        <FaClock size={10} /> Pending
                                                                    </span>
                                                                )}
                                                            </div>
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

            {/* Installment Modal */}
            <Modal show={showInstallmentModal} onHide={() => setShowInstallmentModal(false)} centered className="installment-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-black uppercase tracking-widest small">Payment Protocol</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-4">
                    <div className="mb-4 text-center">
                        <div className="bg-primary-subtle d-inline-block p-3 rounded-circle mb-3">
                            <FaWallet size={30} className="text-primary" />
                        </div>
                        <h4 className="fw-black">Complete Your Payment</h4>
                        <p className="text-muted small">You are paying for <span className="fw-bold text-dark">{selectedBooking?.event?.title}</span></p>
                    </div>

                    <div className="glass-panel p-3 rounded-4 mb-4 d-flex justify-content-between align-items-center">
                        <div>
                            <div className="tiny-text uppercase text-muted fw-bold">Remaining Due</div>
                            <div className="h4 fw-black m-0 text-danger">₹{selectedBooking ? selectedBooking.totalAmount - selectedBooking.amountPaid : 0}</div>
                        </div>
                        <div className="text-end">
                            <div className="tiny-text uppercase text-muted fw-bold">Total Value</div>
                            <div className="h5 fw-bold m-0 text-dark">₹{selectedBooking?.totalAmount}</div>
                        </div>
                    </div>

                    <Form onSubmit={handlePayInstallment}>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted uppercase">Amount to Pay (₹)</Form.Label>
                            <Form.Control 
                                type="number" 
                                className="premium-input text-center fs-4 fw-black" 
                                value={installmentAmount}
                                onChange={(e) => setInstallmentAmount(e.target.value)}
                                max={selectedBooking ? selectedBooking.totalAmount - selectedBooking.amountPaid : 0}
                                min="1"
                                required
                            />
                        </Form.Group>
                        <Button 
                            type="submit" 
                            className="btn btn-pink w-100 py-3 rounded-4 fw-black uppercase tracking-widest"
                            disabled={isPaying || !sdkLoaded}
                        >
                            {isPaying ? <><FaSync className="fa-spin me-2" /> Processing...</> : `Confirm Payment →`}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default MyBookings;

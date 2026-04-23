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
                                        <div className="booking-card">
                                            <div className="booking-img-container">
                                                <img
                                                    src={getBannerUrl(booking)}
                                                    alt={booking.event?.title}
                                                />
                                                <div className={`booking-badge ${booking.ticketId ? 'confirmed' : 'pending'}`}>
                                                    {booking.ticketId ? 'Confirmed' : 'Pending'}
                                                </div>
                                            </div>

                                            <div className="booking-details">
                                                <div className="booking-meta-top">
                                                    <span className="event-cat">{booking.event?.category}</span>
                                                    <span className="booking-id">#{booking._id.slice(-6).toUpperCase()}</span>
                                                </div>

                                                <h4 className="event-name">{booking.event?.title}</h4>

                                                <div className="event-info-row">
                                                    <span><FaCalendarAlt size={11} className="me-1" /> {booking.selectedDays?.length > 0 ? `${booking.selectedDays.length} Days` : new Date(booking.selectedDate || booking.event?.date).toLocaleDateString()}</span>
                                                    <span><FaMapMarkerAlt size={11} className="me-1" /> {booking.event?.venue}</span>
                                                </div>

                                                <div className="booking-summary-mini">
                                                    <div className="ticket-line">
                                                        <span className="type">{booking.ticketType} × {booking.quantity}</span>
                                                        <span className="price">₹{booking.totalAmount}</span>
                                                    </div>
                                                    
                                                    <div className="payment-bar-mini">
                                                        <div className="bar-track">
                                                            <div 
                                                                className="bar-fill" 
                                                                style={{ 
                                                                    width: `${Math.round(((booking.amountPaid || 0) / booking.totalAmount) * 100)}%`,
                                                                    background: (booking.amountPaid || 0) >= booking.totalAmount ? '#4caf50' : '#ff9800'
                                                                }} 
                                                            />
                                                        </div>
                                                        <div className="bar-labels">
                                                            <span>Paid: ₹{booking.amountPaid || 0}</span>
                                                            <span>Remaining: ₹{booking.totalAmount - (booking.amountPaid || 0)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="booking-actions">
                                                    {(booking.amountPaid || 0) < booking.totalAmount && (
                                                        <button
                                                            className="pay-due-btn"
                                                            onClick={() => {
                                                                setSelectedBooking(booking);
                                                                setInstallmentAmount((booking.totalAmount - (booking.amountPaid || 0)).toString());
                                                                setShowInstallmentModal(true);
                                                            }}
                                                        >
                                                            Pay Due
                                                        </button>
                                                    )}
                                                    {booking.ticketId && (
                                                        <Link to={`/tickets/${booking.ticketId}`} className="view-ticket-btn">
                                                            View Ticket
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
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

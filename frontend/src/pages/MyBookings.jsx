import { useState, useEffect } from 'react';
import * as bookingApi from '../api/bookingApi';
import { Container, Row, Col, Card, Badge, Alert, Button } from 'react-bootstrap';
import { 
    FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaRocket, 
    FaClock, FaShieldAlt, FaWallet, FaSync, FaArrowRight, FaTimes, FaArrowLeft, FaCheckCircle 
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Modal, Form, ProgressBar, Spinner } from 'react-bootstrap';
import '../css/mybookings.css';
import { formatCurrency } from '../utils/formatUtils';

const MyBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInstallmentModal, setShowInstallmentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [installmentAmount, setInstallmentAmount] = useState('');
    const [isPaying, setIsPaying] = useState(false);

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

    const handlePayInstallment = async (e) => {
        e.preventDefault();
        if (!installmentAmount || parseFloat(installmentAmount) <= 0) {
            return toast.error('Please enter a valid amount');
        }

        const remaining = selectedBooking.totalAmount - selectedBooking.amountPaid;
        if (parseFloat(installmentAmount) > remaining) {
            return toast.error(`Amount exceeds remaining balance of ${formatCurrency(remaining)}`);
        }

        setIsPaying(true);
        try {
            await bookingApi.initiateInstallment(selectedBooking._id, installmentAmount);
            const verifyRes = await bookingApi.verifyInstallment({ 
                bookingId: selectedBooking._id, 
                amount: installmentAmount 
            });
            
            if (verifyRes.data.success) {
                if (parseFloat(installmentAmount) >= remaining || verifyRes.data.ticketId) {
                    // Redirect to digital pass with success animation trigger
                    navigate(`/digital-pass/${verifyRes.data.ticketId || selectedBooking.ticketId}?success=true`);
                } else {
                    toast.success('Payment updated successfully!');
                    window.location.reload();
                }
            }
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
                            <div className="no-booking-icon">🎟️</div>
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
                                                        <span className="price">{formatCurrency(booking.totalAmount)}</span>
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
                                                            <span>Paid: {formatCurrency(booking.amountPaid || 0)}</span>
                                                            <span>Remaining: {formatCurrency(booking.totalAmount - (booking.amountPaid || 0))}</span>
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
                                                        <Link to={`/digital-pass/${booking.ticketId}`} className="view-ticket-btn">
                                                            View Digital Pass
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

            {/* ─── Installment Modal ─── */}
            <AnimatePresence>
                {showInstallmentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="crm-overlay-v2"
                        onClick={() => setShowInstallmentModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="white-crm-modal-box"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content">
                                <div className="force-card text-start">
                                    <button className="btn btn-light mb-3" onClick={() => setShowInstallmentModal(false)}>
                                        ← Back
                                    </button>

                                    <h4 style={{ fontWeight: 600 }}>{user?.name}</h4>
                                    <span className="badge bg-success">SECURE NODE</span>
                                    <p style={{ color: 'gray', fontSize: '12px' }}>
                                        {selectedBooking?.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : ''}
                                    </p>

                                    <hr />

                                    <h6 style={{ color: 'gray' }}>TRANSACTION DETAILS</h6>
                                    <p><b>Event:</b> {selectedBooking?.event?.title}</p>
                                    <p><b>Remaining Balance:</b> {formatCurrency(selectedBooking?.totalAmount - (selectedBooking?.amountPaid || 0))}</p>

                                    <h6 style={{ marginTop: '20px', color: 'gray' }}>AUTHORIZE PAYMENT</h6>
                                    <div className="force-message">
                                        <div className="mt-3 pt-3 border-top">
                                            <div className="input-group mb-3">
                                                <span className="input-group-text bg-white">INR</span>
                                                <input 
                                                    type="number"
                                                    className="form-control fw-bold"
                                                    placeholder="Enter Amount"
                                                    value={installmentAmount}
                                                    onChange={(e) => setInstallmentAmount(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                            <button 
                                                className="btn btn-dark w-100 py-3 fw-bold"
                                                onClick={handlePayInstallment}
                                                disabled={isPaying || !installmentAmount || installmentAmount <= 0}
                                            >
                                                {isPaying ? 'PROCESSING...' : 'AUTHORIZE PAYMENT'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyBookings;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaShoppingCart, FaUserFriends, FaCreditCard, FaCheckCircle, FaArrowLeft, FaShieldAlt, FaSync } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import * as bookingApi from '../api/bookingApi';
import toast from 'react-hot-toast';
import './CheckoutFlow.css';

const RAZORPAY_SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const CheckoutFlow = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Mission State Control
    const [step, setStep] = useState(1); // 1: Cart, 2: Details, 3: Payment/Processing, 4: Success
    
    // 🚀 REAL-TIME PRICE STATE
    const [quantity, setQuantity] = useState(state?.quantity || 1);
    const [ticketType, setTicketType] = useState(state?.ticketType);
    const [price, setPrice] = useState(state?.totalPrice / (state?.quantity || 1) || 0);
    const platformFee = 50;

    const [attendeeDetails, setAttendeeDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [ticketId, setTicketId] = useState(null);
    const [isPartialPayment, setIsPartialPayment] = useState(false);
    const [partialAmount, setPartialAmount] = useState('');
    
    // Deployment Audit (Debugging)
    const logMission = (tag, data) => {
        console.log(`[CHECKOUT_LOG][${tag}]:`, data);
    };

    // Load Razorpay Identity Signature (SDK)
    useEffect(() => {
        const loadRazorpay = () => {
            if (window.Razorpay) {
                logMission('SDK_STATUS', 'ALREADY_LOADED');
                setSdkLoaded(true);
                return;
            }
            logMission('SDK_STATUS', 'INITIATING_LOAD');
            const script = document.createElement('script');
            script.src = RAZORPAY_SDK_URL;
            script.async = true;
            script.onload = () => {
                logMission('SDK_STATUS', 'LOAD_SUCCESS');
                setSdkLoaded(true);
            };
            script.onerror = () => {
                logMission('SDK_STATUS', 'LOAD_FAILURE');
                setError('Razorpay SDK failed to synchronize. Interface breach detected.');
            };
            document.body.appendChild(script);
        };
        loadRazorpay();
    }, []);

    useEffect(() => {
        if (!state || !state.event) {
            logMission('INITIALIZATION', 'INVALID_STATE_REDIRECT');
            navigate('/events');
        } else {
            // Initial or update attendee protocols based on quantity
            if (attendeeDetails.length !== quantity) {
                logMission('INITIALIZATION', 'ADJUSTING_ATTENDEE_PROTOCOLS');
                setAttendeeDetails(prev => {
                    if (prev.length === 0) {
                        const initialDetails = Array.from({ length: quantity }, () => ({
                            name: '', email: '', phone: ''
                        }));
                        if (user) {
                            initialDetails[0].name = user.name || '';
                            initialDetails[0].email = user.email || '';
                        }
                        return initialDetails;
                    }
                    if (prev.length < quantity) {
                        const extra = Array.from({ length: quantity - prev.length }, () => ({
                            name: '', email: '', phone: ''
                        }));
                        return [...prev, ...extra];
                    }
                    return prev.slice(0, quantity);
                });
            }
        }
    }, [state, navigate, user, quantity, attendeeDetails.length]);

    if (!state || !state.event) return null;
    const { event, selectedDate, selectedDays } = state;

    // Derived Logic
    const subtotal = price * quantity;
    const totalAmount = subtotal + platformFee;

    const handlePlanChange = (e) => {
        const newPlanName = e.target.value;
        setTicketType(newPlanName);

        let newPrice = 0;
        if (event.isMultiDay) {
            selectedDays.forEach(date => {
                const day = event.multiDayPlan.find(d => d.date === date);
                const plan = day?.plans.find(p => p.name === newPlanName);
                newPrice += plan?.price || 0;
            });
        } else {
            const ticket = event.ticketTypes.find(t => t.name === newPlanName);
            newPrice = ticket?.price || 0;
        }
        setPrice(newPrice);
    };

    const handleAttendeeChange = (index, field, value) => {
        const newDetails = [...attendeeDetails];
        newDetails[index][field] = value;
        setAttendeeDetails(newDetails);
    };

    const validateForms = () => {
        logMission('VALIDATION', 'INITIATING_FIELD_SCRUB');
        for (let i = 0; i < attendeeDetails.length; i++) {
            const att = attendeeDetails[i];
            if (!att.name.trim() || !att.email.trim() || !att.phone.trim()) {
                const msg = `Sector #${i + 1} Identity Fragment Missing`;
                setError(msg);
                toast.error(msg);
                return false;
            }
            if (!/^\S+@\S+\.\S+$/.test(att.email)) {
                setError(`Sector #${i + 1} Protocol Mapping Failure (Email)`);
                return false;
            }
        }
        setError(null);
        return true;
    };

    const initiatePaymentFlow = async () => {
        logMission('PAYMENT_INIT', 'RESONANCE_START');
        if (!validateForms()) return;
        
        if (!sdkLoaded || !window.Razorpay) {
            logMission('PAYMENT_INIT', 'SDK_NOT_SYNCED_RELOADING');
            setError('Razorpay SDK not synced. Recalibrating...');
            // Manual retry of script load
            const script = document.createElement('script');
            script.src = RAZORPAY_SDK_URL;
            script.onload = () => { setSdkLoaded(true); initiatePaymentFlow(); };
            document.body.appendChild(script);
            return;
        }

        setStep(3);
        setLoading(true);

        try {
            logMission('API_REQUEST', 'CHECKOUT_ORDER_CREATE');
            const orderRes = await bookingApi.checkout({
                eventId: event._id,
                ticketType,
                selectedDate,
                selectedDays,
                quantity,
                attendeeDetails,
                partialAmount: isPartialPayment ? parseFloat(partialAmount) : undefined
            });

            logMission('API_RESPONSE', orderRes.data);
            
            // ✅ IF DEMO MODE (INSTANT SUCCESS)
            if (orderRes.data.success && orderRes.data.bookingId && !orderRes.data.order) {
                logMission('CHECKOUT_FLOW', 'INSTANT_SUCCESS_DETECTED');
                setTicketId(orderRes.data.ticketId);
                setStep(4);
                toast.success('Identity Verification Complete (Demo Mode)');
                return;
            }

            // ❌ IF RAZORPAY MODE (NORMAL)
            const { order, bookingId } = orderRes.data;

            if (!order || !order.id) {
                throw new Error('Order Synchronization Disruption (Empty Order ID)');
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount: order.amount,
                currency: order.currency,
                name: 'GrowthUtsav',
                description: `Digital Clearance: ${event.title}`,
                order_id: order.id,
                handler: async function (response) {
                    logMission('RAZORPAY_SUCCESS', response);
                    try {
                        setLoading(true);
                        const verifyRes = await bookingApi.verifyPayment({ ...response, bookingId });
                        logMission('VERIFICATION_RESPONSE', verifyRes.data);
                        if (verifyRes.data.success) {
                            setTicketId(verifyRes.data.ticketId);
                            setStep(4);
                            toast.success('Clearance Granted! Ticket sent to your email.');
                        }
                    } catch (err) {
                        logMission('VERIFICATION_FAILURE', err);
                        setError('Handshake Corruption during verification.');
                        setStep(2);
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: { name: user?.name, email: user?.email },
                theme: { color: '#6366f1' },
                modal: {
                    ondismiss: () => {
                        logMission('RAZORPAY_CLOSE', 'USER_ABORTED');
                        setLoading(false);
                        setStep(2);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                logMission('RAZORPAY_FAILURE', response.error);
                setError(response.error.description);
                setStep(2);
            });
            rzp.open();
            logMission('RAZORPAY_MODAL', 'DEPLOYED');

        } catch (err) {
            logMission('CHECKOUT_CRITICAL_FAILURE', err);
            const msg = err.response?.data?.message || err.message || 'Mission Disruption';
            setError(msg);
            toast.error(msg);
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoPayment = async () => {
        logMission('DEMO_FLOW', 'BYPASS_INITIATED');
        if (!validateForms()) return;
        setStep(3);
        setLoading(true);
        try {
            const res = await bookingApi.demoCheckout({
                eventId: event._id, 
                ticketType, 
                selectedDate,
                selectedDays,
                quantity, 
                attendeeDetails,
                partialAmount: isPartialPayment ? parseFloat(partialAmount) : undefined
            });
            logMission('DEMO_RESPONSE', res.data);
            if (res.data.success) {
                setTicketId(res.data.ticketId);
                setStep(4);
                toast.success('Clearance Granted! Ticket sent to your email.');
            }
        } catch (err) {
            logMission('DEMO_FAILURE', err);
            setError('Demo bypass encryption failed.');
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page-wrapper py-5">
            <Container>
                {/* ─── Professional Stepper ─── */}
                <div className="modern-stepper">
                    <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                        <FaShoppingCart /> CART
                    </div>
                    <div className="step-divider" />
                    <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                        <FaUserFriends /> DETAILS
                    </div>
                    <div className="step-divider" />
                    <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                        <FaCreditCard /> PAYMENT
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="cart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="row justify-content-center">
                            <div className="col-lg-10">
                                <Card className="checkout-premium-card">
                                    <div className="checkout-header-section">
                                        <h2>{event.title}</h2>
                                        <p>{ticketType} Plan Selection</p>
                                    </div>
                                    <Card.Body className="checkout-body-content">
                                        <Row className="g-5">
                                            {/* Left Panel: Selection */}
                                            <Col md={7}>
                                                <div className="mb-4">
                                                    <Form.Label className="small fw-bold text-muted uppercase mb-2">Select Your Plan</Form.Label>
                                                    <Form.Select 
                                                        className="premium-input premium-select"
                                                        value={ticketType}
                                                        onChange={handlePlanChange}
                                                    >
                                                        {event.isMultiDay 
                                                            ? event.multiDayPlan[0].plans.map(p => <option key={p.name} value={p.name}>{p.name}</option>)
                                                            : event.ticketTypes.map(t => <option key={t.name} value={t.name}>{t.name}</option>)
                                                        }
                                                    </Form.Select>
                                                </div>
                                                
                                                <div className="mb-4">
                                                    <Form.Label className="small fw-bold text-muted uppercase mb-2">Number of Tickets</Form.Label>
                                                    <div className="quantity-control">
                                                        <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                                        <span className="qty-value">{quantity}</span>
                                                        <button className="qty-btn" onClick={() => setQuantity(Math.min(10, quantity + 1))}>+</button>
                                                    </div>
                                                </div>

                                                <div className="mt-5 pt-4 border-top">
                                                    <Link to={`/events/${event._id}`} className="text-muted text-decoration-none small fw-bold d-flex align-items-center gap-2">
                                                        <FaArrowLeft /> Cancel and return to event
                                                    </Link>
                                                </div>
                                            </Col>

                                            {/* Right Panel: Summary */}
                                            <Col md={5}>
                                                <div className="price-breakdown">
                                                    <h5 className="fw-bold mb-4">Order Summary</h5>
                                                    <div className="price-row">
                                                        <span>Subtotal ({quantity} × {ticketType})</span>
                                                        <span>₹{subtotal}</span>
                                                    </div>
                                                    <div className="price-row">
                                                        <span>Platform Fee</span>
                                                        <span>₹{platformFee}</span>
                                                    </div>
                                                    <div className="price-row total">
                                                        <span>Total Amount</span>
                                                        <span>₹{totalAmount}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 p-3 rounded-4 border border-pink-100 bg-pink-50/20">
                                                    <Form.Check 
                                                        type="checkbox"
                                                        id="partial-payment-check"
                                                        label="Pay in Installments?"
                                                        className="fw-bold text-pink small"
                                                        checked={isPartialPayment}
                                                        onChange={(e) => {
                                                            setIsPartialPayment(e.target.checked);
                                                            if (e.target.checked) setPartialAmount(Math.ceil(totalAmount / 2).toString());
                                                        }}
                                                    />
                                                    {isPartialPayment && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 overflow-hidden">
                                                            <Form.Label className="tiny-text uppercase text-muted fw-bold">Initial Payment Amount (₹)</Form.Label>
                                                            <Form.Control 
                                                                type="number"
                                                                className="premium-input-sm"
                                                                value={partialAmount}
                                                                onChange={(e) => setPartialAmount(e.target.value)}
                                                                max={totalAmount - 1}
                                                                min="1"
                                                            />
                                                            <p className="tiny-text text-muted mt-1">Pay ₹{totalAmount - (parseFloat(partialAmount) || 0)} later to get your entry clearance.</p>
                                                        </motion.div>
                                                    )}
                                                </div>
                                                
                                                <Button 
                                                    className="btn btn-pink mt-4" 
                                                    onClick={() => setStep(2)}
                                                >
                                                    Proceed to Details <FaArrowLeft style={{ transform: 'rotate(180deg)' }} />
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="details" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <Row className="justify-content-center">
                                <Col lg={10}>
                                    <Card className="checkout-premium-card">
                                        <div className="checkout-header-section">
                                            <h2>Attendee Details</h2>
                                            <p>Complete information for all {quantity} tickets</p>
                                        </div>
                                        <Card.Body className="checkout-body-content">
                                            {error && (
                                                <Alert variant="danger" className="rounded-4 border-0 bg-danger bg-opacity-10 text-danger mb-4">
                                                    <FaShieldAlt className="me-2" /> {error}
                                                </Alert>
                                            )}

                                            <Row className="g-4">
                                                {attendeeDetails.map((att, index) => (
                                                    <Col key={index} md={quantity > 1 ? 6 : 12}>
                                                        <div className="attendee-card">
                                                            <div className="sector-tag">Ticket #{index + 1}</div>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="small fw-bold text-muted uppercase">Full Name</Form.Label>
                                                                <Form.Control 
                                                                    className="premium-input" 
                                                                    placeholder="Enter attendee name" 
                                                                    value={att.name} 
                                                                    onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)} 
                                                                />
                                                            </Form.Group>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="small fw-bold text-muted uppercase">Email Address</Form.Label>
                                                                <Form.Control 
                                                                    type="email" 
                                                                    className="premium-input" 
                                                                    placeholder="email@example.com" 
                                                                    value={att.email} 
                                                                    onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)} 
                                                                />
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Label className="small fw-bold text-muted uppercase">Phone Number</Form.Label>
                                                                <Form.Control 
                                                                    type="tel" 
                                                                    className="premium-input" 
                                                                    placeholder="+91 00000 00000" 
                                                                    value={att.phone} 
                                                                    onChange={(e) => handleAttendeeChange(index, 'phone', e.target.value)} 
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>

                                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 mt-5 pt-4 border-top">
                                                <button className="btn btn-link text-muted text-decoration-none fw-bold" onClick={() => setStep(1)}>
                                                    <FaArrowLeft /> Back to selection
                                                </button>
                                                <div className="d-flex flex-column flex-sm-row gap-3 w-100 w-md-auto">
                                                    <Button className="btn btn-outline-pink rounded-pill fw-bold px-4" onClick={handleDemoPayment}>
                                                        Bypass for Demo
                                                    </Button>
                                                    <Button className="btn btn-pink px-5" onClick={initiatePaymentFlow}>
                                                        {loading ? <FaSync className="fa-spin" /> : 'Secure Payment →'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-5">
                            <div className="mb-5 position-relative d-inline-block">
                                <Spinner animation="border" variant="primary" className="processing-spinner-large" />
                            </div>
                            <h2 className="fw-bold mb-3">Processing Payment...</h2>
                            <p className="text-muted fw-medium">Please do not refresh the page or close your browser.</p>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-5">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-4 p-4">
                                <FaCheckCircle size={60} className="text-success" />
                            </div>
                            <h1 className="fw-bold display-5 mb-3">Payment Successful!</h1>
                            <p className="text-muted fs-5 mb-5 mx-auto" style={{ maxWidth: '600px' }}>Your booking is confirmed. Your digital pass has been sent to your email and is available in your dashboard.</p>
                            
                            <div className="d-flex flex-column flex-sm-row justify-content-center gap-4">
                                <Button as={Link} to={ticketId ? `/ticket/${ticketId}` : "/my-bookings"} className="btn btn-pink px-5">
                                    {ticketId ? "View Digital Pass" : "Go to Dashboard"}
                                </Button>
                                <Button as={Link} to="/events" className="btn btn-outline-pink rounded-pill fw-bold px-4">
                                    Book Another Event
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>
        </div>
    );
};

export default CheckoutFlow;

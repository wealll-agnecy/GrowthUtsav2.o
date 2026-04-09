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
    const [attendeeDetails, setAttendeeDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [ticketId, setTicketId] = useState(null);
    
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
        } else if (attendeeDetails.length === 0) {
            logMission('INITIALIZATION', 'ESTABLISHING_ATTENDEE_PROTOCOLS');
            const initialDetails = Array.from({ length: state.quantity }, () => ({
                name: '', email: '', phone: ''
            }));
            if (user) {
                initialDetails[0].name = user.name || '';
                initialDetails[0].email = user.email || '';
            }
            setAttendeeDetails(initialDetails);
        }
    }, [state, navigate, user, attendeeDetails.length]);

    if (!state || !state.event) return null;
    const { event, ticketType, quantity, totalPrice } = state;

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
                quantity,
                attendeeDetails
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
                eventId: event._id, ticketType, quantity, attendeeDetails
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
        <div className="page-wrapper min-vh-100 pb-5 pt-navbar-custom">
            <Container className="pt-4">
                {/* ─── Breadcrumb Progress ─── */}
                <div className="d-flex justify-content-center mb-4 mb-md-5">
                    <div className="d-flex align-items-center gap-1 gap-md-4 glass-panel px-3 px-md-4 py-2 py-md-3 rounded-pill shadow-lg border-white/10 w-fit-content overflow-hidden">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <Badge 
                                    bg={step >= s ? 'primary' : 'transparent'} 
                                    className={`rounded-pill px-2 px-md-3 py-2 checkout-breadcrumb-badge ${step >= s ? 'shadow-glow' : 'border border-white/20 text-white-50'}`} 
                                >
                                    {s === 1 && <><FaShoppingCart className="me-2" /> CART</>}
                                    {s === 2 && <><FaUserFriends className="me-2" /> DETAILS</>}
                                    {s === 3 && <><FaCreditCard className="me-2" /> {step === 4 ? 'SYNCED' : 'PAY'}</>}
                                </Badge>
                                {s < 3 && <div className={`d-none d-sm-block checkout-progress-line ${step > s ? 'bg-primary' : 'bg-white-10'}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: CART */}
                    {step === 1 && (
                        <motion.div key="cart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <Card className="glass-card border-white/10 shadow-2xl rounded-5 overflow-hidden mx-auto checkout-payload-card">
                                <Card.Header className="bg-primary p-4 border-0">
                                    <h4 className="fw-black text-white m-0 d-flex align-items-center gap-2"><FaShoppingCart /> Mission Payload</h4>
                                </Card.Header>
                                <Card.Body className="p-4 p-md-5 bg-dark">
                                    <div className="bg-white/5 p-4 rounded-4 border border-white/10 mb-5">
                                        <div className="text-white-50 small fw-black uppercase tracking-widest mb-1">Target Node</div>
                                        <div className="text-white fw-black h3 mb-4">{event.title}</div>
                                        <div className="d-flex justify-content-between border-top border-white/10 pt-4">
                                            <div>
                                                <div className="text-white-50 small fw-bold uppercase tracking-widest mb-1">Units</div>
                                                <div className="text-white fw-black h4 m-0">{quantity} × {ticketType}</div>
                                            </div>
                                            <div className="text-end">
                                                <div className="text-white-50 small fw-bold uppercase tracking-widest mb-1">Resonance</div>
                                                <div className="text-primary fw-black h4 m-0 gradient-text">₹{totalPrice}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center gap-3">
                                        <Link to={`/events/${event._id}`} className="btn-back">
                                            <FaArrowLeft /> ABORT MISSION
                                        </Link>
                                        <Button variant="primary" className="btn-primary" onClick={() => setStep(2)}>
                                            PROCEED TO SCAN
                                        </Button>
                                    </div>
                                </Card.Body>

                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 2: DETAILS */}
                    {step === 2 && (
                        <motion.div key="details" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <Row className="justify-content-center">
                                <Col lg={9}>
                                    <Card className="glass-card border-white/10 shadow-2xl rounded-5 overflow-hidden">
                                        <Card.Header className="bg-primary p-4 border-0">
                                            <h4 className="fw-black text-white m-0 d-flex align-items-center gap-2"><FaUserFriends /> Identity Protocols</h4>
                                        </Card.Header>
                                        <Card.Body className="p-4 p-md-5 bg-dark">
                                            {error && (
                                                <Alert variant="danger" className="glass-panel text-danger border-danger/20 rounded-4 d-flex align-items-center gap-3 mb-5 py-3">
                                                    <FaShieldAlt className="animate-pulse" /> <strong>Protocol Warning:</strong> {error}
                                                </Alert>
                                            )}

                                            <Row className="g-4">
                                                {attendeeDetails.map((att, index) => (
                                                    <Col key={index} md={quantity > 1 ? 6 : 12}>
                                                        <div className="bg-white/5 p-4 rounded-4 border border-white/10 h-100">
                                                            <div className="d-flex align-items-center gap-2 mb-4">
                                                                <Badge bg="primary" className="rounded-circle attendee-sector-badge">{index + 1}</Badge>
                                                                <span className="text-white fw-black small uppercase tracking-widest">Sector {index + 1}</span>
                                                            </div>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="text-white-50 small fw-black uppercase tracking-widest sector-label-static">Identity Signature</Form.Label>
                                                                <Form.Control className="bg-black/40 border-white/10 text-white rounded-3 fs-6" placeholder="Full Name" value={att.name} onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)} />
                                                            </Form.Group>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="text-white-50 small fw-black uppercase tracking-widest sector-label-static">Communication Node</Form.Label>
                                                                <Form.Control type="email" className="bg-black/40 border-white/10 text-white rounded-3 fs-6" placeholder="Email" value={att.email} onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)} />
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Label className="text-white-50 small fw-black uppercase tracking-widest sector-label-static">Signal Frequency</Form.Label>
                                                                <Form.Control type="tel" className="bg-black/40 border-white/10 text-white rounded-3 fs-6" placeholder="Phone" value={att.phone} onChange={(e) => handleAttendeeChange(index, 'phone', e.target.value)} />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>

                                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 mt-5 pt-4 border-top border-white/10">
                                                <button className="btn-back" onClick={() => setStep(1)}>
                                                    <FaArrowLeft /> RECALIBRATE
                                                </button>
                                                <div className="d-flex flex-column flex-sm-row gap-3 w-100 w-md-auto">
                                                    <Button variant="outline-primary" className="btn-outline-primary" onClick={handleDemoPayment}>
                                                        BYPASS SYNC
                                                    </Button>
                                                    <Button variant="primary" className="btn-primary d-flex align-items-center justify-content-center gap-3" onClick={initiatePaymentFlow}>
                                                        INITIALIZE PAY {loading && <FaSync className="fa-spin" />}
                                                    </Button>
                                                </div>
                                            </div>

                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </motion.div>
                    )}

                    {/* STEP 3: PROCESSING */}
                    {step === 3 && (
                        <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-5">
                            <div className="mb-5 position-relative d-inline-block">
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} className="position-absolute top-50 start-50 translate-middle bg-primary rounded-circle processing-glow-effect" />
                                <Spinner animation="border" variant="primary" className="position-relative processing-spinner-large" />
                            </div>
                            <h2 className="text-white fw-black uppercase tracking-widest mb-3">SYNCHRONIZING PORTAL</h2>
                            <p className="text-white-50 opacity-60 fw-bold uppercase tracking-widest small">SECURE HANDSHAKE IN PROGRESS • DO NOT DISCONNECT</p>
                        </motion.div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {step === 4 && (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-5">
                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success/20 mb-5 border border-success/30 shadow-glow success-icon-container">
                                <FaCheckCircle size={60} className="text-success shadow-glow" />
                            </motion.div>
                            <h1 className="text-white fw-black uppercase tracking-tightest display-4 mb-3">CLEARANCE GRANTED</h1>
                            <p className="text-white-50 fs-5 mb-5 mx-auto max-w-600">Identity verification complete. Digital pass synchronized to your mission hub.</p>
                            
                            <div className="d-flex flex-column flex-sm-row justify-content-center gap-4">
                                <Button as={Link} to={ticketId ? `/ticket/${ticketId}` : "/my-bookings"} variant="primary" className="rounded-pill px-5 py-4 fw-black uppercase tracking-widest shadow-glow fs-5 border-0">
                                    {ticketId ? "VIEW & DOWNLOAD PASS" : "VIEW PASS HUB"}
                                </Button>
                                <Button as={Link} to="/events" variant="link" className="text-white fw-black text-decoration-none p-4 uppercase tracking-widest small opacity-60 hover-opacity-100">
                                    DEPLOY NEW MISSION
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

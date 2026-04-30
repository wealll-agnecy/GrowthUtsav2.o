import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaShoppingCart, FaUserFriends, FaCreditCard, FaCheckCircle, FaArrowLeft, FaShieldAlt, FaSync, FaEnvelopeOpenText, FaRocket } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import * as bookingApi from '../api/bookingApi';
import toast from 'react-hot-toast';
import './CheckoutFlow.css';

const CheckoutFlow = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [step, setStep] = useState(1);
    const [quantity, setQuantity] = useState(state?.quantity || 1);
    const [ticketType, setTicketType] = useState(state?.ticketType);
    const [price, setPrice] = useState(state?.totalPrice / (state?.quantity || 1) || 0);
    const platformFee = 50;

    const [attendeeDetails, setAttendeeDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ticketId, setTicketId] = useState(null);
    const [isPartialPayment, setIsPartialPayment] = useState(false);
    const [partialAmount, setPartialAmount] = useState('');
    const [contactEmail, setContactEmail] = useState(user?.email || '');
    
    useEffect(() => {
        if (!state || !state.event) {
            navigate('/events');
        } else {
            if (attendeeDetails.length !== quantity) {
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
        for (let i = 0; i < attendeeDetails.length; i++) {
            const att = attendeeDetails[i];
            if (!att.name.trim() || !att.email.trim() || !att.phone.trim()) {
                toast.error(`Attendee #${i + 1} info missing`);
                return false;
            }
        }
        if (!contactEmail.trim()) {
            toast.error('Please provide a confirmation email');
            return false;
        }
        return true;
    };

    const initiatePaymentFlow = async () => {
        if (!validateForms()) return;
        setStep(3);
        setLoading(true);

        try {
            const res = await bookingApi.checkout({
                eventId: event._id,
                ticketType,
                selectedDate,
                selectedDays,
                quantity,
                attendeeDetails,
                contactEmail,
                partialAmount: isPartialPayment ? parseFloat(partialAmount) : undefined
            });

            if (res.data.success) {
                setTicketId(res.data.ticketId);
                setStep(4);
            } else {
                throw new Error(res.data.message || 'Booking failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page-wrapper">
            {/* Background Decorations */}
            <div className="checkout-bg-decoration">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <Container className="checkout-container-relative">
                {/* ─── Premium Stepper ─── */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="modern-stepper"
                >
                    <div className={`step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        {step > 1 ? <FaCheckCircle /> : <FaShoppingCart />} CART
                    </div>
                    <div className="step-divider" />
                    <div className={`step-item ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                        {step > 2 ? <FaCheckCircle /> : <FaUserFriends />} DETAILS
                    </div>
                    <div className="step-divider" />
                    <div className={`step-item ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                        {step > 3 ? <FaCheckCircle /> : <FaCreditCard />} PAYMENT
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div 
                            key="cart" 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, x: -30 }} 
                            className="row justify-content-center"
                        >
                            <div className="col-lg-11">
                                <div className="checkout-premium-card">
                                    <div className="checkout-header-section">
                                        <h2>Review Your Selection</h2>
                                        <p className="text-soft">Experience the best of GrowthUtsav with {event.title}</p>
                                    </div>
                                    <div className="checkout-body-content">
                                        <Row className="g-5">
                                            <Col lg={7}>
                                                <div className="event-mini-preview">
                                                    <img src={event.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'} alt="Event" className="mini-img" />
                                                    <div>
                                                        <h5 className="fw-bold m-0">{event.title}</h5>
                                                        <Badge bg="light" text="dark" className="mt-2">{ticketType} Pass</Badge>
                                                    </div>
                                                </div>

                                                <div className="mb-5">
                                                    <Form.Label className="small fw-black text-muted uppercase mb-3">Change Ticket Plan</Form.Label>
                                                    <Form.Select 
                                                        className="premium-input"
                                                        value={ticketType}
                                                        onChange={handlePlanChange}
                                                    >
                                                        {event.isMultiDay 
                                                            ? event.multiDayPlan[0].plans.map(p => <option key={p.name} value={p.name}>{p.name}</option>)
                                                            : event.ticketTypes.map(t => <option key={t.name} value={t.name}>{t.name}</option>)
                                                        }
                                                    </Form.Select>
                                                </div>
                                                
                                                <div className="mb-5">
                                                    <Form.Label className="small fw-black text-muted uppercase mb-3">Adjust Quantity</Form.Label>
                                                    <div className="quantity-control">
                                                        <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</button>
                                                        <span className="qty-value fs-5">{quantity}</span>
                                                        <button className="qty-btn" onClick={() => setQuantity(Math.min(10, quantity + 1))}>+</button>
                                                    </div>
                                                </div>

                                                <Link to={`/events/${event._id}`} className="text-muted text-decoration-none small fw-bold d-flex align-items-center gap-2 mt-4 hover-pink">
                                                    <FaArrowLeft /> Back to event details
                                                </Link>
                                            </Col>

                                            <Col lg={5}>
                                                <div className="price-breakdown">
                                                    <h5 className="fw-black mb-4">Order Summary</h5>
                                                    <div className="price-row">
                                                        <span>Subtotal ({quantity} Tickets)</span>
                                                        <span>₹{subtotal}</span>
                                                    </div>
                                                    <div className="price-row">
                                                        <span>Platform Secure Fee</span>
                                                        <span>₹{platformFee}</span>
                                                    </div>
                                                    <div className="price-row total">
                                                        <span>Total</span>
                                                        <span>₹{totalAmount}</span>
                                                    </div>

                                                    <div className="mt-4 p-4 rounded-4 bg-light border border-opacity-10">
                                                        <Form.Check 
                                                            type="switch"
                                                            id="partial-payment-check"
                                                            label="Enable Installment Payment"
                                                            className="fw-bold text-dark"
                                                            checked={isPartialPayment}
                                                            onChange={(e) => {
                                                                setIsPartialPayment(e.target.checked);
                                                                if (e.target.checked) setPartialAmount(Math.ceil(totalAmount / 2).toString());
                                                            }}
                                                        />
                                                        {isPartialPayment && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                                                                <Form.Control 
                                                                    type="number"
                                                                    className="premium-input"
                                                                    placeholder="Initial payment"
                                                                    value={partialAmount}
                                                                    onChange={(e) => setPartialAmount(e.target.value)}
                                                                />
                                                                <p className="small text-muted mt-2">Balance of ₹{totalAmount - (parseFloat(partialAmount) || 0)} can be paid later.</p>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                    
                                                    <Button 
                                                        className="futuristic-btn w-100 mt-4" 
                                                        onClick={() => setStep(2)}
                                                    >
                                                        Continue to Details
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="details" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="row justify-content-center">
                            <Col lg={11}>
                                <div className="checkout-premium-card">
                                    <div className="checkout-header-section">
                                        <h2>Attendee Identity</h2>
                                        <p className="text-soft">Please provide accurate details for entry clearance</p>
                                    </div>
                                    <div className="checkout-body-content">
                                        <div className="mb-5 p-4 rounded-4 bg-primary bg-opacity-5 border border-primary border-opacity-10 d-flex gap-3 align-items-center">
                                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                                                <FaEnvelopeOpenText size={24} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold m-0">Secure Email Delivery</h6>
                                                <p className="small text-muted m-0">Tickets will be dispatched to the primary contact email address.</p>
                                            </div>
                                            <Form.Control 
                                                className="premium-input ms-auto w-auto" 
                                                placeholder="Primary Email" 
                                                value={contactEmail}
                                                onChange={(e) => setContactEmail(e.target.value)}
                                            />
                                        </div>

                                        <Row className="g-4">
                                            {attendeeDetails.map((att, index) => (
                                                <Col key={index} md={quantity > 1 ? 6 : 12}>
                                                    <motion.div whileHover={{ y: -5 }} className="attendee-card">
                                                        <div className="sector-tag">Ticket Holder #{index + 1}</div>
                                                        <Form.Group className="mb-4">
                                                            <Form.Label className="tiny-text uppercase fw-bold text-muted">Full Name</Form.Label>
                                                            <Form.Control 
                                                                className="premium-input" 
                                                                placeholder="As per ID" 
                                                                value={att.name} 
                                                                onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)} 
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-4">
                                                            <Form.Label className="tiny-text uppercase fw-bold text-muted">Email</Form.Label>
                                                            <Form.Control 
                                                                className="premium-input" 
                                                                placeholder="Personal email" 
                                                                value={att.email} 
                                                                onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)} 
                                                            />
                                                        </Form.Group>
                                                        <Form.Group>
                                                            <Form.Label className="tiny-text uppercase fw-bold text-muted">Phone Number</Form.Label>
                                                            <Form.Control 
                                                                className="premium-input" 
                                                                placeholder="Active mobile" 
                                                                value={att.phone} 
                                                                onChange={(e) => handleAttendeeChange(index, 'phone', e.target.value)} 
                                                            />
                                                        </Form.Group>
                                                    </motion.div>
                                                </Col>
                                            ))}
                                        </Row>

                                        <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
                                            <Button variant="link" className="text-muted fw-bold text-decoration-none" onClick={() => setStep(1)}>
                                                ← Modify Selection
                                            </Button>
                                            <Button className="futuristic-btn px-5" onClick={initiatePaymentFlow}>
                                                Proceed to Secure Payment
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-5">
                            <div className="spinner-glow mb-4">
                                <Spinner animation="border" style={{ width: '80px', height: '80px', color: 'var(--primary)' }} />
                            </div>
                            <h2 className="fw-black">Authorizing Transaction...</h2>
                            <p className="text-soft">Connecting to secure payment gateway. Please wait.</p>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div 
                            key="success" 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            className="text-center py-5"
                        >
                            <div className="success-glow-wrap mb-5">
                                <div className="success-glow"></div>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                                >
                                    <FaCheckCircle size={100} className="text-success" />
                                </motion.div>
                            </div>

                            {isPartialPayment ? (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                    <h1 className="fw-black display-4 mb-3">Booking Initiated!</h1>
                                    <p className="text-soft fs-5 mb-5 mx-auto" style={{ maxWidth: '600px' }}>Your partial payment was successful. Complete the remaining balance in your dashboard to unlock your full digital pass.</p>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                    <h1 className="fw-black display-4 mb-3">🎉 Congratulations!</h1>
                                    <h4 className="fw-bold text-primary mb-4">You have completed your full payment.</h4>
                                    <p className="text-dark fs-5 mb-1 mx-auto fw-bold" style={{ maxWidth: '600px' }}>Your ticket has already been sent to your email successfully.</p>
                                    <p className="text-muted mb-5 mx-auto" style={{ maxWidth: '600px' }}>Please check your inbox/spam folder for your digital ticket PDF.</p>
                                </motion.div>
                            )}
                            
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }} 
                                animate={{ y: 0, opacity: 1 }} 
                                transition={{ delay: 0.4 }}
                                className="d-flex flex-column flex-sm-row justify-content-center gap-4 mt-5"
                            >
                                <Button 
                                    as={Link} 
                                    to={`/digital-pass/${ticketId}`} 
                                    className="futuristic-btn"
                                    disabled={!ticketId}
                                >
                                    <FaRocket className="me-2" /> View Digital Pass
                                </Button>
                                <Button as={Link} to="/events" variant="outline-dark" className="rounded-pill fw-bold px-5">
                                    Explore More Events
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>
        </div>
    );
};

export default CheckoutFlow;

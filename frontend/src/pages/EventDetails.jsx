import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as eventApi from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import {
    FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCheckCircle,
    FaShoppingCart, FaArrowLeft, FaShieldAlt, FaTicketAlt,
    FaPhone, FaUserCircle
} from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';
import EventCard from '../components/events/EventCard';
import './EventDetails.css';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [relatedEvents, setRelatedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTier, setSelectedTier] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDays, setSelectedDays] = useState([]);
    const [isAllDays, setIsAllDays] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchEventAndRelated = async () => {
            setLoading(true);
            try {
                // Fetch current event
                const res = await eventApi.getEvent(id);
                const eventData = res.data.data;
                setEvent(eventData);
                
                if (eventData.isMultiDay && eventData.multiDayPlan.length > 0) {
                    const firstDay = eventData.multiDayPlan[0];
                    setSelectedDate(firstDay.date);
                    setSelectedDays([firstDay.date]);
                    setSelectedTier(firstDay.plans[0].name);
                } else if (eventData.ticketTypes.length > 0) {
                    setSelectedDate(eventData.date);
                    setSelectedTier(eventData.ticketTypes[0].name);
                }

                // Fetch related events (same category)
                const relatedRes = await eventApi.getEvents(`category=${eventData.category}&limit=4`);
                const filtered = relatedRes.data.data.filter(e => e._id !== id).slice(0, 3);
                setRelatedEvents(filtered);

            } catch (err) {
                setError(err.response?.data?.message || 'Event not found');
            } finally {
                setLoading(false);
            }
        };
        fetchEventAndRelated();
        window.scrollTo(0, 0);
    }, [id]);

    const handleBooking = () => {
        if (!user) { navigate('/login'); return; }

        if (user.role === 'organizer' && user.status === 'pending') {
            alert('Booking is not available until your organizer account is verified.');
            return;
        }

        const parsedQuantity = parseInt(quantity);
        if (!parsedQuantity || parsedQuantity < 1) {
            alert('Please select a valid quantity.');
            return;
        }

        if (event.isMultiDay && selectedDays.length === 0) {
            alert('Please select at least one day to book.');
            return;
        }

        let currentPrice = 0;
        if (event.isMultiDay) {
            selectedDays.forEach(date => {
                const day = event.multiDayPlan.find(d => d.date === date);
                const plan = day?.plans.find(p => p.name === selectedTier);
                currentPrice += plan?.price || 0;
            });
        } else {
            const ticket = event.ticketTypes.find(t => t.name === selectedTier);
            currentPrice = ticket?.price || 0;
        }

        navigate('/checkout', {
            state: {
                event,
                ticketType: selectedTier,
                selectedDate: event.isMultiDay ? selectedDays[0] : selectedDate,
                selectedDays: event.isMultiDay ? selectedDays : [],
                quantity: parsedQuantity,
                totalPrice: currentPrice * parsedQuantity
            }
        });
    };

    if (loading) {
        return (
            <div className="loader-screen-center">
                <div className="text-center">
                    <FaTicketAlt size={50} className="loader-icon-pink" />
                    <p className="mt-3 fw-bold text-muted">Loading your premium experience...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="loader-screen-center">
                <Container>
                    <Alert variant="danger" className="text-center rounded-4 p-5">
                        <FaShieldAlt size={40} className="mb-3" />
                        <h3>Event Not Found</h3>
                        <p>{error || "We couldn't find the event you're looking for."}</p>
                        <Link to="/events" className="btn btn-outline-pink mt-3">Back to Events</Link>
                    </Alert>
                </Container>
            </div>
        );
    }

    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    const bannerUrl = (event.bannerImage && event.bannerImage !== 'no-photo.jpg')
        ? (event.bannerImage.startsWith('http') ? event.bannerImage : `http://localhost:5000/uploads/${event.bannerImage}`)
        : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2000';

    let selectedTicket;
    let currentPlans = [];
    let allSoldOut = false;
    let computedTotalPrice = 0;
    let displayPricePerPerson = 0;

    if (event.isMultiDay) {
        // Use the first selected day (or first day if none selected) to find plans
        const referenceDate = selectedDays.length > 0 ? selectedDays[0] : event.multiDayPlan[0].date;
        const currentDay = event.multiDayPlan.find(d => d.date === referenceDate);
        currentPlans = currentDay?.plans || [];
        selectedTicket = currentPlans.find(p => p.name === selectedTier);
        
        let anySoldOut = false;
        selectedDays.forEach(date => {
            const day = event.multiDayPlan.find(d => d.date === date);
            const plan = day?.plans.find(p => p.name === selectedTier);
            if (plan) {
                displayPricePerPerson += plan.price;
                if (plan.quantity - plan.sold <= 0) anySoldOut = true;
            }
        });
        allSoldOut = anySoldOut;
    } else {
        selectedTicket = event.ticketTypes.find(t => t.name === selectedTier);
        currentPlans = event.ticketTypes;
        allSoldOut = event.ticketTypes.every(t => t.quantity - t.sold <= 0);
        displayPricePerPerson = selectedTicket?.price || 0;
    }

    computedTotalPrice = displayPricePerPerson * quantity;

    return (
        <div className="event-details-page">
            {/* 1. HERO SECTION */}
            <section className="event-hero">
                <img 
                    src={bannerUrl} 
                    alt={event.title} 
                    className="hero-img" 
                    loading="eager" 
                    decoding="async" 
                />
                <div className="hero-overlay"></div>

                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="hero-tag">Featured Event</span>
                        <h1>{event.title}</h1>
                        <div className="hero-meta">
                            <span><FaMapMarkerAlt className="me-2" /> {event.venue}</span>
                            <span><FaCalendarAlt className="ms-3 me-2" /> {formattedDate}</span>
                        </div>
                    </motion.div>
                </div>
                
                <Link to="/events" className="position-absolute top-0 start-0 m-4 text-white z-3 text-decoration-none d-flex align-items-center gap-2 small fw-bold">
                    <FaArrowLeft /> Back
                </Link>
            </section>

            {/* 2. MAIN CONTENT (2 COLUMN) */}
            <section className="event-main py-5">
                <Container>
                    <Row className="g-5">
                        {/* LEFT (70%) */}
                        <Col lg={8}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <div className="event-content-card">
                                    <h3>About This Event</h3>
                                    <div className="description-text">
                                        {event.description}
                                    </div>

                                    <h4 className="mt-5">What You'll Learn</h4>
                                    <ul className="highlights-list">
                                        <li>Advanced Makeup Techniques & Layering</li>
                                        <li>Professional Skin Preparation & Priming</li>
                                        <li>Mastering the Art of Bridal Transformations</li>
                                        <li>Industry-Specific Styling & Color Theory</li>
                                        <li>Exclusive Insights from Lead Artists</li>
                                    </ul>
                                </div>

                                <div className="event-content-card mt-4">
                                    <h5 className="fw-black uppercase tracking-widest small mb-4 opacity-50">Host Infrastructure</h5>
                                    <div className="d-flex align-items-center gap-4 p-3 bg-white/2 rounded-4 border border-white/5">
                                        <div className="host-avatar-wrapper shadow-glow">
                                            {event.organizer?.avatar && event.organizer.avatar !== 'no-avatar.jpg' ? (
                                                <img 
                                                    src={event.organizer.avatar.startsWith('http') ? event.organizer.avatar : `${axios.defaults.baseURL}${event.organizer.avatar}`} 
                                                    alt="Host" 
                                                    className="rounded-circle border border-3 border-pink shadow"
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="bg-pink bg-opacity-10 rounded-circle border border-3 border-pink d-flex align-items-center justify-content-center shadow-lg" style={{ width: '80px', height: '80px' }}>
                                                    <FaUserCircle size={60} className="text-pink opacity-50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="host-info flex-grow-1">
                                            <h4 className="fw-black m-0 tracking-tighter text-white d-flex align-items-center gap-2">
                                                {event.organizer?.name || 'Authorized Host'}
                                                <Badge bg="pink-subtle" className="text-pink px-2 py-1 rounded-pill small uppercase tracking-tighter" style={{ fontSize: '10px' }}>Verified</Badge>
                                            </h4>
                                        </div>
                                        <div className="d-none d-md-block">
                                            <Link to="/contact-us" className="btn btn-outline-pink btn-sm rounded-pill px-4 fw-bold">Inquiry</Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Col>

                        {/* RIGHT (30%) */}
                        <Col lg={4}>
                            <div className="booking-card-wrapper">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="booking-card"
                                >
                                    <span className="booking-price">₹{displayPricePerPerson}</span>
                                    <p className="text-muted small fw-bold">Per Person</p>
                                    
                                    <ul className="booking-details">
                                        <li><FaCalendarAlt /> {event.isMultiDay ? `${selectedDays.length} Day(s) Selected` : formattedDate}</li>
                                        <li><FaMapMarkerAlt /> {event.venue}</li>
                                        <li><FaClock /> {event.time}</li>
                                    </ul>

                                    {event.isMultiDay && (
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <Form.Label className="small fw-bold text-muted uppercase tracking-wider m-0">Select Event Date</Form.Label>
                                                <span className="badge bg-light text-pink border border-pink fw-bold">
                                                    {selectedDays.length} day(s) selected
                                                </span>
                                            </div>
                                            <div className="date-selector-scroll d-flex gap-2 pb-2">
                                                <div 
                                                    className={`date-chip ${isAllDays ? 'active' : ''}`}
                                                    onClick={() => {
                                                        if (!isAllDays) {
                                                            setIsAllDays(true);
                                                            setSelectedDays(event.multiDayPlan.map(d => d.date));
                                                        } else {
                                                            setIsAllDays(false);
                                                            setSelectedDays([]);
                                                        }
                                                    }}
                                                >
                                                    <div className="chip-day">All</div>
                                                    <div className="chip-weekday">Days</div>
                                                </div>
                                                {event.multiDayPlan.map((day, idx) => {
                                                    const isSelected = selectedDays.includes(day.date);
                                                    return (
                                                        <div 
                                                            key={idx}
                                                            className={`date-chip ${isSelected ? 'active' : ''}`}
                                                            onClick={() => {
                                                                if (isAllDays) {
                                                                    setIsAllDays(false);
                                                                    setSelectedDays([day.date]);
                                                                    setSelectedDate(day.date);
                                                                } else {
                                                                    if (isSelected) {
                                                                        setSelectedDays(selectedDays.filter(d => d !== day.date));
                                                                    } else {
                                                                        setSelectedDays([...selectedDays, day.date]);
                                                                        setSelectedDate(day.date);
                                                                    }
                                                                }
                                                                setSelectedTier(day.plans[0].name);
                                                            }}
                                                        >
                                                            <div className="chip-day">{new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                                                            <div className="chip-weekday">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted uppercase tracking-wider">
                                            {event.isMultiDay ? 'Select Plan' : 'Ticket Category'}
                                        </Form.Label>
                                        <div className="plan-selector d-flex flex-column gap-2">
                                            {currentPlans.map((tier, idx) => (
                                                <div 
                                                    key={idx}
                                                    className={`plan-option-card ${selectedTier === tier.name ? 'selected' : ''} ${tier.quantity - tier.sold <= 0 ? 'sold-out' : ''}`}
                                                    onClick={() => tier.quantity - tier.sold > 0 && setSelectedTier(tier.name)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center w-100">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className={`plan-radio ${selectedTier === tier.name ? 'checked' : ''}`}></div>
                                                            <span className="plan-name">{tier.name}</span>
                                                        </div>
                                                        <span className="plan-price-tag">₹{tier.price}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold text-muted">Quantity</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            max="10"
                                            className="rounded-3 border-light shadow-sm"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                        />
                                    </Form.Group>

                                    <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3">
                                        <span className="fw-bold text-muted">Total</span>
                                        <span className="h4 fw-bold text-pink mb-0">₹{computedTotalPrice}</span>
                                    </div>

                                    {user && (user.role === 'staff' || user.role === 'organizer') ? (
                                        <div className="text-center p-3 rounded-4 bg-danger bg-opacity-10 border border-danger border-opacity-20">
                                            <p className="small text-danger fw-bold m-0 uppercase tracking-widest">
                                                Restricted
                                            </p>
                                            <p className="tiny-text text-muted m-0 mt-1" style={{ fontSize: '0.7rem' }}>
                                                Staff & Organizers cannot book events.
                                            </p>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-pink w-100"
                                            onClick={handleBooking}
                                            disabled={allSoldOut}
                                        >
                                            {allSoldOut ? 'Sold Out' : 'Book Now'}
                                        </button>
                                    )}

                                    <div className="text-center mt-3">
                                        <small className="d-flex align-items-center justify-content-center gap-2 text-muted fw-bold" style={{ fontSize: '0.75rem' }}>
                                            <FaCheckCircle className="text-success" />
                                            100% Secure Checkout
                                        </small>
                                    </div>
                                </motion.div>

                                <div className="mt-4 p-3 rounded-4 bg-white shadow-sm border border-light d-flex align-items-center gap-3">
                                    <FaShieldAlt size={24} className="text-pink" />
                                    <div>
                                        <div className="fw-bold small">GrowthUtsav Verified</div>
                                        <div className="text-muted extra-small" style={{ fontSize: '0.7rem' }}>Official Event Partner</div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* EXTRA SECTION: Related Events */}
                    {relatedEvents.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="related-section mt-5 pt-5"
                        >
                            <h2 className="related-title">You Might Also Love</h2>
                            <Row className="g-4">
                                {relatedEvents.map(related => (
                                    <Col key={related._id} md={4}>
                                        <EventCard event={related} />
                                    </Col>
                                ))}
                            </Row>
                        </motion.div>
                    )}
                </Container>
            </section>
        </div>
    );
};

export default EventDetails;

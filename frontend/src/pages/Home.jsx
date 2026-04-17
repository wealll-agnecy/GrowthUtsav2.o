import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import {
    FaArrowRight, FaStar, FaShieldAlt, FaRocket, FaAward, FaTwitter, FaInstagram, FaFacebookF,
    FaQuoteLeft, FaMapMarkerAlt, FaCheckCircle
} from 'react-icons/fa';
import * as eventApi from '../api/eventApi';
import EventCard from '../components/events/EventCard';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/common/Footer';
import '../css/hero.css';
import '../css/cards.css';
import '../css/sections.css';
import '../css/global.css';

const WHY_CHOOSE_DATA = [
    { icon: <FaStar />, title: 'Verified Artists', desc: 'Secure booking with top-tier, identity-verified beauty professionals.' },
    { icon: <FaRocket />, title: 'Seamless Booking', desc: 'Instant confirmation and seamless ticket access in under 60 seconds.' },
    { icon: <FaAward />, title: 'Premium Experience', desc: 'Access exclusive masterclasses and premium luxury beauty events.' },
    { icon: <FaShieldAlt />, title: 'Trusted Platform', desc: 'A dedicated platform built for reliability and professional growth.' },
];

const SUCCESSFUL_EVENTS = [
    { name: 'Grand Bridal Expo', location: 'Mumbai, India', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800' },
    { name: 'Glow Masterclass', location: 'Delhi, India', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Elite Stylist Meetup', location: 'Bangalore, India', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800' },
];

const TOP_ARTISTS = [
    { name: 'Sophia Loren', specialty: 'Bridal Couture', rating: 4.9, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400' },
    { name: 'Marcus Chen', specialty: 'Editorial Makeup', rating: 4.8, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
    { name: 'Elena Gilbert', specialty: 'Skin Aesthetics', rating: 5.0, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400' },
    { name: 'David Miller', specialty: 'Hairstyling Elite', rating: 4.7, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400' },
];

const TESTIMONIALS = [
    { quote: "The masterclass changed my perspective on bridal makeup. The organization was flawless.", author: "Jessica Pearson", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" },
    { quote: "Finding premium beauty events has never been easier. Highly recommend this platform.", author: "Sarah Jenkins", img: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=150" },
];

const PREVIOUS_EVENTS = [
    { id: 1, title: 'Grand Bridal Masterclass', url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-dancing-in-studio-42521-large.mp4' },
    { id: 2, title: 'Luxury Skincare Workshop', url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-applying-makeup-to-her-face-2401-large.mp4' },
    { id: 3, title: 'Editorial Makeup Live', url: 'https://assets.mixkit.co/videos/preview/mixkit-makeup-artist-applying-makeup-to-a-woman-34079-large.mp4' },
    { id: 4, title: 'Vogue Styling Session', url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-applying-lipstick-on-her-lips-34077-large.mp4' },
    { id: 5, title: 'Pro Beauty Expo 2025', url: 'https://assets.mixkit.co/videos/preview/mixkit-makeup-brushes-applying-powder-to-a-woman-34080-large.mp4' },
    { id: 6, title: 'Editorial Hair Art', url: 'https://assets.mixkit.co/videos/preview/mixkit-stylist-fixing-the-hair-of-a-woman-34078-large.mp4' },
    { id: 7, title: 'Luxe Gloss Masterclass', url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-with-blue-eyeshadow-and-glossy-lips-42518-large.mp4' },
    { id: 8, title: 'High-Fashion Runway', url: 'https://assets.mixkit.co/videos/preview/mixkit-model-with-braided-hair-and-glossy-makeup-42516-large.mp4' },
];

const Home = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await eventApi.getEvents();
                if (res?.data?.success) {
                    setEvents(res.data.data || []);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const featuredEvents = Array.isArray(events) ? events.slice(0, 4) : [];

    return (
        <div className="homepage-beauty-wrapper">

            {/* ═══════════ HERO SECTION ═══════════ */}
            <section className="hero-section d-flex align-items-center">
                <Container fluid className="px-lg-5">
                    <Row className="align-items-center">
                        <Col lg={7} className="text-lg-start text-center">
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="hero-title mb-4"
                            >
                                Elevate Your Beauty <br /> Events Experience
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="hero-subtitle mb-5"
                            >
                                Discover, plan, and book premium makeup and styling events with world-renowned artists and educators.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="d-flex flex-column flex-sm-row gap-4 justify-content-center justify-content-lg-start"
                            >
                                <button className="btn btn-primary-custom" onClick={() => navigate('/events')}>Host Events</button>
                                <button className="btn btn-outline-custom" onClick={() => navigate('/events')}>Explore Events</button>
                            </motion.div>
                        </Col>
                        <Col lg={5} className="d-none d-lg-block">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="hero-visual"
                            >
                                <div className="hero-main-img-container">
                                    <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200" alt="Beauty" className="hero-main-img" />
                                    <div className="hero-img-overlay"></div>
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ═══════════ SECTION 1: CURATED EXPERIENCES ═══════════ */}
            <section className="curated-section">
                <Container className="py-4 py-lg-5">
                    <div className="d-flex justify-content-between align-items-end mb-5">
                        <div>
                            <span className="section-subtitle-premium">Curated Experiences</span>
                            <h2 className="section-title-premium">Featured Beauty Events</h2>
                        </div>
                        <Link to="/events" className="btn btn-link text-primary text-decoration-none fw-bold p-0">
                            View All <FaArrowRight size={12} className="ms-1" />
                        </Link>
                    </div>
                    <Row className="g-4">
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <Col key={i} lg={3} md={6}>
                                    <div className="skeleton rounded-4" style={{ height: '340px', width: '100%' }}></div>
                                </Col>
                            ))
                        ) : (
                            featuredEvents.map((event) => (
                                <Col key={event._id} lg={3} md={6}>
                                    <motion.div 
                                        whileHover={{ y: -12 }} 
                                        transition={{ duration: 0.3 }}
                                        className="h-100"
                                    >
                                        <EventCard event={event} />
                                    </motion.div>
                                </Col>
                            ))
                        )}
                    </Row>
                </Container>
            </section>

            {/* ═══════════ SECTION 2: THE DIFFERENCE ═══════════ */}
            <section className="difference-section">

            {/* ═══════════ PREVIOUS EVENTS VIDEO SLIDER (FLOATING) ═══════════ */}
            <div className="container">
                <div className="video-slider-floating-box">
                    <div className="video-section-header">
                        <span className="section-subtitle-premium">History in Motion</span>
                        <h2 className="video-section-title">Previous Events Highlights</h2>
                    </div>
                    
                    <div className="video-slider-wrapper">
                        <div className="video-track">
                            {/* Original Loop */}
                            {PREVIOUS_EVENTS.map((vid) => (
                                <div key={`vid-${vid.id}`} className="video-card-premium">
                                    <div className="video-player-container">
                                        <video autoPlay muted loop playsInline>
                                            <source src={vid.url} type="video/mp4" />
                                        </video>
                                    </div>
                                    <div className="video-card-title">{vid.title}</div>
                                </div>
                            ))}
                            {/* Duplicate Loop for Infinity */}
                            {PREVIOUS_EVENTS.map((vid) => (
                                <div key={`vid-dup-${vid.id}`} className="video-card-premium">
                                    <div className="video-player-container">
                                        <video autoPlay muted loop playsInline>
                                            <source src={vid.url} type="video/mp4" />
                                        </video>
                                    </div>
                                    <div className="video-card-title">{vid.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
                <Container className="py-4 py-lg-5">
                    <div className="text-center mb-5">
                        <span className="section-subtitle-premium">The Difference</span>
                        <h2 className="section-title-premium">Why Choose GrowthUtsav</h2>
                    </div>
                    <Row className="g-4">
                        {WHY_CHOOSE_DATA.map((feature, i) => (
                            <Col md={3} sm={6} key={i}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="premium-feature-card"
                                >
                                    <div className="feature-icon-wrapper">{feature.icon}</div>
                                    <h5>{feature.title}</h5>
                                    <p>{feature.desc}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ═══════════ SECTION 3: OUR SUCCESSFUL EVENTS ═══════════ */}
            <section className="successful-events-section">
                <Container className="py-4 py-lg-5">
                    <div className="text-center mb-5">
                        <span className="section-subtitle-premium">Our Legacy</span>
                        <h2 className="section-title-premium">Our Successful Events</h2>
                    </div>
                    <Row className="g-4">
                        {SUCCESSFUL_EVENTS.map((event, i) => (
                            <Col md={4} key={i}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="past-event-card"
                                >
                                    <img src={event.img} alt={event.name} className="past-event-img" />
                                    <div className="past-event-overlay">
                                        <div className="past-event-tag">
                                            <FaCheckCircle className="me-1" /> Successful
                                        </div>
                                        <h4 className="past-event-title">{event.name}</h4>
                                        <div className="past-event-location">
                                            <FaMapMarkerAlt /> {event.location}
                                        </div>
                                    </div>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>


            {/* ═══════════ TESTIMONIALS ═══════════ */}
            <section className="testimonials-section">
                <Container className="py-4 py-lg-5">
                    <Row className="justify-content-center">
                        <Col lg={8} className="text-center mb-5">
                            <h6 className="uppercase tracking-widest text-primary fw-bold mb-2">Voices Of Elegance</h6>
                            <h2 className="fw-bold text-dark">Client Testimonials</h2>
                        </Col>
                    </Row>
                    <Row className="g-4">
                        {TESTIMONIALS.map((t, i) => (
                            <Col md={6} key={i}>
                                <div className="testimonial-card">
                                    <FaQuoteLeft className="text-primary opacity-20 mb-3" size={30} />
                                    <p className="testimonial-quote">"{t.quote}"</p>
                                    <div className="testimonial-author">
                                        <img src={t.img} alt={t.author} className="author-img" />
                                        <span className="author-name">{t.author}</span>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ═══════════ CTA SECTION ═══════════ */}
            <section className="cta-beauty-section">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="cta-beauty-content"
                    >
                        <h2>Start Your Beauty Journey Today</h2>
                        <p>Join thousands of professionals and enthusiasts in exploring the elite world of artistry.</p>
                        <button className="btn btn-primary-custom" onClick={() => navigate('/register')}>Join GrowthUtsav Now</button>
                    </motion.div>
                </Container>
            </section>

        </div>
    );
};

export default Home;

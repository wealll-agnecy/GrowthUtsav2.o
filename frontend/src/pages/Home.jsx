import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import {
    FaArrowRight, FaStar, FaShieldAlt, FaRocket, FaAward, FaTwitter, FaInstagram, FaFacebookF,
    FaQuoteLeft, FaMapMarkerAlt, FaCheckCircle
} from 'react-icons/fa';
import * as eventApi from '../api/eventApi';
import EventCard from '../components/events/EventCard';
import { motion, useInView } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import videoUrl from '../assets/video1.mp4';
import Footer from '../components/common/Footer';
import Typewriter from 'typewriter-effect';
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
    { id: 1, title: 'Grand Bridal Masterclass', url: videoUrl },
    { id: 2, title: 'Luxury Skincare Workshop', url: videoUrl },
    { id: 3, title: 'Editorial Makeup Live', url: videoUrl },
    { id: 4, title: 'Vogue Styling Session', url: videoUrl },
    { id: 5, title: 'Pro Beauty Expo 2025', url: videoUrl },
    { id: 6, title: 'Editorial Hair Art', url: videoUrl },
    { id: 7, title: 'Luxe Gloss Masterclass', url: videoUrl },
    { id: 8, title: 'High-Fashion Runway', url: videoUrl },
];

const BookFlipShowcase = ({ events }) => {
    const [flippedIndices, setFlippedIndices] = useState(new Set());
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let interval;
        if (isHovered) {
            interval = setInterval(() => {
                setFlippedIndices(prev => {
                    const next = new Set(prev);
                    const nextToFlip = events.findIndex((_, i) => !next.has(i));
                    if (nextToFlip !== -1) {
                        next.add(nextToFlip);
                    } else {
                        next.clear();
                    }
                    return next;
                });
            }, 6000);
        }
        return () => clearInterval(interval);
    }, [isHovered, events]);

    const toggleFlip = (index) => {
        const nextIndices = new Set(flippedIndices);
        if (nextIndices.has(index)) {
            nextIndices.delete(index);
        } else {
            nextIndices.add(index);
        }
        setFlippedIndices(nextIndices);
    };

    return (
        <div
            className="book-view"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {events.map((vid, index) => {
                const isFlipped = flippedIndices.has(index);
                return (
                    <motion.div
                        key={`page-${vid.id}`}
                        className="book-page"
                        onClick={() => toggleFlip(index)}
                        style={{ zIndex: isFlipped ? index : 30 - index }}
                        animate={{
                            rotateY: isFlipped ? -165 : 0,
                            x: isFlipped ? -30 : 0,
                            z: isFlipped ? index * 2 : 0
                        }}
                        transition={{ duration: 0.9, ease: [0.645, 0.045, 0.355, 1.0] }}
                    >
                        <div className="page-front">
                            <div className="page-content">
                                <video autoPlay muted loop playsInline className="page-video">
                                    <source src={vid.url} type="video/mp4" />
                                </video>
                                <div className="page-overlay">
                                    <div className="page-number">COLLECTION 0{index + 1}</div>
                                    <h4 className="page-title">{vid.title}</h4>
                                    <div className="page-turn-hint mt-3">
                                        <span className="hint-text uppercase tracking-widest small opacity-75">
                                            {isHovered ? 'Playing story...' : 'Hover to play story'}
                                        </span>
                                    </div>
                                </div>
                                <div className="page-spine"></div>
                            </div>
                        </div>
                        <div className="page-back"></div>
                    </motion.div>
                );
            })}
            <div className="book-base-shadow"></div>
        </div>
    );
};

const Home = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const subtitleRef = useRef(null);
    const isSubtitleInView = useInView(subtitleRef, { 
        amount: 0.1,
        once: false
    });

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
                            <motion.div
                                ref={subtitleRef}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="hero-subtitle mb-5"
                            >
                                <Typewriter
                                    key={isSubtitleInView ? 'visible' : 'hidden'}
                                    options={{
                                        strings: ['Discover, plan, and book premium makeup and styling events with world-renowned artists and educators.'],
                                        autoStart: isSubtitleInView,
                                        loop: false,
                                        delay: 40,
                                        cursor: '_',
                                        wrapperClassName: "typewriter-text"
                                    }}
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="d-flex flex-column flex-sm-row gap-4 justify-content-center justify-content-lg-start"
                            >
                                <button className="btn btn-pink" onClick={() => navigate('/events')}>Host Events</button>
                                <button className="btn btn-outline-pink" onClick={() => navigate('/events')}>Explore Events</button>
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
                        <Link to="/events" className="btn btn-outline-pink btn-sm fw-bold p-0">
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

            {/* ═══════════ HISTORY IN MOTION: 3D BOOK FLIP SHOWCASE ═══════════ */}
            <section className="history-book-section py-5">
                <div className="container text-center mb-5">
                    <span className="section-tag-premium">History in Motion</span>
                    <h2 className="section-title-premium mt-2">Previous Events Highlights</h2>
                </div>

                <div className="book-container">
                    <BookFlipShowcase events={PREVIOUS_EVENTS.slice(0, 5)} />
                </div>
            </section>

            {/* ═══════════ SECTION 2: THE DIFFERENCE ═══════════ */}
            <section className="difference-section">
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
                        <button className="btn btn-pink" onClick={() => navigate('/register')}>Join GrowthUtsav Now</button>
                    </motion.div>
                </Container>
            </section>

        </div>
    );
};

export default Home;

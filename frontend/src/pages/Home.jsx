import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import {
    FaSearch, FaCalendarAlt, FaArrowRight, FaMapMarkerAlt,
    FaGlobe, FaGem, FaFire, FaUsers, FaMusic, FaShieldAlt, FaRocket, FaAward, FaMagic,
    FaExclamationTriangle
} from 'react-icons/fa';
import * as eventApi from '../api/eventApi';
import EventCard from '../components/events/EventCard';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import './Home.css';

const CATEGORIES = [
    { name: 'Seminar', icon: <FaCalendarAlt size={28} />, color: '#9185acff' },
    { name: 'Makeup Event', icon: <FaMagic size={28} />, color: '#ec4899' },
    { name: 'Carnival', icon: <FaFire size={28} />, color: '#f59e0b' },
    { name: 'Beauty Expo', icon: <FaAward size={28} />, color: '#06b6d4' },
    { name: 'Exhibition', icon: <FaGlobe size={28} />, color: '#10b981' },
    { name: 'All Events', icon: <FaArrowRight size={28} />, color: '#7c3aed', path: '/events' },
];

const SUCCESSFUL_EVENTS = [
    { id: 1, name: 'Global Tech Summit 2024', desc: 'A massive gathering of tech innovators and global thought leaders.', loc: 'Mumbai, India', date: 'Oct 20, 2024', img: 'https://images.unsplash.com/photo-1540575861501-7ad0582371f3?auto=format&fit=crop&q=80&w=800' },
    { id: 2, name: 'MUA Masterclass Elite', desc: 'Elite makeup artistry workshop with top industry professionals.', loc: 'Delhi, India', date: 'Dec 15, 2024', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800' },
    { id: 3, name: 'Neon Carnival Music Fest', desc: 'The most vibrant and high-energy music festival of the season.', loc: 'Bangalore, India', date: 'Jan 05, 2025', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800' },
];

const Home = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch approved events
                const res = await eventApi.getEvents();
                if (res?.data?.success) {
                    setEvents(res.data.data || []);
                } else {
                    throw new Error('Protocol synchronization failure');
                }
            } catch (err) {
                console.error('[EVENT_SYNC_ERROR]:', err);
                setError('Unable to load events at this moment. Please check back later.');
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleCategoryClick = (catName) => {
        if (catName === 'All Events') {
            navigate('/events');
        } else {
            navigate(`/events?category=${encodeURIComponent(catName)}`);
        }
    };

    // Derived event groupings for Zomato-like sections
    const featuredEvents = Array.isArray(events) ? events.slice(0, 3) : [];
    const trendingEvents = Array.isArray(events) 
        ? (events.length > 3 ? events.slice(3, 9) : events.slice(0, 6))
        : [];

    return (
        <div className="layout-system-container pb-5">

            {/* ═══════════ HERO SECTION ═══════════ */}
            <section className="position-relative d-flex align-items-center justify-content-center always-dark hero-section-main">
                {/* Immersive Background Layer */}
                <div className="position-absolute top-0 start-0 w-100 h-100 hero-bg-layer" />

                {/* Multi-stage Overlay for Depth */}
                <div className="position-absolute top-0 start-0 w-100 h-100 hero-radial-overlay" />
                <div className="position-absolute top-0 start-0 w-100 h-100 hero-linear-overlay" />

                <Container fluid className="position-relative text-center px-3 px-md-5 hero-content-container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="d-flex flex-column align-items-center justify-content-center w-100 mx-auto py-5 hero-content-wrapper"
                    >
                        {/* Desktop Only Badge */}
                        <motion.div
                            className="badge bg-primary-glow text-primary-light px-4 py-2 rounded-pill mb-4 border border-primary/20 tracking-widest uppercase small fw-black d-none d-md-inline-block hero-badge-item"
                        >
                            NEXT-GEN EVENT PROTOCOL
                        </motion.div>

                        <h1 className="hero-headline text-white mb-3 mb-md-4 px-2 hero-headline-static">
                            Experience Events <br className="d-none d-md-block" /> <span className="gradient-text">Redefined</span>
                        </h1>

                        <p className="text-white mb-4 mb-md-5 mx-auto px-2 hero-subtitle-static">
                            The premier digital ecosystem for high-fidelity event infrastructure. 
                            From elite summits to legendary workshops — synchronize with the future of gatherings.
                        </p>

                        <div className="d-flex flex-column flex-md-row justify-content-center gap-3 w-100 px-4 px-md-0">
                            <Button
                                as={Link}
                                to={user ? (user?.role === 'admin' ? '/admin/dashboard' : '/organizer/dashboard') : '/login?role=organizer'}
                                className="btn-primary shadow-glow-hover fs-6 px-lg-5 py-3 rounded-4"
                            >
                                <FaCalendarAlt className="me-2" /> Host Protocol
                            </Button>

                            <Button
                                as={Link}
                                to="/events"
                                variant="outline-light"
                                className="btn-outline-primary shadow-glow-hover fs-6 px-lg-5 py-3 rounded-4"
                            >
                                <FaSearch className="me-2" /> Explore Sector
                            </Button>
                        </div>
                        
                        {/* Debug Marker (Invisible but searchable in DOM) */}
                        <div style={{ display: 'none' }} id="gu_start_marker">RESONANCE_ACTIVE</div>
                    </motion.div>
                </Container>
            </section>


            {/* ═══════════ FEATURED EVENTS (BANNER-STYLE) ═══════════ */}
            <section className="py-5 mt-4">
                <Container fluid className="px-md-5">
                    <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
                        <div>
                            <h3 className="fw-bold mb-1 text-bright headline-clamp-sm">Featured Collections</h3>
                            <p className="text-soft mb-0">Handpicked premium experiences.</p>
                        </div>
                        <Link to="/events" className="btn btn-link text-decoration-none fw-semibold p-0">
                            View All <FaArrowRight size={12} className="ms-1" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="glass-panel p-5 text-center rounded-4 border-danger/20">
                            <FaExclamationTriangle className="text-danger mb-3 opacity-50" size={40} />
                            <p className="text-danger fw-bold uppercase tracking-widest small">{error}</p>
                            <Button variant="link" onClick={() => window.location.reload()} className="text-primary-light small text-decoration-none mt-2">
                                RETRY SYNC
                            </Button>
                        </div>
                    ) : featuredEvents.length > 0 ? (
                        <Row className="g-4">
                            {featuredEvents.map((event, i) => (
                                <Col lg={4} md={6} key={event?._id || i}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="h-100"
                                    >
                                        <EventCard event={event} />
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <div className="glass-panel p-5 text-center rounded-4">
                            <p className="text-soft mb-0">No featured events available right now.</p>
                        </div>
                    )}
                </Container>
            </section>

            {/* ═══════════ CATEGORIES SECTION (APP STYLE) ═══════════ */}
            <section className="py-5 mt-4 border-top border-white/5 bg-white/2">
                <Container fluid className="px-md-5">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="mb-5"
                    >
                        <h2 className="fw-black text-bright m-0 uppercase tracking-tighter headline-clamp-lg">
                            Discovery <span className="text-primary-light">Board</span>
                        </h2>
                        <p className="text-soft fw-medium">Curated access to the city's highest-rated collections.</p>
                    </motion.div>

                    <Row className="g-3 g-md-4">
                        {CATEGORIES.map((cat, idx) => (
                            <Col xs={6} md={4} lg={2} key={cat.name}>
                                <motion.div
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className="glass-card p-3 p-md-4 text-center cursor-pointer h-100 d-flex flex-column align-items-center justify-content-center border-0 shadow-sm"
                                >
                                    <div className="mb-2 mb-md-3 d-flex align-items-center justify-content-center rounded-circle category-icon-circle">
                                        {cat.icon}
                                    </div>
                                    <span className="fw-bold text-white small tracking-wider category-text-sm">{cat.name}</span>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                </Container>
            </section>

            {/* ═══════════ TRENDING EVENTS (GRID SECION) ═══════════ */}
            <section className="py-5 mb-4">
                <Container fluid className="px-md-5">
                    <div className="mb-5">
                        <h2 className="fw-black text-bright m-0 d-flex align-items-center gap-2 gap-md-3 flex-wrap headline-clamp-resp">
                            <FaFire className="text-secondary flex-shrink-0" /> Hot <span className="text-secondary">Picks</span>
                        </h2>
                        <p className="text-soft fw-medium">Live events gaining massive momentum right now.</p>
                    </div>

                    {loading ? null : trendingEvents.length > 0 ? (
                        <Row className="g-4">
                            {trendingEvents.map((event, i) => (
                                <Col lg={3} md={4} sm={6} key={event?._id || i}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        className="h-100"
                                    >
                                        <EventCard event={event} />
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <div className="text-center text-soft py-4">Scanning for trending momentum...</div>
                    )}
                </Container>
            </section>

            {/* ═══════════ OUR SUCCESSFUL EVENTS ═══════════ */}
            <section className="py-5 mb-5 overflow-hidden">
                <Container fluid className="px-md-5">
                    <div className="text-center mb-5 mt-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="fw-black text-bright uppercase tracking-tighter headline-clamp-xl"
                        >
                            Our <span className="text-primary-light">Successful Events</span>
                        </motion.h2>
                        <div className="mx-auto success-event-divider"></div>
                    </div>

                    <div className="horizontal-scroll-container pb-4">
                        <Row className="flex-nowrap g-3 g-md-4 overflow-x-auto pb-3 custom-scrollbar row-scroll-mandatory">
                            {SUCCESSFUL_EVENTS.map((event, idx) => (
                                <Col lg={4} md={6} sm={10} xs={11} key={event.id} className="scroll-align-start">
                                    <motion.div
                                        className="successful-event-card position-relative overflow-hidden rounded-4 glass-card h-100 shadow-glow-hover successful-event-card-motion"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ y: -10 }}
                                    >
                                        <div className="event-img-wrapper overflow-hidden successful-event-img-box">
                                            <motion.img
                                                src={event.img}
                                                alt={event.name}
                                                className="w-100 h-100 object-fit-cover"
                                                whileHover={{ scale: 1.15 }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                            />
                                            <div className="position-absolute top-0 end-0 p-3">
                                                <Badge bg="primary" className="rounded-pill uppercase small px-3 py-2 bg-primary shadow-lg border-0">
                                                    Completed
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className="text-primary-light small fw-bold tracking-widest uppercase"><FaCalendarAlt className="me-1" /> {event.date}</span>
                                            </div>
                                            <h4 className="text-bright fw-bold mb-2 h5">{event.name}</h4>
                                            <p className="text-soft small mb-3 opacity-75">{event.desc}</p>
                                            <div className="d-flex align-items-center text-soft small mt-auto">
                                                <FaMapMarkerAlt className="text-primary-light me-2 opacity-75" />
                                                <span className="fw-medium">{event.loc}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Container>
            </section>

            {/* ═══════════ PROFESSIONAL TRUST SECTION ═══════════ */}
            <section className="py-5 border-top border-white/5 bg-white/2">
                <Container fluid className="px-md-5">
                    <Row className="g-4">
                        {[
                            { icon: <FaShieldAlt />, title: 'Verified Hosts', desc: 'Every organizer is strictly vetted for global platform security.' },
                            { icon: <FaRocket />, title: 'Instant Access', desc: 'Secure high-fidelity tickets in under 60 seconds with QR technology.' },
                            { icon: <FaAward />, title: 'Elite Perks', desc: 'Access exclusive VIP levels and early-bird protocol benefits.' }
                        ].map((item, idx) => (
                            <Col md={4} key={idx}>
                                <div className="d-flex gap-4 p-4 glass-card h-100">
                                    <div className="text-primary-light h2 m-0 p-3 bg-primary-subtle rounded-4 d-flex align-items-center justify-content-center trust-icon-box">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h5 className="fw-black text-bright uppercase tracking-widest small mb-2">{item.title}</h5>
                                        <p className="text-soft small mb-0 fw-medium">{item.desc}</p>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ═══════════ ABOUT GROWTHUTSAV ═══════════ */}
            <section className="py-5 border-top border-white/5">
                <Container fluid className="px-md-5 mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mx-auto about-text-wrapper"
                        style={{ maxWidth: '800px' }}
                    >
                        <h2 className="fw-black text-bright uppercase tracking-tighter mb-4 headline-clamp-lg">
                            About <span className="text-primary-light">GrowthUtsav</span>
                        </h2>
                        <div className="mx-auto mb-4 about-divider-line"></div>
                        <p className="text-soft fs-5 about-description-text">
                            GrowthUtsav is the ultimate platform uniting passionate organizers with eager attendees.
                            From expansive global summits to intimate local workshops, we provide the elite digital infrastructure
                            required to seamlessly discover, book, and manage unforgettable high-fidelity event experiences.
                        </p>
                    </motion.div>
                </Container>
            </section>
        </div>
    );
};

const SafeHome = () => (
    <ErrorBoundary>
        <Home />
    </ErrorBoundary>
);

export default SafeHome;

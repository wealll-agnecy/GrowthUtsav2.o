import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as eventApi from '../api/eventApi';
import EventCard from '../components/events/EventCard';
import { Container, Row, Col, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes, FaRocket, FaChevronRight, FaCompass } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './EventListing.css';

const CATEGORIES = ['Seminar', 'Makeup Event', 'Carnival', 'Beauty Expo', 'Exhibition'];

const EventListing = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const category = searchParams.get('category') || '';

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const params = {};
                if (category) params.category = category;
                const queryStr = new URLSearchParams(params).toString();
                const res = await eventApi.getEvents(queryStr);
                setEvents(res.data.data);
            } catch (err) {
                setError('Failed to fetch events');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [category]);



    const handleCategoryClick = (cat) => {
        const newCat = cat === category ? '' : cat;
        setSearchParams({ category: newCat });
    };

    const clearFilters = () => setSearchParams({});
    const hasFilters = !!category;

    return (
        <div className="page-wrapper pb-5">
            <Container fluid className="px-md-5">
                {/* ─── Page Header ─── */}
                <div className="mb-5 pt-2">
                    <Row className="align-items-end gy-4">
                        <Col lg={12}>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small">
                                    <FaCompass className="me-2" /> Global Event Directory
                                </Badge>
                                <h1
                                    className="fw-black m-0 tracking-tighter listing-headline"
                                >
                                    Explore <span className="gradient-text">Events</span>
                                </h1>
                                <p className="text-soft mt-3 mb-0 fw-medium opacity-70">
                                    Browse verified high-fidelity events in your area across the master node infrastructure.
                                </p>
                            </motion.div>
                        </Col>

                    </Row>
                </div>


                <Row className="g-4">
                    {/* ─── Sidebar Filters ─── */}
                    <Col lg={3} className="mb-4">
                        <div className="sidebar-filter glass-card p-3 p-md-4 border-white/5 shadow-2xl">

                            <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
                                <h6
                                    className="m-0 fw-black text-bright uppercase tracking-widest small d-flex align-items-center gap-2"
                                >
                                    <FaFilter className="text-primary-light" /> Filters
                                </h6>
                                {hasFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="btn btn-outline-pink btn-sm p-0 text-danger tracking-tighter text-decoration-none rounded-pill fw-medium px-4 py-2"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            <div className="d-flex flex-row flex-lg-column gap-2 overflow-auto custom-scrollbar horizontal-scroll-container pb-2 pb-lg-0 listing-filter-container">
                                {CATEGORIES.map((cat) => (
                                    <motion.div
                                        key={cat}
                                        whileHover={{ x: 5 }}
                                        className={`filter-item rounded-4 px-3 py-2 py-md-3 border border-white/5 transition-all cursor-pointer d-flex align-items-center justify-content-between flex-shrink-0 flex-md-shrink-1 ${category === cat ? 'bg-primary border-transparent shadow-xl' : 'bg-white/2'
                                            }`}
                                        onClick={() => handleCategoryClick(cat)}
                                    >
                                        <span className={`text-uppercase fw-black small tracking-widest ${category === cat ? 'text-white' : 'text-soft'}`}>
                                            {cat}
                                        </span>
                                        <span className="d-none d-lg-block">
                                            {category === cat
                                                ? <FaTimes />
                                                : <FaChevronRight className="opacity-20" size={12} />
                                            }
                                        </span>
                                    </motion.div>
                                ))}
                            </div>


                        </div>
                    </Col>

                    {/* ─── Events Grid ─── */}
                    <Col lg={9}>
                        {/* Active filters + count */}
                        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                            <span className="event-count-text">
                                {events.length} event{events.length !== 1 ? 's' : ''} found
                            </span>
                            <div className="d-flex gap-2 flex-wrap">
                                {category && (
                                    <Badge
                                        className="d-flex align-items-center gap-2 px-3 py-2 filter-badge-item"
                                        onClick={() => handleCategoryClick(category)}
                                    >
                                        {category} <FaTimes size={10} />
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="loading-spinner-icon">
                                    <FaCompass size={40} />
                                </div>
                                <p className="loading-text-static">Loading events...</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                {events.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="glass-panel rounded-4 text-center py-5"
                                    >
                                        <div className="empty-state-icon-large">🔭</div>
                                        <h4 className="fw-bold mb-2 text-bright">No Events Found</h4>
                                        <p className="text-soft mb-4">
                                            Try adjusting your filters or search terms.
                                        </p>
                                        <Button
                                            onClick={clearFilters}
                                            className="btn btn-pink px-4 rounded-pill fw-medium py-2"
                                        >
                                            Clear Filters
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="events-container"
                                    >

                                        {events.map((event, i) => (
                                            <motion.div
                                                key={event._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.06 }}
                                            >
                                                <EventCard event={event} />
                                            </motion.div>
                                        ))}

                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EventListing;

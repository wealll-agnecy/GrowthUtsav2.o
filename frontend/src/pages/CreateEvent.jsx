import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as eventApi from '../api/eventApi';
import { Card, Form, Button, Alert, Container, Row, Col, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { FaTrash, FaPlus, FaRocket, FaInfoCircle, FaTicketAlt, FaImage, FaCalendarAlt, FaMapMarkerAlt, FaSave, FaPaperPlane, FaArrowLeft, FaSatellite, FaBolt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CreateEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        venue: '',
        date: '',
        time: '',
        category: 'Technology',
        bannerImage: '',
        ticketTypes: [{ name: 'General Admission', price: 0, quantity: 100 }],
        status: 'draft'
    });

    useEffect(() => {
        if (id) {
            const fetchEvent = async () => {
                try {
                    const res = await eventApi.getEvent(id);
                    const event = res.data.data;
                    const formattedDate = new Date(event.date).toISOString().split('T')[0];
                    setFormData({ ...event, date: formattedDate });
                } catch (err) {
                    setError('Failed to fetch node configuration');
                }
            };
            fetchEvent();
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleTicketChange = (index, e) => {
        const newTicketTypes = [...formData.ticketTypes];
        newTicketTypes[index][e.target.name] = e.target.value;
        setFormData({ ...formData, ticketTypes: newTicketTypes });
    };

    const addTicketType = () => {
        setFormData({
            ...formData,
            ticketTypes: [...formData.ticketTypes, { name: '', price: 0, quantity: 10 }]
        });
    };

    const removeTicketType = (index) => {
        const newTicketTypes = formData.ticketTypes.filter((_, i) => i !== index);
        setFormData({ ...formData, ticketTypes: newTicketTypes });
    };

    const handleSubmit = async (e, finalStatus = 'pending') => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const submissionData = { ...formData, status: finalStatus };
            if (id) {
                await eventApi.updateEvent(id, submissionData);
            } else {
                await eventApi.createEvent(submissionData);
            }
            navigate('/organizer/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error synchronizing event node');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-content pb-5 position-relative">
            {/* Added Dark Overlay as requested */}
            <div className="create-event-overlay"></div>
            <Container fluid className="p-0 position-relative" style={{ zIndex: 1 }}>
                <Row className="justify-content-center">
                    <Col lg={10} xl={9}>
                        <motion.div
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                            className="mb-5 d-flex justify-content-between align-items-end"
                        >
                            <div>
                                <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                                    <FaSatellite className="me-2" /> Event Creator
                                </Badge>
                                <h1 className="fw-black m-0 tracking-tighter text-white" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1 }}>
                                    {id ? 'Edit' : 'Create'} <span className="gradient-text">Event</span>
                                </h1>
                            </div>
                        </motion.div>

                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                <Alert variant="danger" className="glass-panel text-danger border-danger/20 rounded-5 mb-5 p-5 shadow-2xl d-flex align-items-center gap-4">
                                    <FaInfoCircle size={30} className="opacity-50" />
                                    <div className="fw-black text-uppercase tracking-widest">{error}</div>
                                </Alert>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="create-event-card">
                                <Card.Body className="p-0">
                                    <Form>
                                        <div className="mb-5 pb-5 border-bottom border-gray-200">
                                            <h3 className="fw-black mb-4 d-flex align-items-center gap-3">
                                                <span className="form-section-icon p-2 rounded-circle d-inline-flex"><FaInfoCircle size={24} /></span>
                                                Basic Information
                                            </h3>

                                            <Form.Group className="mb-4" controlId="title">
                                                <Form.Label className="form-label-clean">Event Title</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    className="form-control-modern"
                                                    placeholder="Growth Utsav: The Quantum Expansion..."
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-4" controlId="description">
                                                <Form.Label className="form-label-clean">Event Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={5}
                                                    className="form-control-modern"
                                                    style={{ height: 'auto' }}
                                                    placeholder="Provide a detailed description of your event..."
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>

                                            <Row className="g-4">
                                                <Col md={6}>
                                                    <Form.Group controlId="category">
                                                        <Form.Label className="form-label-clean">Event Category</Form.Label>
                                                        <Form.Select
                                                            className="form-control-modern form-select"
                                                            value={formData.category}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="Seminar">Seminar</option>
                                                            <option value="Makeup Event">Makeup Event</option>
                                                            <option value="Carnival">Carnival</option>
                                                            <option value="Beauty Expo">Beauty Expo</option>
                                                            <option value="Exhibition">Exhibition</option>
                                                            <option value="Other">Other</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group controlId="venue">
                                                        <Form.Label className="form-label-clean d-flex justify-content-between">
                                                            Venue / Location <FaMapMarkerAlt className="text-muted" />
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            className="form-control-modern"
                                                            placeholder="Enter event venue..."
                                                            value={formData.venue}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group controlId="date">
                                                        <Form.Label className="form-label-clean d-flex justify-content-between">
                                                            Event Date <FaCalendarAlt className="text-muted" />
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            className="form-control-modern"
                                                            value={formData.date}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group controlId="time">
                                                        <Form.Label className="form-label-clean">Start Time</Form.Label>
                                                        <Form.Control
                                                            type="time"
                                                            className="form-control-modern"
                                                            value={formData.time}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="mb-5 pb-5 border-bottom border-gray-200">
                                            <h3 className="fw-black mb-4 d-flex align-items-center gap-3">
                                                <span className="form-section-icon p-2 rounded-circle d-inline-flex"><FaImage size={24} /></span>
                                                Event Banner
                                            </h3>
                                            <Form.Group controlId="bannerImage">
                                                <Form.Label className="form-label-clean">Banner Image URL</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    className="form-control-modern"
                                                    placeholder="https://images.unsplash.com/photo-..."
                                                    value={formData.bannerImage}
                                                    onChange={handleChange}
                                                />
                                                <Form.Text className="text-muted mt-2 d-block small fw-medium">
                                                    Recommended: High-quality 1920x1080 images.
                                                </Form.Text>
                                            </Form.Group>
                                        </div>

                                        <div className="mb-5">
                                            <h3 className="fw-black mb-4 d-flex align-items-center gap-3">
                                                <span className="form-section-icon p-2 rounded-circle d-inline-flex"><FaTicketAlt size={24} /></span>
                                                Ticket Tiers
                                            </h3>

                                            <AnimatePresence>
                                                {formData.ticketTypes.map((ticket, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        className="ticket-tier-box mb-4 position-relative"
                                                    >
                                                        <Row className="g-4 align-items-end">
                                                            <Col md={5}>
                                                                <Form.Group controlId={`ticket-name-${index}`}>
                                                                    <Form.Label className="form-label-clean">Ticket Name</Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        name="name"
                                                                        className="form-control-modern"
                                                                        placeholder="TITAN, ELITE, VIP..."
                                                                        value={ticket.name}
                                                                        onChange={(e) => handleTicketChange(index, e)}
                                                                        required
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={3}>
                                                                <Form.Group controlId={`ticket-price-${index}`}>
                                                                    <Form.Label className="form-label-clean">Price (₹)</Form.Label>
                                                                    <Form.Control
                                                                        type="number"
                                                                        name="price"
                                                                        className="form-control-modern"
                                                                        value={ticket.price}
                                                                        onChange={(e) => handleTicketChange(index, e)}
                                                                        required
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={3}>
                                                                <Form.Group controlId={`ticket-qty-${index}`}>
                                                                    <Form.Label className="form-label-clean">Quantity</Form.Label>
                                                                    <Form.Control
                                                                        type="number"
                                                                        name="quantity"
                                                                        className="form-control-modern"
                                                                        value={ticket.quantity}
                                                                        onChange={(e) => handleTicketChange(index, e)}
                                                                        required
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={1} className="text-md-end text-center mt-3 mt-md-0">
                                                                <Button
                                                                    variant="outline-danger"
                                                                    className="border-0 shadow-none"
                                                                    onClick={() => removeTicketType(index)}
                                                                    disabled={formData.ticketTypes.length === 1}
                                                                    type="button"
                                                                >
                                                                    <FaTrash size={18} />
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>

                                            <Button variant="outline-primary" onClick={addTicketType} className="create-event-btn fw-bold d-inline-flex align-items-center gap-2 mt-2 px-4 shadow-sm" style={{ background: '#fbcfe8', borderColor: '#fbcfe8', color: '#db2777' }}>
                                                <FaPlus /> Add Additional Tier
                                            </Button>
                                        </div>

                                        {/* Deployment Actions */}
                                        <div className="pt-4 mt-4 border-top border-white/10 create-event-btn-group d-flex gap-3 justify-content-end">
                                            <Button
                                                variant="transparent"
                                                className="create-event-btn px-4 bg-white/5 border-white/10 text-white hover-glow-primary"
                                                disabled={loading}
                                                onClick={(e) => handleSubmit(e, 'draft')}
                                            >
                                                <FaSave className="me-2" /> Save to Drafts
                                            </Button>
                                            <Button
                                                variant="primary"
                                                className="create-event-btn px-5 shadow-sm"
                                                disabled={loading}
                                                onClick={(e) => handleSubmit(e, 'pending')}
                                            >
                                                {loading ? <Spinner size="sm" className="me-2" /> : <FaPaperPlane className="me-2" />}
                                                Create Event
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>

                            </Card>
                        </motion.div>

                        <div className="mt-5 p-5 glass-panel rounded-5 border-white/5 shadow-2xl d-flex align-items-center gap-5 border-primary/20 backdrop-blur-xl">
                            <div className="bg-primary rounded-circle p-4 shadow-lg flex-shrink-0 animate-pulse"><FaSatellite size={30} className="text-white" /></div>
                            <div>
                                <h5 className="fw-black text-white mb-2 tracking-widest text-uppercase">Submission Notice</h5>
                                <p className="text-white-50 mb-0 fs-5 fw-medium opacity-80">All created events are subject to review by the administrative team. Using high-quality images significantly increases conversion rates.</p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CreateEvent;

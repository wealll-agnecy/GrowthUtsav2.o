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
        status: 'draft',
        isMultiDay: false,
        multiDayPlan: [
            {
                date: '',
                plans: [
                    { name: 'Silver', price: 0, quantity: 100 },
                    { name: 'Gold', price: 0, quantity: 100 },
                    { name: 'Platinum', price: 0, quantity: 100 }
                ]
            }
        ]
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

    // Multi-Day Logic
    const addEventDay = () => {
        setFormData({
            ...formData,
            multiDayPlan: [
                ...formData.multiDayPlan,
                {
                    date: '',
                    plans: [
                        { name: 'Silver', price: 0, quantity: 100 },
                        { name: 'Gold', price: 0, quantity: 100 },
                        { name: 'Platinum', price: 0, quantity: 100 }
                    ]
                }
            ]
        });
    };

    const removeEventDay = (dayIndex) => {
        const newDays = formData.multiDayPlan.filter((_, i) => i !== dayIndex);
        setFormData({ ...formData, multiDayPlan: newDays });
    };

    const handleDayDateChange = (dayIndex, value) => {
        const newDays = [...formData.multiDayPlan];
        newDays[dayIndex].date = value;
        setFormData({ ...formData, multiDayPlan: newDays });
    };

    const handleDayPlanChange = (dayIndex, planIndex, field, value) => {
        const newDays = [...formData.multiDayPlan];
        newDays[dayIndex].plans[planIndex][field] = value;
        setFormData({ ...formData, multiDayPlan: newDays });
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
        <div className="dashboard-page overflow-hidden">
            <Container fluid className="px-md-5">
                <Row className="justify-content-center">
                    <Col lg={11} xl={10}>
                        <div className="dashboard-header d-flex justify-content-between align-items-end">
                            <motion.div
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                                className="mb-5 d-flex justify-content-between align-items-end w-100"
                            >
                                <div>
                                    <span className="status-badge badge-pink mb-3">EVENT CREATOR UNIT</span>
                                    <h1 className="dashboard-title-main" style={{ fontSize: '3rem' }}>
                                        {id ? 'Edit' : 'Create'} <span className="text-pink">Event</span>
                                    </h1>
                                </div>
                            </motion.div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Alert variant="danger" className="border-danger/20 rounded-4 mb-5 p-4 text-center fw-bold">
                                    <FaInfoCircle size={20} className="me-2" /> {error}
                                </Alert>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="dashboard-card shadow-sm p-0">
                                <div className="p-0">
                                    <Form className="p-2 p-md-4">
                                        <div className="mb-5 pb-4 border-bottom border-slate-100">
                                            <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-3">
                                                <FaInfoCircle className="text-pink" />
                                                Basic Information
                                            </h4>

                                            <Form.Group className="mb-4" controlId="title">
                                                <Form.Label className="card-title-sm">Event Title</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    className="rounded-4 border-slate-200 p-3"
                                                    placeholder="Growth Utsav: Premium Makeup Seminar..."
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-4" controlId="description">
                                                <Form.Label className="card-title-sm">Event Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={5}
                                                    className="rounded-4 border-slate-200 p-3"
                                                    style={{ height: 'auto' }}
                                                    placeholder="Provide a detailed description of your event..."
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>

                                            <Row className="g-4 text-dark">
                                                <Col md={6}>
                                                    <Form.Group controlId="category">
                                                        <Form.Label className="card-title-sm">Event Category</Form.Label>
                                                        <Form.Select
                                                            className="rounded-4 border-slate-200 p-3"
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
                                                        <Form.Label className="card-title-sm d-flex justify-content-between">
                                                            Venue / Location <FaMapMarkerAlt className="opacity-30" />
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            className="rounded-4 border-slate-200 p-3"
                                                            placeholder="Enter event venue..."
                                                            value={formData.venue}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group controlId="date">
                                                        <Form.Label className="card-title-sm d-flex justify-content-between">
                                                            Event Date <FaCalendarAlt className="opacity-30" />
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            className="rounded-4 border-slate-200 p-3"
                                                            value={formData.date}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group controlId="time">
                                                        <Form.Label className="card-title-sm">Start Time</Form.Label>
                                                        <Form.Control
                                                            type="time"
                                                            className="rounded-4 border-slate-200 p-3"
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

                                        <div className="mb-5 pb-5 border-bottom border-gray-200">
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <h3 className="fw-black m-0 d-flex align-items-center gap-3">
                                                    <span className="form-section-icon p-2 rounded-circle d-inline-flex"><FaBolt size={24} /></span>
                                                    Pricing Strategy
                                                </h3>
                                                <Form.Check 
                                                    type="switch"
                                                    id="isMultiDay-switch"
                                                    label={formData.isMultiDay ? "Multi-Day Mode Activated" : "Single Day Mode"}
                                                    className="fw-bold custom-switch-premium"
                                                    checked={formData.isMultiDay}
                                                    onChange={(e) => setFormData({ ...formData, isMultiDay: e.target.checked })}
                                                />
                                            </div>

                                            {!formData.isMultiDay ? (
                                                <div className="ticket-tiers-section">
                                                    <h5 className="text-muted fw-bold mb-4 uppercase tracking-widest small">Standard Ticket Tiers</h5>
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
                                                                        <Form.Group>
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
                                                                        <Form.Group>
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
                                                                        <Form.Group>
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
                                                                            className="btn btn-outline-pink shadow-none rounded-pill fw-medium px-4 py-2"
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
                                                    <Button onClick={addTicketType} className="btn btn-outline-pink d-inline-flex align-items-center gap-2 mt-2 px-4 shadow-sm rounded-pill fw-medium py-2">
                                                        <FaPlus /> Add Additional Tier
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="multi-day-section">
                                                    <h5 className="text-muted fw-bold mb-4 uppercase tracking-widest small">Event Schedule & Per-Day Plans</h5>
                                                    
                                                    {formData.multiDayPlan.map((day, dayIdx) => (
                                                        <div key={dayIdx} className="multi-day-card mb-5 p-4 border rounded-5 bg-white/5 backdrop-blur-sm position-relative overflow-hidden">
                                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <div className="day-index-circle">Day {dayIdx + 1}</div>
                                                                    <Form.Control 
                                                                        type="date" 
                                                                        className="form-control-modern border-0 bg-light w-auto fw-bold"
                                                                        value={day.date}
                                                                        onChange={(e) => handleDayDateChange(dayIdx, e.target.value)}
                                                                        required
                                                                    />
                                                                </div>
                                                                <Button className="btn btn-pink rounded-pill px-3 py-2" onClick={() => removeEventDay(dayIdx)} disabled={formData.multiDayPlan.length === 1}>
                                                                    <FaTrash className="me-2" /> Remove Day
                                                                </Button>
                                                            </div>

                                                            <Row className="g-3">
                                                                {day.plans.map((plan, planIdx) => (
                                                                    <Col md={4} key={planIdx}>
                                                                        <div className={`plan-tier-input-box p-3 rounded-4 ${plan.name.toLowerCase()}-tier-border`}>
                                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                                <Badge className={`badge-tier-${plan.name.toLowerCase()} px-3 py-2 rounded-pill`}>{plan.name}</Badge>
                                                                                <div className="small fw-bold opacity-50">₹{plan.price}</div>
                                                                            </div>
                                                                            <Form.Group className="mb-2">
                                                                                <Form.Label className="small fw-bold text-muted uppercase">Set Price</Form.Label>
                                                                                <Form.Control 
                                                                                    type="number" 
                                                                                    className="form-control-modern bg-white shadow-sm" 
                                                                                    value={plan.price}
                                                                                    onChange={(e) => handleDayPlanChange(dayIdx, planIdx, 'price', e.target.value)}
                                                                                    required
                                                                                />
                                                                            </Form.Group>
                                                                            <Form.Group>
                                                                                <Form.Label className="small fw-bold text-muted uppercase">Inventory</Form.Label>
                                                                                <Form.Control 
                                                                                    type="number" 
                                                                                    className="form-control-modern bg-white shadow-sm" 
                                                                                    value={plan.quantity}
                                                                                    onChange={(e) => handleDayPlanChange(dayIdx, planIdx, 'quantity', e.target.value)}
                                                                                    required
                                                                                />
                                                                            </Form.Group>
                                                                        </div>
                                                                    </Col>
                                                                ))}
                                                            </Row>
                                                        </div>
                                                    ))}

                                                    <Button onClick={addEventDay} className="btn btn-outline-pink w-100 py-3 rounded-5 border-dashed d-flex align-items-center justify-content-center gap-3">
                                                        <FaPlus /> Add New Event Node (Day)
                                                    </Button>
                                                </div>
                                            )}
                                        </div>


                                        {/* Deployment Actions */}
                                        <div className="pt-4 mt-5 border-top border-slate-100 d-flex gap-3 justify-content-end align-items-center">
                                            <span className="text-slate small fw-bold me-auto">
                                                <FaBolt className="text-pink me-2" /> Node Ready for Synchronization
                                            </span>
                                            <Button
                                                variant="link"
                                                className="text-slate text-decoration-none fw-bold"
                                                disabled={loading}
                                                onClick={(e) => handleSubmit(e, 'draft')}
                                            >
                                                SAVE DRAFT
                                            </Button>
                                            <Button
                                                className="btn btn-pink px-5 py-3 fw-bold"
                                                disabled={loading}
                                                onClick={(e) => handleSubmit(e, 'pending')}
                                            >
                                                {loading ? <Spinner size="sm" className="me-2" /> : <FaPaperPlane className="me-2" />}
                                                {id ? 'UPDATE NODE' : 'DEPLOY EVENT'}
                                            </Button>
                                        </div>
                                    </Form>
                                </div>
                            </div>
                        </motion.div>

                        <div className="mt-5 p-4 dashboard-card border-slate-100 shadow-sm d-flex align-items-center gap-4 border-0">
                            <div className="bg-pink-subtle rounded-circle p-3 flex-shrink-0"><FaSatellite size={20} className="text-pink" /></div>
                            <div>
                                <h5 className="fw-bold text-dark mb-1">Deployment Notice</h5>
                                <p className="text-slate mb-0 small fw-medium">All deployments are subject to administrative synchronization. Professional assets ensure higher engagement.</p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CreateEvent;

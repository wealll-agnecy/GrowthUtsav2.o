import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as eventApi from '../api/eventApi';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaTrash, FaPlus, FaInfoCircle, FaPaperPlane, FaBolt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/CreateEvent.css';

const CreateEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        venue: '',
        date: '',
        time: '',
        category: 'Seminar',
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
        ],
        eventImage: null,
        eventImagePreview: ''
    });

    useEffect(() => {
        if (id) {
            const fetchEvent = async () => {
                try {
                    const res = await eventApi.getEvent(id);
                    const event = res.data.data;
                    const formattedDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                eventImage: file,
                eventImagePreview: URL.createObjectURL(file)
            });
            // Clear error if image is selected
            if (validationErrors.eventImage) {
                setValidationErrors(prev => ({ ...prev, eventImage: null }));
            }
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = "Please enter an event name so attendees know what this event is about.";
        if (!formData.description.trim()) errors.description = "Add a bit more detail so people understand your event better.";
        if (formData.description.trim().length < 50) errors.description = "A slightly longer description helps build trust with your attendees.";
        if (!formData.venue.trim()) errors.venue = "Enter a venue or location so people know where to show up.";
        
        if (!formData.isMultiDay) {
            if (!formData.date) errors.date = "Select a valid date for your event.";
            if (!formData.time) errors.time = "Set a start time so attendees can plan their arrival.";
            
            formData.ticketTypes.forEach((tier, index) => {
                if (!tier.name.trim()) errors[`ticketName_${index}`] = "Give this tier a name (e.g. VIP, Standard).";
                if (tier.price < 0) errors[`ticketPrice_${index}`] = "Enter a valid ticket price (numbers only).";
                if (tier.quantity < 1) errors[`ticketQty_${index}`] = "Specify at least 1 seat for this tier.";
            });
        } else {
            formData.multiDayPlan.forEach((day, dayIdx) => {
                if (!day.date) errors[`dayDate_${dayIdx}`] = `Select a date for Day ${dayIdx + 1}.`;
                day.plans.forEach((plan, planIdx) => {
                    if (plan.price < 0) errors[`dayPrice_${dayIdx}_${planIdx}`] = "Enter a valid price.";
                    if (plan.quantity < 1) errors[`dayQty_${dayIdx}_${planIdx}`] = "Seats must be at least 1.";
                });
            });
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e, finalStatus = 'pending') => {
        if (e) e.preventDefault();
        
        // Skip validation for draft if user wants, but required for pending
        if (finalStatus === 'pending' && !validateForm()) {
            // Scroll and focus the first error
            const firstErrorField = document.querySelector('.is-invalid');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => firstErrorField.focus(), 500);
            }
            return;
        }

        setLoading(true);
        setError(null);
        try {
            let submissionData;
            const finalData = { ...formData, status: finalStatus };

            // Logic to handle Multi-Day vs Single-Day data synchronization
            if (finalData.isMultiDay) {
                // If Multi-Day, use the first date of the plan for the main 'date' field (backend requirement)
                if (finalData.multiDayPlan && finalData.multiDayPlan.length > 0) {
                    finalData.date = finalData.multiDayPlan[0].date;
                }
                // Single-day ticketTypes are not needed for Multi-Day
                finalData.ticketTypes = []; 
            } else {
                // If Single-Day, clear Multi-Day plan to prevent data pollution
                finalData.multiDayPlan = [];
            }
            
            if (formData.eventImage) {
                submissionData = new FormData();
                Object.keys(finalData).forEach(key => {
                    if (key === 'ticketTypes' || key === 'multiDayPlan') {
                        submissionData.append(key, JSON.stringify(finalData[key]));
                    } else if (key !== 'eventImagePreview' && key !== 'eventImage') {
                        submissionData.append(key, finalData[key]);
                    }
                });
                // Append the actual file
                submissionData.append('eventImage', formData.eventImage);
            } else {
                submissionData = finalData;
            }

            if (id) {
                await eventApi.updateEvent(id, submissionData);
            } else {
                await eventApi.createEvent(submissionData);
            }
            navigate('/organizer/dashboard');
        } catch (err) {
            console.error("Submission Error:", err.response?.data);
            const backendError = err.response?.data?.message || 'Error synchronizing event node';
            setError(backendError);
            
            // If backend provides field-specific errors, map them
            if (err.response?.data?.errors) {
                setValidationErrors(prev => ({ ...prev, ...err.response.data.errors }));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-event-page">
            <motion.div 
                className="create-event-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>{id ? 'Edit' : 'Create'} <span className="text-pink">Event</span></h1>

                {error && (
                    <Alert variant="danger" className="rounded-3 py-2 px-3 small mb-4">
                        <FaInfoCircle className="me-2" /> {error}
                    </Alert>
                )}

                <Form onSubmit={(e) => handleSubmit(e, 'pending')}>
                    <div className="form-section-title">
                        <FaInfoCircle /> Basic Information
                    </div>

                    <Form.Group className="mb-3" controlId="title">
                        <Form.Label>Event Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. Premium Makeup Seminar"
                            value={formData.title}
                            onChange={handleChange}
                            isInvalid={!!validationErrors.title}
                        />
                        <Form.Control.Feedback type="invalid">{validationErrors.title}</Form.Control.Feedback>
                    </Form.Group>

                    <div className="form-row">
                        <Form.Group controlId="date">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.date}
                            />
                            <Form.Control.Feedback type="invalid">{validationErrors.date}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="time">
                            <Form.Label>Start Time</Form.Label>
                            <Form.Control
                                type="time"
                                value={formData.time}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.time}
                            />
                            <Form.Control.Feedback type="invalid">{validationErrors.time}</Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    <div className="form-row">
                        <Form.Group controlId="category">
                            <Form.Label>Category</Form.Label>
                            <Form.Select value={formData.category} onChange={handleChange}>
                                <option value="Seminar">Seminar</option>
                                <option value="Makeup Event">Makeup Event</option>
                                <option value="Carnival">Carnival</option>
                                <option value="Beauty Expo">Beauty Expo</option>
                                <option value="Exhibition">Exhibition</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="venue">
                            <Form.Label>Venue / Location</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter venue..."
                                value={formData.venue}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.venue}
                            />
                            <Form.Control.Feedback type="invalid">{validationErrors.venue}</Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    <Form.Group className="mb-3" controlId="bannerImage">
                        <Form.Label>Banner Image URL</Form.Label>
                        <Form.Control
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={formData.bannerImage}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="d-flex align-items-center gap-2">
                            Event Image <span className="text-muted small">(Camera/Gallery)</span>
                        </Form.Label>
                        <div className="custom-image-upload-wrapper">
                            <Form.Control
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageChange}
                                className="mb-2"
                            />
                            {formData.eventImagePreview && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-2 text-center"
                                >
                                    <img 
                                        src={formData.eventImagePreview} 
                                        alt="Preview" 
                                        className="img-fluid rounded-4 shadow-lg" 
                                        style={{ maxHeight: '150px', border: '2px solid var(--glass-border)' }}
                                    />
                                    <div className="mt-1 small text-pink fw-bold">Image Selected</div>
                                </motion.div>
                            )}
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder="Tell users what to expect..."
                            value={formData.description}
                            onChange={handleChange}
                            isInvalid={!!validationErrors.description}
                        />
                        <Form.Control.Feedback type="invalid">{validationErrors.description}</Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
                        <div className="form-section-title m-0">
                            <FaBolt /> Pricing Strategy
                        </div>
                        <Form.Check 
                            type="switch"
                            id="isMultiDay-switch"
                            label="Multi-Day"
                            className="small fw-bold text-pink"
                            checked={formData.isMultiDay}
                            onChange={(e) => setFormData({ ...formData, isMultiDay: e.target.checked })}
                        />
                    </div>

                    {!formData.isMultiDay ? (
                        <div className="ticket-tiers-section mt-3">
                            <AnimatePresence>
                                {formData.ticketTypes.map((ticket, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="ticket-tier-box"
                                    >
                                        <div className="form-row">
                                            <div style={{ flex: 2 }}>
                                                <Form.Label className="small">Tier Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    placeholder="e.g. VIP"
                                                    value={ticket.name}
                                                    onChange={(e) => handleTicketChange(index, e)}
                                                    isInvalid={!!validationErrors[`ticketName_${index}`]}
                                                />
                                                <Form.Control.Feedback type="invalid">{validationErrors[`ticketName_${index}`]}</Form.Control.Feedback>
                                            </div>
                                            <div>
                                                <Form.Label className="small">Price (₹)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="price"
                                                    value={ticket.price}
                                                    onChange={(e) => handleTicketChange(index, e)}
                                                    isInvalid={!!validationErrors[`ticketPrice_${index}`]}
                                                />
                                                <Form.Control.Feedback type="invalid">{validationErrors[`ticketPrice_${index}`]}</Form.Control.Feedback>
                                            </div>
                                            <div>
                                                <Form.Label className="small">Seats</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="quantity"
                                                    value={ticket.quantity}
                                                    onChange={(e) => handleTicketChange(index, e)}
                                                    isInvalid={!!validationErrors[`ticketQty_${index}`]}
                                                />
                                                <Form.Control.Feedback type="invalid">{validationErrors[`ticketQty_${index}`]}</Form.Control.Feedback>
                                            </div>
                                            <div className="d-flex align-items-end mb-3">
                                                <Button
                                                    variant="link"
                                                    className="p-0 text-pink mb-1"
                                                    onClick={() => removeTicketType(index)}
                                                    disabled={formData.ticketTypes.length === 1}
                                                >
                                                    <FaTrash size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <Button variant="outline-pink" className="btn-sm rounded-pill px-3" onClick={addTicketType}>
                                <FaPlus className="me-1" /> Add Tier
                            </Button>
                        </div>
                    ) : (
                        <div className="multi-day-section mt-3">
                            {formData.multiDayPlan.map((day, dayIdx) => (
                                <div key={dayIdx} className="multi-day-card">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="day-index-circle">{dayIdx + 1}</div>
                                            <Form.Control 
                                                type="date" 
                                                className={`bg-light border-0 fw-bold py-1 px-2 ${validationErrors[`dayDate_${dayIdx}`] ? 'is-invalid' : ''}`}
                                                style={{ fontSize: '13px' }}
                                                value={day.date}
                                                onChange={(e) => handleDayDateChange(dayIdx, e.target.value)}
                                            />
                                            {validationErrors[`dayDate_${dayIdx}`] && <div className="invalid-feedback d-block">{validationErrors[`dayDate_${dayIdx}`]}</div>}
                                        </div>
                                        <Button variant="link" className="text-pink p-0" onClick={() => removeEventDay(dayIdx)} disabled={formData.multiDayPlan.length === 1}>
                                            <FaTrash size={14} />
                                        </Button>
                                    </div>

                                    <Row className="g-2">
                                        {day.plans.map((plan, planIdx) => (
                                            <Col md={4} key={planIdx}>
                                                <div className="p-2 border rounded-3 bg-light">
                                                    <div className="small fw-bold mb-1">{plan.name}</div>
                                                    <div className="form-row">
                                                        <div className="mb-0">
                                                            <label className="small text-muted mb-0">Price</label>
                                                            <Form.Control 
                                                                type="number" 
                                                                className={`py-1 px-2 ${validationErrors[`dayPrice_${dayIdx}_${planIdx}`] ? 'is-invalid' : ''}`}
                                                                style={{ fontSize: '12px' }}
                                                                value={plan.price}
                                                                onChange={(e) => handleDayPlanChange(dayIdx, planIdx, 'price', e.target.value)}
                                                            />
                                                            {validationErrors[`dayPrice_${dayIdx}_${planIdx}`] && <div className="invalid-feedback d-block" style={{fontSize: '10px'}}>{validationErrors[`dayPrice_${dayIdx}_${planIdx}`]}</div>}
                                                        </div>
                                                        <div className="mb-0">
                                                            <label className="small text-muted mb-0">Seats</label>
                                                            <Form.Control 
                                                                type="number" 
                                                                className={`py-1 px-2 ${validationErrors[`dayQty_${dayIdx}_${planIdx}`] ? 'is-invalid' : ''}`}
                                                                style={{ fontSize: '12px' }}
                                                                value={plan.quantity}
                                                                onChange={(e) => handleDayPlanChange(dayIdx, planIdx, 'quantity', e.target.value)}
                                                            />
                                                            {validationErrors[`dayQty_${dayIdx}_${planIdx}`] && <div className="invalid-feedback d-block" style={{fontSize: '10px'}}>{validationErrors[`dayQty_${dayIdx}_${planIdx}`]}</div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            ))}
                            <Button variant="outline-pink" className="w-100 btn-sm rounded-pill" onClick={addEventDay}>
                                <FaPlus className="me-1" /> Add Day
                            </Button>
                        </div>
                    )}

                    <div className="create-event-actions">
                        <button
                            type="button"
                            className="btn-save-draft"
                            disabled={loading}
                            onClick={(e) => handleSubmit(e, 'draft')}
                        >
                            SAVE AS DRAFT
                        </button>
                        <button
                            type="submit"
                            className="btn-deploy"
                            disabled={loading}
                        >
                            {loading ? <Spinner size="sm" /> : <FaPaperPlane />}
                            {id ? 'UPDATE EVENT' : 'CREATE EVENT'}
                        </button>
                    </div>
                </Form>
            </motion.div>
        </div>
    );
};

export default CreateEvent;

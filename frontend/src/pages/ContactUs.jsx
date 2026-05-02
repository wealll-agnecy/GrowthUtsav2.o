import React, { useState } from 'react';
import { Container, Row, Col, Alert, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { motion } from 'framer-motion';
import '../css/contact.css';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaMagic } from 'react-icons/fa';

const ContactUs = () => {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await axios.post("/api/v1/enquiries", form);
            setSuccess(true);
            setForm({ name: "", phone: "", email: "", message: "" });
            // Using a more subtle toast or just the alert state
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error submitting enquiry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-luxury-wrapper">
            {/* HERO UNIFIED */}
            <div className="contact-hero-unified">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1>Get in Touch</h1>
                    <p>Elevate your artistry journey. Let’s collaborate to create world-class beauty experiences.</p>
                </motion.div>
            </div>

            <Container className="d-flex justify-content-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="contact-hub-card"
                >
                    {/* FORM SIDE */}
                    <div className="contact-form-side">
                        <h3>Send an Enquiry</h3>
                        
                        {success && (
                            <Alert variant="success" className="border-0 bg-success bg-opacity-10 text-success rounded-4 mb-4 small py-3">
                                <FaMagic className="me-2" /> Enquiry submitted successfully!
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="danger" className="border-0 bg-danger bg-opacity-10 text-danger rounded-4 mb-4 small py-3">
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Control required type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="contact-input-premium" />
                                </Col>
                                <Col md={6}>
                                    <Form.Control required type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Mobile Number" className="contact-input-premium" />
                                </Col>
                            </Row>

                            <Form.Control required type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email Address" className="contact-input-premium" />

                            <Form.Control required as="textarea" name="message" value={form.message} onChange={handleChange} placeholder="How can we assist you with your next event?" className="contact-input-premium" />

                            <div className="d-flex justify-content-center mt-4">
                                <button type="submit" disabled={loading} className="btn btn-pink px-5">
                                    {loading ? <Spinner size="sm" /> : "Send Enquiry"}
                                </button>
                            </div>
                        </Form>
                    </div>

                    {/* INFO SIDEBAR */}
                    <div className="contact-info-sidebar">
                        <div className="sidebar-item">
                            <div className="sidebar-icon"><FaEnvelope /></div>
                            <div className="sidebar-text">
                                <h6>Email Us</h6>
                                <p>support@growthutsav.com</p>
                            </div>
                        </div>

                        <div className="sidebar-item">
                            <div className="sidebar-icon"><FaPhone /></div>
                            <div className="sidebar-text">
                                <h6>Call Us</h6>
                                <p>+91 98765 43210</p>
                            </div>
                        </div>

                        <div className="sidebar-item">
                            <div className="sidebar-icon"><FaMapMarkerAlt /></div>
                            <div className="sidebar-text">
                                <h6>Our Studio</h6>
                                <p>Elite Tower, 4th Floor<br />Kolkata, WB 700001</p>
                            </div>
                        </div>

                        <div className="sidebar-quote">
                            <p>"Artistry is a conversation between the hand and the soul. Let's start ours today."</p>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
};

export default ContactUs;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Form, Button, Alert, Container, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaEnvelope, FaFingerprint, FaShieldAlt, FaRocket, FaSatellite, FaBolt } from 'react-icons/fa';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            const res = await axios.post('/api/v1/auth/forgotpassword', { email });
            if (res.data.success) {
                setMessage('An encrypted reset link has been dispatched to your strategic email address.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication protocol failure. Please re-verify email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-wrapper min-vh-100 d-flex align-items-center py-5">
            <Container fluid className="px-md-5">
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <div className="text-center mb-5 mt-4">
                                <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                                   <FaShieldAlt className="me-2" /> Security Recovery Protocol
                                </Badge>
                                <h1 className="fw-black m-0 tracking-tighter text-white" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1 }}>
                                    Reset <span className="gradient-text">Access</span>
                                </h1>
                                <p className="text-white-50 mt-3 mb-0 fw-medium">
                                    Initialize credential restoration and biometric synchronization.
                                </p>
                            </div>

                            <Card className="border-0 shadow-2xl rounded-5 overflow-hidden glass-panel border-white/10 backdrop-blur-2xl">
                                <Card.Body className="p-4 p-md-5 bg-transparent position-relative">
                                    <div className="position-absolute top-0 end-0 m-4 opacity-5 pointer-events-none"><FaSatellite size={60} /></div>
                                    <div className="text-center mb-5 position-relative">
                                        <div className="bg-primary shadow-glow rounded-circle p-4 d-inline-flex mb-4 border border-white/10 animate-pulse"><FaFingerprint size={40} className="text-white" /></div>
                                        <p className="text-white-50 small fw-black text-uppercase tracking-widest opacity-60 font-monospace">Verification Required</p>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {message && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -20 }} 
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                            >
                                                <Alert variant="success" className="glass-panel text-success border-success/20 rounded-5 mb-5 p-5 shadow-2xl d-flex align-items-center gap-4">
                                                    <FaRocket className="opacity-50" size={30} />
                                                    <div className="fw-black text-uppercase tracking-widest small">{message}</div>
                                                </Alert>
                                            </motion.div>
                                        )}
                                        {error && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -20 }} 
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                            >
                                                <Alert variant="danger" className="glass-panel text-danger border-danger/20 rounded-5 mb-5 p-5 shadow-2xl d-flex align-items-center gap-4">
                                                    <FaShieldAlt className="opacity-50" size={30} />
                                                    <div className="fw-black text-uppercase tracking-widest small">{error}</div>
                                                </Alert>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-5" controlId="email">
                                            <Form.Label className="small fw-black text-white-50 text-uppercase tracking-widest mb-3 opacity-60 font-monospace">Strategic Email Node</Form.Label>
                                            <div className="position-relative">
                                                <FaEnvelope className="position-absolute mt-3 ms-4 text-primary-light opacity-50" size={20} />
                                                <Form.Control
                                                    type="email"
                                                    className="bg-white/5 border-white/10 py-4 ps-5 pe-4 rounded-5 shadow-none fw-black text-white placeholder-light fs-5 font-monospace transition-all focus-border-primary"
                                                    placeholder="ENTER SECURE EMAIL..."
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </Form.Group>

                                        <div className="d-grid mt-5">
                                            <Button 
                                                variant="primary" 
                                                type="submit" 
                                                size="lg" 
                                                className="rounded-pill d-flex align-items-center justify-content-center gap-4 btn fw-medium px-4 py-2"
                                                disabled={loading}
                                            >
                                                {loading ? <Spinner size="sm" className="me-2" /> : <><FaBolt /> DISPATCH RESET LINK</>}
                                            </Button>
                                        </div>
                                    </Form>

                                    <div className="mt-5 text-center pt-4 border-top border-white/10">
                                        <Link to="/login" className="text-primary-light fw-black text-decoration-none d-inline-flex align-items-center gap-3 small text-uppercase tracking-widest hover-translate-x transition-all">
                                            <FaArrowLeft /> RETURN TO AUTH NODES
                                        </Link>
                                    </div>
                                </Card.Body>
                                <div className="bg-white/5 p-4 text-center text-white-50 small fw-black text-uppercase tracking-widest font-monospace opacity-30 border-top border-white/5">
                                    GrowthUtsav Neural Protocol • Recovery V2.4 SEC-4
                                </div>
                            </Card>
                            
                            <div className="mt-5 text-center">
                                <p className="text-white-50 small fw-black text-uppercase tracking-tighter opacity-30 font-monospace">
                                    Global Security Pillar Verification • End-to-End Encryption
                                </p>
                            </div>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ForgotPassword;

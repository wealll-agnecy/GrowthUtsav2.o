import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Badge } from 'react-bootstrap';
import { FaLock, FaShieldAlt, FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            const res = await axios.put(`/api/v1/auth/resetpassword/${token}`, { password });
            if (res.data.success) {
                setSuccess(true);
                toast.success('Password updated successfully!');
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper min-vh-100 d-flex align-items-center justify-content-center py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={5} md={8}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                        >
                            <Card className="glass-panel border-white/10 rounded-5 overflow-hidden shadow-2xl border-0">
                                <Card.Header className="bg-white/5 border-bottom border-white/10 p-5 text-center position-relative">
                                    <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10 pointer-events-none" 
                                         style={{ background: 'radial-gradient(circle at center, var(--primary), transparent)' }} />
                                    
                                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 animate-pulse"
                                         style={{ width: 80, height: 80, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                                        <FaShieldAlt size={35} className="text-primary-light" />
                                    </div>
                                    <h2 className="fw-black text-bright uppercase tracking-tighter m-0" style={{ fontSize: '2rem' }}>
                                        Reset <span className="gradient-text">Password</span>
                                    </h2>
                                    <p className="text-soft mt-3 mb-0 fw-medium">
                                        Update your master security credentials
                                    </p>
                                </Card.Header>
                                
                                <Card.Body className="p-5">
                                    <AnimatePresence mode="wait">
                                        {success ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-center py-4"
                                            >
                                                <FaCheckCircle size={60} className="text-success mb-4" />
                                                <h4 className="fw-bold text-white mb-2">Protocol Successful</h4>
                                                <p className="text-soft mb-4">Your password has been securely updated. Redirecting to login...</p>
                                                <Button as={Link} to="/login" variant="primary" className="rounded-pill w-100 btn fw-medium px-4 py-2">
                                                    LOGIN NOW
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <Form onSubmit={handleSubmit}>
                                                {error && (
                                                    <Alert variant="danger" className="rounded-4 border-danger/20 text-center mb-4 d-flex align-items-center gap-3">
                                                        <FaExclamationTriangle className="flex-shrink-0" />
                                                        <div className="small fw-semibold">{error}</div>
                                                    </Alert>
                                                )}

                                                <Form.Group className="mb-4">
                                                    <Form.Label className="text-soft small fw-black uppercase tracking-widest ps-1 mb-2">New Password</Form.Label>
                                                    <InputGroup className="glass-panel border-white/10 rounded-4 overflow-hidden shadow-inner">
                                                        <InputGroup.Text className="bg-transparent border-0 text-white-50 ps-3">
                                                            <FaLock />
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            type={showPass ? 'text' : 'password'}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="bg-transparent border-0 text-white py-3 shadow-none h-auto"
                                                            required
                                                        />
                                                        <Button 
                                                            variant="link" 
                                                            className="text-white-50 p-0 pe-3 shadow-none btn rounded-pill fw-medium px-4 py-2"
                                                            onClick={() => setShowPass(!showPass)}
                                                        >
                                                            {showPass ? <FaEyeSlash /> : <FaEye />}
                                                        </Button>
                                                    </InputGroup>
                                                </Form.Group>

                                                <Form.Group className="mb-5">
                                                    <Form.Label className="text-soft small fw-black uppercase tracking-widest ps-1 mb-2">Confirm Encryption</Form.Label>
                                                    <InputGroup className="glass-panel border-white/10 rounded-4 overflow-hidden shadow-inner">
                                                        <InputGroup.Text className="bg-transparent border-0 text-white-50 ps-3">
                                                            <FaLock />
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            type={showPass ? 'text' : 'password'}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            className="bg-transparent border-0 text-white py-3 shadow-none h-auto"
                                                            required
                                                        />
                                                    </InputGroup>
                                                </Form.Group>

                                                <Button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-3 btn fw-medium px-4 py-2"
                                                >
                                                    {loading ? 'SYNCHRONIZING...' : <>UPDATE CREDENTIALS <FaArrowRight /></>}
                                                </Button>
                                            </Form>
                                        )}
                                    </AnimatePresence>
                                </Card.Body>
                                
                                <Card.Footer className="bg-white/5 border-top border-white/10 p-4 text-center">
                                    <Link to="/login" className="small fw-black text-white-50 text-uppercase tracking-widest text-decoration-none hover-text-primary transition-all">
                                        Back to Security Portal
                                    </Link>
                                </Card.Footer>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ResetPassword;

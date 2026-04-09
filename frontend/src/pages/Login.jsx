import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaShieldAlt, FaEye, FaEyeSlash, FaSignInAlt, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role') || 'attendee';

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, user, error, setError, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'organizer') {
                if (user.status === 'pending') navigate('/pending-verification');
                else navigate('/organizer/dashboard');
            }
            else if (user.role === 'attendee') navigate('/attendee/dashboard');
            else if (user.role === 'staff') navigate('/staff/dashboard');
            else navigate('/');

        }
        return () => setError(null);
    }, [user, navigate, setError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedIdentifier = identifier.trim();
        const trimmedPassword = password.trim();

        console.log('[DEBUG] Attempting login for:', trimmedIdentifier);
        const result = await login(trimmedIdentifier, trimmedPassword);
        console.log('[DEBUG] Login result:', result);
    };


    const handleIdentifierChange = (e) => {
        setIdentifier(e.target.value);
        if (error) setError(null); // Clear error on type
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (error) setError(null); // Clear error on type
    };


    return (
        <div className="auth-bg-gradient min-vh-100 d-flex align-items-center py-5">
            <Container>
                <div className="text-center mb-4">
                    <Link to="/" className="btn-back">
                        <FaArrowLeft /> SECTOR TERMINAL
                    </Link>
                </div>

                <Row className="justify-content-center">

                    <Col lg={4} md={6} sm={10}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="saas-card border-0 shadow-2xl p-4 p-md-5 overflow-hidden position-relative">
                                
                                <div className="text-center mb-5 position-relative">
                                    <h2 className="fw-black text-white tracking-tighter mb-2">Access Portal</h2>
                                    <p className="text-white-50 small uppercase tracking-widest opacity-60">Synchronize your session</p>
                                </div>

                                {error && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                        <Alert variant="danger" className="bg-danger/10 border-danger/20 text-danger small fw-black uppercase tracking-tighter mb-4 rounded-4 py-3 d-flex align-items-center gap-2">
                                            <FaShieldAlt /> {error}
                                        </Alert>
                                    </motion.div>
                                )}

                                <Form onSubmit={handleSubmit} className="position-relative">
                                    <Form.Group className="mb-4">
                                        <label className="form-label-premium">Identity Trace</label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type="text"
                                                className="glass-input-premium rounded-4 py-3"
                                                placeholder="Email or phone"
                                                value={identifier}
                                                onChange={handleIdentifierChange}

                                                required
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <label className="form-label-premium">Security Key</label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                className="glass-input-premium rounded-4 py-3 password-input-with-toggle"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn position-absolute end-0 top-50 translate-middle-y text-white-50 p-2 me-2 border-0 shadow-none hover-text-white transition-all"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </Form.Group>

                                    <div className="text-end mb-4">
                                        <Link to="/forgot-password" size="sm" className="text-primary-light small fw-black uppercase tracking-tighter text-decoration-none hover-text-white transition-all">
                                            Lost Connectivity?
                                        </Link>
                                    </div>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="btn-primary w-100"
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner size="sm" /> : 'Authorize'}
                                    </Button>

                                </Form>

                                <div className="text-center mt-5">
                                    <p className="text-white-50 small mb-0 fw-medium">
                                        New node? <Link to={`/register?role=${roleParam}`} className="text-primary-light fw-black text-decoration-none hover-text-white transition-all ms-2">Initialize Account</Link>
                                    </p>
                                </div>
                            </Card>
                            
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;

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
        <div className="auth-luxury-wrapper">
            {/* Form Side */}
            <div className="auth-form-side">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="auth-premium-card"
                >
                    <div className="auth-header">
                        <h3>Welcome Back</h3>
                        <p>Enter your credentials to access your portal</p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <Alert variant="danger" className="text-center p-2 mb-4 rounded-3 small">
                                {error}
                            </Alert>
                        </motion.div>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <div className="premium-input-group">
                            <label>Email</label>
                            <Form.Control
                                type="text"
                                className="premium-auth-input"
                                value={identifier}
                                onChange={handleIdentifierChange}
                                required
                            />
                        </div>

                        <div className="premium-input-group">
                            <label>Password
                            </label>
                            <div className="position-relative">
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    className="premium-auth-input password-input"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="position-absolute end-0 top-0 border-0 shadow-none password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <Form.Check type="checkbox" label="Remember me" className="remember-me-beauty" />
                            <Link to="/forgot-password" size="sm" className="forgot-password-link">Forgot Password?</Link>
                        </div>

                        <div className="d-flex justify-content-center mt-2">
                            <button
                                type="submit"
                                className="btn btn-pink px-5"
                                disabled={loading}
                            >
                                {loading ? <Spinner size="sm" /> : 'Sign In To Portal'}
                            </button>
                        </div>
                    </Form>

                    <div className="auth-footer">
                        <p>New to GrowthUtsav? <Link to={`/register?role=${roleParam}`}>Register</Link></p>
                    </div>

                    <div className="text-center mt-3">
                        <Link to="/" className="return-home-link">
                            <FaArrowLeft /> Return to Homepage
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;

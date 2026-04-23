import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import './ForgotPassword.css';

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
                setMessage('An encrypted reset link has been dispatched to your email address.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication protocol failure. Please re-verify email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-container">
            {/* Form Section */}
            <div className="forgot-content-centered">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="forgot-card"
                >
                    <h3 className="forgot-title">Forgot Password</h3>
                    <p className="forgot-subtitle">
                        Enter your email and we’ll send you reset instructions.
                    </p>

                    {message && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <Alert variant="success" className="rounded-4 border-0 shadow-sm small mb-4">
                                {message}
                            </Alert>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <Alert variant="danger" className="rounded-4 border-0 shadow-sm small mb-4">
                                {error}
                            </Alert>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="forgot-input-group">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="forgot-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn-forgot"
                            disabled={loading}
                        >
                            {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="back-link">
                        <Link to="/login">
                            <FaArrowLeft className="me-2" /> Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;

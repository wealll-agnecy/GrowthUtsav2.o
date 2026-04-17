import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaLock, FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AdminSecretLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const navigate = useNavigate();
    const { adminLogin, logout, error, user, loading, setError } = useAuth();

    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin/dashboard');
        } else if (user) {
            setLocalError('Active session detected. You lack administrative privileges.');
        }
    }, [user, navigate]);

    const handleSessionLogout = async () => {
        await logout();
        setLocalError('');
        if (setError) setError(null);
    };

    useEffect(() => {
        if (setError) setError(null);
    }, [setError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        const res = await adminLogin(email, password);
        if (res && res.success) {
            navigate('/admin/dashboard');
        }
    };

    return (
        <div className="page-wrapper d-flex align-items-center" style={{ minHeight: '100vh', paddingBottom: '3rem', background: '#020617' }}>
            <Container fluid className="position-relative px-md-5" style={{ zIndex: 1, maxWidth: '450px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="glass-panel p-5 rounded-4 position-relative overflow-hidden"
                    style={{ border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 25px 50px -12px rgba(239,68,68,0.25)' }}
                >
                    <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', background: 'linear-gradient(90deg, #ef4444, #991b1b)' }} />

                    <div className="text-center mb-5">
                        <h2 className="fw-black text-white mb-2 tracking-tighter uppercase h3">Security <span className="text-danger">Protocol</span></h2>
                        <p className="small text-white-50 fw-bold font-monospace tracking-widest opacity-60 uppercase">Clearance Level 10 Required</p>
                    </div>

                    {localError && (
                        <Alert variant="warning" className="text-center small py-3 border-0 bg-warning/20 text-warning rounded-3 shadow-sm mb-4">
                            <div className="mb-2"><FaLock className="me-2" /> {localError}</div>
                            <Button
                                variant="outline-warning"
                                size="sm"
                                className="rounded-pill btn fw-medium px-4 py-2"
                                onClick={handleSessionLogout}
                            >
                                Logout current user
                            </Button>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="danger" className="text-center small py-2 border-0 bg-danger text-white rounded-3 shadow-sm mb-4">
                            <FaLock className="me-2" /> {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-semibold text-secondary text-uppercase tracking-wider">Clearance ID (Email)</Form.Label>
                            <Form.Control type="text" required value={email} onChange={(e) => { setEmail(e.target.value); if (setError) setError(null); setLocalError(''); }} className="bg-dark border-secondary text-white py-2" placeholder="commander@growthutsav.com" />

                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-semibold text-secondary text-uppercase tracking-wider">Passphrase</Form.Label>
                            <div className="position-relative">
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (setError) setError(null); setLocalError(''); }}
                                    className="bg-dark border-secondary text-white py-2 pe-5"
                                    placeholder="••••••••"
                                />

                                <Button
                                    variant="link"
                                    className="position-absolute end-0 top-50 translate-middle-y text-secondary text-decoration-none shadow-none btn rounded-pill fw-medium px-4 py-2"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                            </div>
                        </Form.Group>

                        <Button
                            type="submit"
                            variant="danger"
                            className="w-100 rounded-pill d-flex justify-content-center align-items-center gap-3 mt-5 btn fw-medium px-4 py-2"
                            disabled={loading || (user && user.role !== 'admin')}
                        >
                            {loading ? <Spinner size="sm" /> : <><FaLock size={14} /> Engange Override</>}
                        </Button>
                    </Form>

                    <div className="text-center mt-4 pt-3 border-top border-secondary">
                        <Link to="/" className="small text-secondary text-decoration-none fw-medium">
                            Return to public sector
                        </Link>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
};

export default AdminSecretLogin;

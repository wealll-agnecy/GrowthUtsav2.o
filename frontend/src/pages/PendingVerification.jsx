import React, { useState } from 'react';
import { Container, Button, Spinner } from 'react-bootstrap';
import { FaHourglassHalf, FaArrowLeft, FaSync, FaRocket } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const PendingVerification = () => {
    const { logout, setUser } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);

    const checkVerificationStatus = async () => {
        setChecking(true);
        try {
            const res = await axios.get('/api/v1/auth/me');
            if (res.data.success) {
                const userData = res.data.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                
                if (userData.status === 'verified') {
                    toast.success('Identity Verified! Accessing Dashboard...');
                    navigate('/organizer/dashboard');
                } else {
                    toast.error('Identity still pending verification');
                }
            }
        } catch (err) {
            toast.error('Identity sync failure');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="page-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', paddingTop: 'var(--navbar-height)' }}>
            <Container>
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            transition={{ duration: 0.5 }}
                            className="glass-card text-center p-5 rounded-4 shadow-2xl"
                            style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}
                        >
                            <div className="mb-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    style={{ display: 'inline-block' }}
                                >
                                    <FaHourglassHalf size={64} style={{ color: '#f59e0b' }} />
                                </motion.div>
                            </div>
                            
                            <h2 className="fw-black mb-3 text-bright h2-responsive">Verification Pending</h2>
                            
                            <p className="text-soft mb-4 lh-lg px-md-3">
                                Your account is under verification. Please wait for admin approval.
                                During this period, dashboard access and booking capabilities are restricted.
                            </p>

                            <div className="p-3 rounded-4 mb-5" style={{ background: 'rgba(245, 158, 11, 0.05)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                                <small className="fw-black uppercase tracking-widest opacity-60">Status Check Trigger</small>
                                <div className="mt-3">
                                    <Button 
                                        variant="outline-warning" 
                                        className="rounded-pill px-4 py-2 d-flex align-items-center gap-2 mx-auto btn fw-medium"
                                        onClick={checkVerificationStatus}
                                        disabled={checking}
                                    >
                                        {checking ? <Spinner size="sm" /> : <FaSync className={checking ? 'fa-spin' : ''} />} 
                                        {checking ? 'Synchronizing...' : 'Sync Identity Status'}
                                    </Button>
                                </div>
                            </div>

                            <div className="d-flex flex-column gap-3">
                                <Button 
                                    as={Link} 
                                    to="/" 
                                    className="btn-primary-gradient rounded-pill transition-all btn fw-medium px-4 py-2"
                                >
                                    <FaRocket className="me-2" /> Explore the Platform
                                </Button>
                                <Button 
                                    variant="link"
                                    onClick={logout}
                                    className="text-white-50 text-decoration-none hover-text-white btn rounded-pill fw-medium px-4 py-2"
                                >
                                    Login with different identity
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default PendingVerification;

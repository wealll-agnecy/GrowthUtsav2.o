import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import * as planApi from '../api/servicePlanApi';
import PricingCard from '../components/plans/PricingCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaRocket, FaCrown, FaStar, FaGem, FaSatellite, FaBolt } from 'react-icons/fa';

const PricingPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await planApi.getPlans();
                setPlans(res.data?.data || []);
            } catch (err) {
                setError('Failed to load strategic service plans');
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSelectPlan = async (planId) => {
        if (!window.confirm('Are you sure you want to upgrade your strategic plan? This will synchronize your node access levels.')) return;

        setUpdating(true);
        try {
            const res = await planApi.selectPlan(planId);
            if (setUser) {
                setUser({ ...user, servicePlan: res.data.data.servicePlan });
            }
            alert(res.data.message);
            navigate('/organizer/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to sync plan');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-transparent">
            <motion.div animate={{ scale: [1, 1.2, 1], rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <FaGem size={50} className="text-primary opacity-50 shadow-glow" />
            </motion.div>
        </div>
    );

    return (
        <div className="dashboard-content pb-5">
            <Container fluid className="p-0">
                <div className="text-center mb-5 mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                    >
                        <Badge className="bg-primary-subtle text-primary border border-primary-light px-4 py-2 mb-4 text-uppercase tracking-widest fw-black small shadow-2xl">
                            <FaCrown className="me-2" /> Strategic Protocol Grid
                        </Badge>
                        <h1 className="fw-black m-0 tracking-tighter text-white display-2" style={{ lineHeight: 1 }}>
                            Expansion <span className="gradient-text">Manifest</span>
                        </h1>
                        <p className="text-white-50 mt-4 mx-auto fw-medium fs-5" style={{ maxWidth: '750px', lineHeight: 1.6 }}>
                            Unlock high-velocity tools, quantum-secured inventory management, and premium platform resonance for your global digital clusters.
                        </p>

                        <div className="mt-5 d-flex justify-content-center">
                            <div className="glass-card px-5 py-3 rounded-pill border-white/5 shadow-2xl d-flex align-items-center gap-3">
                                <FaSatellite className="text-primary-light animate-pulse" />
                                <span className="text-white-50 fw-black uppercase tracking-widest small">Current Node Status:</span>
                                <span className="text-primary-light fw-black uppercase tracking-widest small shadow-glow">{user?.servicePlan?.name || 'Standard Tier'}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Alert variant="danger" className="glass-panel text-danger border-danger/20 rounded-5 mb-5 p-5 shadow-2xl text-center fw-black text-uppercase tracking-widest">
                            <FaShieldAlt className="me-3 opacity-50" size={30} />
                            {error}
                        </Alert>
                    </motion.div>
                )}

                <Row className="g-5 justify-content-center align-items-stretch mt-3">
                    {(plans || []).map((plan, idx) => (
                        <Col key={plan._id} md={6} lg={4}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, type: 'spring', damping: 20 }}
                                className="h-100"
                            >
                                <PricingCard
                                    plan={plan}
                                    onSelect={handleSelectPlan}
                                    currentPlanId={user?.servicePlan?._id || user?.servicePlan}
                                    loading={updating}
                                />
                            </motion.div>
                        </Col>
                    ))}
                </Row>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-5 pt-5"
                >
                    <div className="p-5 rounded-5 glass-panel border-white/5 shadow-2xl d-inline-block border-primary/10 backdrop-blur-3xl position-relative overflow-hidden" style={{ maxWidth: '900px' }}>
                        <div className="position-absolute top-0 end-0 m-4 opacity-5 pointer-events-none"><FaBolt size={60} /></div>
                        <p className="text-white-50 fs-5 fw-medium m-0 position-relative z-index-1">
                            <FaShieldAlt className="me-3 text-primary glow-text" size={24} />
                            All tiers include core universal management protocols, quantum-secured financial processing, and digital souvenir issuance.
                            <br /><span className="small opacity-60 italic mt-3 d-block d-md-inline">Looking for an enterprise-grade bespoke solution? <span className="text-primary-light fw-black cursor-pointer text-decoration-underline hover-opacity-100 transition-all">Sychronize with Global Sales</span></span>
                        </p>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
};

export default PricingPlans;

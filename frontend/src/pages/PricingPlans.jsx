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
        <div className="dashboard-page overflow-hidden">
            <Container fluid className="px-md-5">
                <div className="dashboard-header text-center mb-5">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="mb-3">
                            <span className="status-badge badge-pink">STRATEGIC SERVICE PLANS</span>
                        </div>
                        <h1 className="dashboard-title-main" style={{ fontSize: '3rem' }}>Upgrade Your Presence</h1>
                        <p className="dashboard-subtext mx-auto" style={{ maxWidth: '700px' }}>
                            Unlock high-velocity tools, premium platform features, and professional management capabilities for your events.
                        </p>

                        <div className="mt-4 d-flex justify-content-center">
                            <div className="dashboard-card px-4 py-2 d-flex align-items-center gap-3 border-slate-200 shadow-sm" style={{ height: 'auto' }}>
                                <FaBolt className="text-pink" />
                                <span className="card-title-sm m-0" style={{ fontSize: '0.7rem' }}>Current Status:</span>
                                <span className="fw-bold tracking-widest text-pink small">{user?.servicePlan?.name?.toUpperCase() || 'STANDARD TIER'}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Alert variant="danger" className="border-danger/20 rounded-4 mb-5 p-4 text-center fw-bold">
                            <FaShieldAlt className="me-3 opacity-50" size={20} />
                            {error}
                        </Alert>
                    </motion.div>
                )}

                <Row className="g-4 justify-content-center align-items-stretch mt-3">
                    {(plans || []).map((plan, idx) => (
                        <Col key={plan._id} md={6} lg={4}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
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

                <div className="mt-5 pt-5 text-center">
                    <div className="dashboard-card d-inline-block p-4 border-slate-100 shadow-sm" style={{ maxWidth: '800px', height: 'auto' }}>
                        <p className="dashboard-subtext m-0 d-flex align-items-center justify-content-center gap-3 flex-wrap">
                            <FaShieldAlt className="text-pink" />
                            All tiers include core management protocols, secure financial processing, and digital certificate issuance.
                            <span className="opacity-50 small">|</span>
                            <span className="text-pink fw-bold cursor-pointer hover-text-pink-dark transition-all">Sychronize with Global Sales</span>
                        </p>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default PricingPlans;

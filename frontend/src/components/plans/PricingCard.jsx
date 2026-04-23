import { Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaCrown, FaRocket, FaShieldAlt, FaStar, FaGem, FaBolt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PricingCard = ({ plan, onSelect, currentPlanId, loading }) => {
    const isCurrent = currentPlanId === plan._id || currentPlanId === plan.name;
    const isPopular = plan.name === 'Silver';

    const getIcon = () => {
        if (plan.name === 'Gold') return <FaCrown size={60} className="text-warning mb-4 shadow-glow" />;
        if (plan.name === 'Silver') return <FaGem size={60} className="text-primary mb-4 shadow-glow" />;
        return <FaShieldAlt size={60} className="text-white-50 mb-4 opacity-50 shadow-inner" />;
    };

    return (
        <div className={`dashboard-card shadow-sm h-100 p-0 overflow-hidden ${isPopular ? 'border-pink' : 'border-slate-100'}`} style={{ border: isPopular ? '2px solid #ec4899' : '1px solid #e2e8f0' }}>
            {isPopular && (
                <div className="bg-pink text-white text-center py-2 fw-bold small text-uppercase tracking-widest">
                    MOST POPULAR
                </div>
            )}
            <div className="p-5 text-center d-flex flex-column h-100 bg-white">
                <div className="mb-4">
                    {getIcon()}
                </div>
                
                <h2 className="dashboard-title-main mb-2" style={{ fontSize: '2rem' }}>{plan.name}</h2>
                <div className="mb-4">
                    <div className="d-flex justify-content-center align-items-end">
                        <span className="display-5 fw-bold text-pink">₹{plan.price}</span>
                        <span className="text-slate fw-bold ms-2 mb-2 small tracking-tight opacity-50">/MONTH</span>
                    </div>
                </div>
                
                <ListGroup variant="flush" className="mb-5 text-start flex-grow-1">
                    {plan.features.map((feature, idx) => (
                        <ListGroup.Item key={idx} className="border-0 px-0 py-3 small d-flex align-items-start gap-3 bg-transparent">
                            <FaCheckCircle className="text-success mt-1" size={16} />
                            <span className="fw-medium text-slate opacity-80">{feature.toUpperCase()}</span>
                        </ListGroup.Item>
                    ))}
                    <ListGroup.Item className="border-0 px-0 py-3 small d-flex align-items-start gap-3 bg-transparent">
                         <FaCheckCircle className="text-success mt-1" size={16} />
                         <span className="fw-medium text-slate opacity-80">{plan.supportLevel.toUpperCase()} SUPPORT</span>
                    </ListGroup.Item>
                </ListGroup>

                <Button 
                    className={`btn w-100 rounded-pill mt-auto fw-bold py-3 transition-all ${isCurrent ? 'btn-outline-pink disabled' : 'btn-pink'}`}
                    onClick={() => !isCurrent && onSelect(plan._id)}
                    disabled={isCurrent || loading}
                >
                    {loading ? 'PROCESSING...' : (isCurrent ? 'ACTIVE PLAN' : `UPGRADE TO ${plan.name.toUpperCase()}`)}
                </Button>
            </div>
            {isCurrent && (
                <div className="bg-success text-white text-center py-1 small fw-bold tracking-widest">
                    ACTIVE NODE
                </div>
            )}
        </div>
    );
};

export default PricingCard;

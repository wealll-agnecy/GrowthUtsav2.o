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
        <Card className={`h-100 border-0 shadow-2xl rounded-5 overflow-hidden transition-all glass-card backdrop-blur-3xl border-white/5 antigravity-hover ${isPopular ? 'scale-105 border-primary/40 border-2 shadow-glow-primary' : ''}`}>
            {isPopular && (
                <div className="bg-primary text-white text-center py-3 fw-black small text-uppercase tracking-widest shadow-lg position-relative overflow-hidden">
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-10 animate-pulse" />
                    <FaStar className="me-2 text-white" /> MOST RESONANT TIER <FaStar className="ms-2 text-white" />
                </div>
            )}
            <Card.Body className="p-4 p-md-5 text-center d-flex flex-column bg-transparent position-relative">
                <div className="position-absolute top-0 end-0 m-4 opacity-5 pointer-events-none"><FaBolt size={80} /></div>
                
                <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 350 }}
                    className="position-relative z-index-1"
                >
                    {getIcon()}
                </motion.div>
                
                <h1 className="fw-black text-white text-uppercase tracking-widest mb-2 neon-text display-5">{plan.name}</h1>
                <div className="mb-5 position-relative z-index-1">
                    <div className="d-flex justify-content-center align-items-end mb-1">
                        <span className="display-4 fw-black m-0 text-primary gradient-text">₹{plan.price}</span>
                        <span className="text-white-50 fw-black ms-2 mb-2 small tracking-tighter opacity-60">/MONTHLY SYNC</span>
                    </div>
                </div>
                
                <ListGroup variant="flush" className="mb-5 text-start flex-grow-1 bg-transparent position-relative z-index-1">
                    {plan.features.map((feature, idx) => (
                        <ListGroup.Item key={idx} className="border-0 px-0 py-4 small bg-transparent d-flex align-items-start gap-4">
                            <FaCheckCircle className="text-success mt-1 shadow-glow" size={18} />
                            <span className="fw-black text-white-50 fs-6 opacity-80">{feature.toUpperCase()}</span>
                        </ListGroup.Item>
                    ))}
                    <ListGroup.Item className="border-0 px-0 py-4 small bg-transparent d-flex align-items-start gap-4">
                         <FaCheckCircle className="text-success mt-1 shadow-glow" size={18} />
                         <span className="fw-black text-white fs-6 tracking-tight">{plan.supportLevel.toUpperCase()} INTELLIGENCE SUPPORT</span>
                    </ListGroup.Item>
                </ListGroup>

                <Button 
                    variant={isCurrent ? "outline-success" : (isPopular ? "primary" : "outline-primary")} 
                    className={`w-100 rounded-pill mt-auto fs-6 ${isCurrent ? 'opacity-40 border-white/20 text-white' : 'glow-hover shadow-glow-sm'} btn fw-medium px-4 py-2`}
                    onClick={() => !isCurrent && onSelect(plan._id)}
                    disabled={isCurrent || loading}
                >
                    {loading ? 'SYNCHRONIZING...' : (isCurrent ? 'DEPLOYED TIER' : `ACTIVATE ${plan.name.toUpperCase()} HUB`)}
                </Button>
            </Card.Body>
            {isCurrent && (
                <div className="bg-success/20 text-success text-center py-2 fw-black small text-uppercase tracking-widest border-top border-success/20 backdrop-blur-md">
                    ACTIVE PROTOCOL
                </div>
            )}
        </Card>
    );
};

export default PricingCard;

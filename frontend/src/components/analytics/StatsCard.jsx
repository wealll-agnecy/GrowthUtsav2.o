import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StatsCard = ({ title, value, icon, color, subtitle, growth, delay = 0 }) => {
    const isPositive = growth?.startsWith('+');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="h-100"
        >
            <div className="saas-card h-100 p-4">
                <div className="d-flex align-items-start justify-content-between mb-4">
                    <div
                        className="activity-icon shadow-sm"
                        style={{
                            background: `${color}15`,
                            color: color,
                            border: `1px solid ${color}30`
                        }}
                    >
                        {icon}
                    </div>
                </div>
                
                <div className="mb-1">
                    <p className="text-soft uppercase tracking-widest fw-black mb-1" style={{ fontSize: '0.65rem', opacity: 0.7 }}>{title}</p>
                    <div className="d-flex align-items-center gap-2">
                        <h3 className="text-bright fw-black m-0" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>{value}</h3>
                        {growth && (
                            <div className={`d-flex align-items-center gap-1 small fw-bold px-2 py-0 rounded-pill ${isPositive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`} style={{ fontSize: '0.7rem' }}>
                                {isPositive ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
                                {growth}
                            </div>
                        )}
                    </div>
                </div>

                {subtitle && (
                    <p className="text-muted-custom small mb-0 mt-3 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem' }}>
                        <span className="opacity-50">•</span> {subtitle}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default StatsCard;

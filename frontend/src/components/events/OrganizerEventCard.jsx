import React from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowRight, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const OrganizerEventCard = ({ event }) => {
    const navigate = useNavigate();

    const sold = (event.ticketTypes || []).reduce((acc, curr) => acc + (curr.sold || 0), 0);
    const minPrice = (event.ticketTypes || []).length > 0 ? Math.min(...event.ticketTypes.map(t => t.price)) : 0;

    const statusColors = {
        approved: 'success',
        pending: 'warning',
        rejected: 'danger',
        live: 'primary',
        completed: 'secondary',
        draft: 'info'
    };

    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="h-100"
            onClick={() => navigate(`/organizer/event/${event._id}`)}
            style={{ cursor: 'pointer' }}
        >
            <Card className="h-100 border-0 shadow-2xl rounded-5 overflow-hidden glass-panel border-white/10 tilt-3d organizer-card-hover">
                <div className="position-relative" style={{ height: '220px' }}>
                    <Card.Img
                        variant="top"
                        src={(event.bannerImage && event.bannerImage !== 'no-photo.jpg' && !event.bannerImage.startsWith('http')) ? `http://localhost:5000/uploads/${event.bannerImage}` : (event.bannerImage && event.bannerImage.startsWith('http')) ? event.bannerImage : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                        className="h-100 w-100 object-fit-cover opacity-80"
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.85) 100%)' }} />

                    <Badge
                        bg={statusColors[event.status] || 'secondary'}
                        className="position-absolute top-0 end-0 m-4 px-3 py-2 rounded-pill fw-black text-uppercase tracking-widest shadow-lg border border-white/20"
                        text={event.status === 'pending' ? 'dark' : 'white'}
                        style={{ fontSize: '0.65rem' }}
                    >
                        {event.status === 'pending' ? 'Pending Approval' : event.status}
                    </Badge>

                    <div className="position-absolute bottom-0 start-0 p-4 w-100">
                        <div className="d-flex justify-content-between align-items-end">
                            <div>
                                <Badge bg="primary-subtle" text="primary" className="mb-2 px-2 py-1 rounded-3 fw-black uppercase tracking-widest small" style={{ fontSize: '0.6rem' }}>
                                    {event.category}
                                </Badge>
                                <h4 className="fw-black text-white m-0 text-truncate" style={{ maxWidth: '240px' }}>{event.title}</h4>
                            </div>
                            <div className="text-end">
                                <div className="text-white-50 small fw-black tracking-widest uppercase mb-1" style={{ fontSize: '0.6rem' }}>ENTRY FROM</div>
                                <div className="text-primary-light fw-black h4 m-0 gradient-text">₹{minPrice}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <Card.Body className="p-4 d-flex flex-column gap-3">
                    <div className="d-flex flex-column gap-2 mb-3">
                        <div className="d-flex align-items-center gap-2 text-white-50 small fw-bold">
                            <FaCalendarAlt className="text-primary" />
                            <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-white-50 small fw-bold">
                            <FaMapMarkerAlt className="text-primary" />
                            <span className="text-truncate">{event.venue}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-3 border-top border-white/5 d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <Badge bg="white" text="dark" className="px-3 py-2 rounded-pill fw-black text-uppercase tracking-widest shadow-sm d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.65rem' }}>
                            <FaUsers className="text-primary" /> {sold} REGISTRATIONS
                        </Badge>
                        <motion.div whileHover={{ x: 5 }} className="text-primary small fw-black tracking-widest uppercase d-flex align-items-center gap-2">
                            DASHBOARD <FaArrowRight size={10} />
                        </motion.div>
                    </div>
                </Card.Body>
            </Card>
        </motion.div>
    );
};

export default OrganizerEventCard;

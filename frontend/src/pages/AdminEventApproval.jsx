import { useState, useEffect } from 'react';
import * as eventApi from '../api/eventApi';
import { Container, Table, Button, Badge, Card, Spinner, Alert, Modal, Row, Col } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaShieldAlt, FaInfoCircle, FaCalendarAlt, FaMapMarkerAlt, FaUserAlt, FaTicketAlt, FaRocket, FaSatellite, FaGavel, FaChartLine } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';

const AdminEventApproval = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const currentStatusView = searchParams.get('status') || 'pending';

    const fetchEventsByStatus = async () => {
        setLoading(true);
        try {
            if (currentStatusView === 'pending') {
                const res = await eventApi.getAdminPendingEvents();
                setEvents(res.data.data);
            } else {
                const res = await eventApi.getEvents();
                const filtered = res.data.data.filter(e => {
                    if (currentStatusView === 'approved') {
                        return ['approved', 'live', 'completed'].includes(e.status);
                    }
                    return e.status === currentStatusView;
                });
                setEvents(filtered);
            }
            setError(null);
        } catch (err) {
            setError(`Failed to fetch ${currentStatusView} events`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventsByStatus();
    }, [currentStatusView]);

    const handleAction = async (id, status) => {
        if (window.confirm(`Are you sure you want to ${status} this event?`)) {
            try {
                if (status === 'approved') {
                    await eventApi.adminApproveEvent(id);
                } else if (status === 'rejected') {
                    await eventApi.adminRejectEvent(id);
                } else {
                    await eventApi.updateEventStatus(id, status);
                }
                fetchEventsByStatus();
                // Instantly remove or update in UI
                setEvents(prev => {
                    if (currentStatusView === 'pending') {
                        return prev.filter(e => e._id !== id);
                    }
                    return prev.map(e => e._id === id ? { ...e, status } : e);
                });
                setShowModal(false);
            } catch (err) {
                const msg = err.response?.data?.message || err.message || `Failed to ${status} event`;
                setError(msg);
                alert(msg);
            }
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-transparent">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <FaShieldAlt size={50} className="text-primary opacity-50" />
            </motion.div>
        </div>
    );

    return (
        <div className="dashboard-content pb-5">
            <Container fluid className="p-0">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3"
                >
                    <div>
                        <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                            <FaShieldAlt className="me-2" /> Security Clearance Level 5
                        </Badge>
                        <h1 className="fw-black m-0 tracking-tighter text-white text-capitalize" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1 }}>
                            {currentStatusView} <span className="gradient-text">Events</span>
                        </h1>
                    </div>
                    <div className="text-md-end">
                        <div className="d-flex align-items-center gap-3">
                            <span className="text-white-50 fw-black uppercase tracking-widest small">{currentStatusView} Queue:</span>
                            <span className="text-primary-light fw-black h1 m-0 gradient-text shadow-glow">{events.length}</span>
                        </div>
                    </div>
                </motion.div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Alert variant="danger" className="rounded-4 border-0 shadow-2xl mb-4 bg-danger/10 text-danger border-danger/20">{error}</Alert>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {events.length === 0 ? (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-panel p-5 rounded-5 shadow-2xl border-white/10 text-center"
                        >
                            <div className="display-1 mb-4 opacity-10">✅</div>
                            <h4 className="fw-black text-white text-uppercase tracking-widest">Sector Clear</h4>
                            <p className="text-white-50 mb-0 fw-medium">All telemetry has been processed. No pending nodes detected.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-0 shadow-2xl rounded-5 overflow-hidden glass-panel border-white/10">
                                <div className="table-responsive">
                                    <Table hover variant="dark" className="mb-0 align-middle bg-transparent">
                                        <thead className="bg-white/5 border-bottom border-white/10">
                                            <tr className="small text-uppercase fw-black text-white-50 tracking-widest">
                                                <th className="px-4 py-4">Node Metrics</th>
                                                <th className="py-4">Organization Hub</th>
                                                <th className="py-4">Telemetry</th>
                                                <th className="text-end px-4 py-4">Governance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="border-0">
                                            {events.map((event, idx) => (
                                                <motion.tr
                                                    key={event._id}
                                                    initial={{ opacity: 0, x: -15 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.08 }}
                                                    className="border-bottom border-white/5 hover-bg-white/5 transition-all"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="fw-black fs-5 text-white mb-1">{event?.title || 'Untitled Node'}</div>
                                                        <div className="d-flex gap-2">
                                                            <Badge bg="primary-subtle" text="primary" className="small fw-black text-uppercase tracking-tighter" style={{ fontSize: '0.65rem' }}>{event?.category || 'Legacy'}</Badge>
                                                            <Badge bg={
                                                                event.status === 'approved' ? 'success-subtle' :
                                                                    event.status === 'live' ? 'info-subtle' :
                                                                        event.status === 'rejected' ? 'danger-subtle' : 'warning-subtle'
                                                            } className="small fw-black text-uppercase tracking-tighter" style={{ fontSize: '0.65rem' }}>
                                                                {event.status}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="fw-bold text-white small">{event.organizer?.name}</div>
                                                        <div className="text-white-50 small fw-medium opacity-60">{event.organizer?.email}</div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="d-flex align-items-center gap-2 mb-2 text-white opacity-80">
                                                            <FaCalendarAlt className="text-primary small" />
                                                            <span className="small fw-bold">{new Date(event.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2 text-white-50">
                                                            <FaMapMarkerAlt className="text-primary small" />
                                                            <span className="small fw-medium text-truncate" style={{ maxWidth: '180px' }}>{event.venue}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-end px-4 py-4">
                                                        <div className="d-flex justify-content-end gap-3 align-items-center">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="btn btn-outline-light btn-sm rounded-circle p-2 border-2 shadow-lg"
                                                                onClick={() => { setSelectedEvent(event); setShowModal(true); }}
                                                                title="Deep Audit"
                                                            >
                                                                <FaEye size={16} />
                                                            </motion.button>
                                                            <Link
                                                                to={`/organizer/event/${event._id}`}
                                                                className="btn btn-primary btn-sm rounded-circle p-2 shadow-lg border-0 d-flex align-items-center justify-content-center"
                                                                title="View Dashboard"
                                                                style={{ width: '32px', height: '32px' }}
                                                            >
                                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                                    <FaChartLine size={16} />
                                                                </motion.div>
                                                            </Link>
                                                            {currentStatusView !== 'approved' && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="btn btn-success btn-sm rounded-circle p-2 shadow-lg border-0"
                                                                    onClick={() => handleAction(event._id, 'approved')}
                                                                    title="Approve Node"
                                                                >
                                                                    <FaCheck size={16} />
                                                                </motion.button>
                                                            )}
                                                            {currentStatusView !== 'rejected' && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="btn btn-outline-danger btn-sm rounded-circle p-2 border-2 shadow-lg"
                                                                    onClick={() => handleAction(event._id, 'rejected')}
                                                                    title="Purge Node"
                                                                >
                                                                    <FaTimes size={16} />
                                                                </motion.button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Audit Intelligence Modal */}
                <Modal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    size="lg"
                    centered
                    contentClassName="bg-deep-space rounded-5 border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden"
                >
                    {selectedEvent && (
                        <>
                            <Modal.Header closeButton closeVariant="white" className="border-0 p-5 pb-0">
                                <Modal.Title className="fw-black fs-2 gradient-text tracking-tightest">DEEP AUDIT LOGS</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="p-5">
                                <div className="position-absolute top-0 end-0 m-5 opacity-5 pointer-events-none"><FaGavel size={150} /></div>
                                <div className="mb-5 position-relative">
                                    <Badge bg="primary" className="mb-3 rounded-pill px-3 py-2 fw-black text-uppercase tracking-widest">{selectedEvent.category} NODE</Badge>
                                    <h1 className="fw-black text-white mb-2">{selectedEvent.title}</h1>
                                    <div className="d-flex align-items-center gap-4 text-white-50 small fw-bold">
                                        <span className="d-flex align-items-center gap-2"><FaCalendarAlt className="text-primary" /> {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : 'TBD'}</span>
                                        <span className="d-flex align-items-center gap-2"><FaMapMarkerAlt className="text-primary" /> {selectedEvent.venue || 'TBD'}</span>
                                    </div>
                                </div>

                                <Row className="g-4 mb-5 position-relative">
                                    <Col md={6}>
                                        <div className="p-4 glass-panel rounded-4 border-white/5 h-100 shadow-inner">
                                            <div className="small fw-black text-primary text-uppercase tracking-widest mb-3 opacity-60">Source Origin</div>
                                            <div className="fw-black text-white mb-1 fs-5">{selectedEvent.organizer?.name}</div>
                                            <div className="small text-white-50 fw-medium opacity-70">{selectedEvent.organizer?.email}</div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="p-4 glass-panel rounded-4 border-white/5 h-100 shadow-inner">
                                            <div className="small fw-black text-primary text-uppercase tracking-widest mb-3 opacity-60">Fiscal Architecture</div>
                                            <div className="d-flex flex-wrap gap-2 pt-1">
                                                {(selectedEvent.ticketTypes || []).map((t, i) => (
                                                    <Badge key={i} bg="white/10" text="white" className="border border-white/10 px-3 py-2 fw-black">₹{t.price} <span className="opacity-50 ms-1 fw-medium" style={{ fontSize: '0.6rem' }}>{t.name}</span></Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="mb-5 position-relative">
                                    <h5 className="fw-black text-white mb-3 d-flex align-items-center gap-3"><FaInfoCircle className="text-primary" /> CONTENT NARRATIVE</h5>
                                    <p className="text-white-50 fs-6 lh-lg mb-0 font-monospace opacity-80" style={{ fontSize: '0.9rem' }}>{selectedEvent.description}</p>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-4 bg-primary/10 border border-primary/20 position-relative shadow-inner"
                                >
                                    <div className="d-flex align-items-center gap-4">
                                        <div className="p-2 bg-primary rounded-circle shadow-lg"><FaRocket className="text-white" size={24} /></div>
                                        <div>
                                            <h6 className="fw-black text-white mb-1 tracking-widest small uppercase">SYSTEM COMPLIANCE</h6>
                                            <div className="small text-primary-light fw-medium opacity-80">Telemetry matches standard platform safety metrics. Recommended for public propagation.</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Modal.Body>
                            <Modal.Footer className="border-0 p-5 pt-0 gap-3">
                                <Button variant="link" className="text-white-50 fw-black text-decoration-none text-uppercase small" onClick={() => setShowModal(false)}>ABORT MISSION</Button>
                                <Button variant="outline-danger" className="rounded-pill px-5 py-2 fw-black border-2 shadow-lg" onClick={() => handleAction(selectedEvent?._id, 'rejected')}>PURGE NODE</Button>
                                <Button variant="primary" className="rounded-pill px-5 py-2 fw-black border-0 shadow-lg glow-hover" onClick={() => handleAction(selectedEvent?._id, 'approved')}>AUTHORIZE ENTRY</Button>
                            </Modal.Footer>
                        </>
                    )}
                </Modal>
            </Container>
        </div>
    );
};

export default AdminEventApproval;

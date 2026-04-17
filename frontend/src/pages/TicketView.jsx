import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as ticketApi from '../api/ticketApi';
import { Container, Row, Col, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import {
    FaDownload, FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt,
    FaArrowLeft, FaCheckCircle, FaShieldAlt, FaPrint, FaClock, FaIdCard
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const TicketView = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await ticketApi.getTicket(id);
                setTicket(res.data.data);
                setQrCode(res.data.qrCodeUrl);
            } catch (err) {
                setError('Failed to load your digital pass.');
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [id]);

    const handleDownload = () => ticketApi.downloadTicketPDF(id);

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center bg-deep-space" style={{ minHeight: '100vh' }}>
                <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <FaTicketAlt size={50} className="text-primary opacity-50 shadow-glow-sm" />
                </motion.div>
                <p className="text-white-50 mt-4 fw-black uppercase tracking-widest small">Synchronizing Portal...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <Container className="text-center">
                    <Alert variant="danger" className="glass-panel text-danger border-danger/20 rounded-5 p-5 shadow-2xl d-inline-block">
                        <FaShieldAlt size={50} className="mb-4 opacity-50" />
                        <h3 className="fw-black mb-3 text-uppercase tracking-widest">ACCESS DENIED</h3>
                        <p className="fs-5 opacity-75">{error}</p>
                    </Alert>
                </Container>
            </div>
        );
    }

    if (!ticket) return null;

    const bannerUrl = (ticket?.event?.bannerImage && ticket.event.bannerImage !== 'no-photo.jpg')
        ? ticket.event.bannerImage
        : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200';

    return (
        <div className="page-wrapper pb-5">
            <Container fluid className="px-md-5">
                {/* ─── Back + Header ─── */}
                <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-5 mt-4">
                    <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                        <FaShieldAlt className="me-2" /> Authorized Clearance Node
                    </Badge>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
                        <div>
                            <h1 className="fw-black m-0 tracking-tighter text-bright" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1 }}>
                                Digital <span className="gradient-text">Pass</span>
                            </h1>
                            <p className="text-soft mt-3 mb-0 fw-medium">
                                Secure identifier for <span className="text-bright">{ticket?.event?.title}</span>
                            </p>
                        </div>
                        <div className="d-flex gap-3">
                            <Button
                                variant="primary"
                                onClick={handleDownload}
                                className="rounded-pill px-4 py-2 btn fw-medium"
                            >
                                <FaDownload className="me-2" /> Export PDF
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <Row className="justify-content-center">
                    <Col lg={8} xl={7}>
                        {/* ─── Ticket Card ─── */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.2, type: 'spring', damping: 20 }}
                        >
                            <div className="ticket-card shadow-2xl glass-panel border-white/10 rounded-5 overflow-hidden">
                                {/* Event Banner */}
                                <div className="position-relative" style={{ height: 260 }}>
                                    <img
                                        src={bannerUrl}
                                        alt={ticket?.event?.title}
                                        className="w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                    />
                                    {/* Gradient overlay */}
                                    <div
                                        className="position-absolute bottom-0 start-0 w-100"
                                        style={{
                                            height: '100%',
                                            background: 'linear-gradient(to top, #020617 0%, rgba(2,6,23,0.4) 60%, transparent 100%)',
                                        }}
                                    />
                                    {/* Title over image */}
                                    <div className="position-absolute bottom-0 start-0 w-100 p-5 align-items-end">
                                        <Badge bg="primary" className="mb-3 rounded-pill px-3 py-2 fw-black text-uppercase tracking-widest small shadow-lg">{ticket?.event?.category}</Badge>
                                        <h2 className="fw-black text-white mb-0 tracking-tightest display-5">{ticket?.event?.title}</h2>
                                    </div>
                                </div>

                                {/* Ticket Body */}
                                <div className="p-5">
                                    <Row className="g-4 mb-5 border-bottom border-white/5 pb-5">
                                        <Col sm={6}>
                                            <div className="small fw-black text-primary text-uppercase tracking-widest mb-2 opacity-60">Temporal Node</div>
                                            <div className="fw-black text-bright fs-5 d-flex align-items-center gap-3"><FaCalendarAlt className="text-soft" /> {ticket?.event?.date ? new Date(ticket.event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'N/A'}</div>
                                        </Col>
                                        <Col sm={6}>
                                            <div className="small fw-black text-primary text-uppercase tracking-widest mb-2 opacity-60">Phase Start</div>
                                            <div className="fw-black text-bright fs-5 d-flex align-items-center gap-3"><FaClock className="text-soft" /> {ticket?.event?.time || 'N/A'}</div>
                                        </Col>
                                        <Col xs={12}>
                                            <div className="small fw-black text-primary text-uppercase tracking-widest mb-2 opacity-60">Deployment Base</div>
                                            <div className="fw-black text-bright fs-5 d-flex align-items-center gap-3"><FaMapMarkerAlt className="text-soft" /> {ticket?.event?.venue || 'N/A'}</div>
                                        </Col>
                                    </Row>

                                    <div className="p-4 glass-card bg-primary-subtle rounded-4 mb-5 border border-primary-light/20 shadow-inner">
                                        <Row className="align-items-center">
                                            <Col xs={7}>
                                                <div className="small fw-black text-primary text-uppercase tracking-widest mb-2">Access Tier</div>
                                                <div className="fw-black text-bright h3 m-0 tracking-widest uppercase">{ticket?.booking?.ticketType || 'UNSPECIFIED'}</div>
                                                <div className="text-soft small fw-medium mt-1">{(ticket?.booking?.quantity || 0)} Unit{(ticket?.booking?.quantity || 0) > 1 ? 's' : ''} Allocated</div>
                                            </Col>
                                            <Col xs={5} className="text-end border-start border-white/10">
                                                <div className="small fw-black text-primary text-uppercase tracking-widest mb-2">Resonance</div>
                                                <div className="fw-black text-bright h3 m-0">₹{ticket?.booking?.totalAmount || 0}</div>
                                            </Col>
                                        </Row>
                                    </div>

                                    <div className="text-center mb-5">
                                        <div className="small fw-black text-primary text-uppercase tracking-widest mb-4 opacity-60">Biometric Verification Node</div>
                                        <motion.div whileHover={{ scale: 1.05 }} className="d-inline-block p-4 bg-white rounded-5 shadow-2xl mb-4 border border-white/10">
                                            <img src={qrCode} alt="QR Code" className="img-fluid" style={{ width: 220 }} />
                                        </motion.div>
                                        <div>
                                            <Badge bg="success-subtle" text="success" className="px-4 py-2 rounded-pill fw-black border border-success-light uppercase tracking-widest small">
                                                <FaCheckCircle className="me-2" /> Clearance Confirmed
                                            </Badge>
                                        </div>
                                    </div>

                                    <Button variant="primary" size="lg" className="w-100 py-md-4 rounded-pill d-flex align-items-center justify-content-center gap-3 mt-2 btn fw-medium px-4 py-2" onClick={handleDownload}>
                                        <FaDownload /> Download Identity Signature
                                    </Button>
                                </div>

                                <div className="bg-white/5 p-4 text-center text-soft small fw-black text-uppercase tracking-widest font-monospace opacity-30 border-top border-white/5">
                                    GU-V4.2 • SECURE ACCESS PROTOCOL • {(ticket?._id || 'N/A').toUpperCase()}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="mt-5 p-4 glass-panel rounded-5 border-white/5 shadow-2xl d-flex align-items-center gap-4"
                        >
                            <div className="bg-primary rounded-circle p-3 shadow-lg flex-shrink-0 animate-pulse"><FaIdCard size={20} className="text-white" /></div>
                            <div>
                                <h6 className="fw-black text-bright mb-1 uppercase tracking-widest">Entry Protocol</h6>
                                <p className="text-soft mb-0 small fw-medium opacity-80">Present this credential at the deployment base. Physical ID synchronization may be required for sector clearance.</p>
                            </div>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default TicketView;

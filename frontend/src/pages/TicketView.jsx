import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import * as ticketApi from '../api/ticketApi';
import * as bookingApi from '../api/bookingApi';
import { Container, Row, Col, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import {
    FaDownload, FaShieldAlt, FaIdCard, FaCreditCard, FaCheckCircle, FaEnvelope, FaRocket
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../css/premium-ticket.css';

const TicketView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [ticket, setTicket] = useState(null);
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paying, setPaying] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Check for success query param
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('success') === 'true') {
            setShowSuccess(true);
            // Trigger confetti
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [location]);

    const handlePayRemaining = () => {
        const bookingId = ticket?.booking?._id || ticket?.booking;
        if (!bookingId) return;
        navigate(`/remaining-payment/${bookingId}`);
    };

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

    const downloadTicketPDF = async () => {
        const element = document.getElementById("ticket-to-download");
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 3, 
                useCORS: true,
                backgroundColor: "#fff5f8",
                logging: false,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const imgWidth = pdfWidth - (margin * 2);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const yPos = (pdfHeight - imgHeight) / 2 > margin ? (pdfHeight - imgHeight) / 2 : margin;

            pdf.addImage(imgData, "PNG", margin, yPos, imgWidth, imgHeight);
            pdf.save(`Ticket-${id.substring(0, 8)}.pdf`);
        } catch (err) {
            console.error('Frontend PDF export failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center bg-deep-space" style={{ minHeight: '100vh' }}>
                <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <FaShieldAlt size={50} className="text-primary opacity-50 shadow-glow-sm" />
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
                        <Button variant="outline-danger" className="mt-3" onClick={() => navigate('/my-bookings')}>Return to Bookings</Button>
                    </Alert>
                </Container>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="premium-ticket-container pb-5">
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="success-celebration-overlay"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                            className="success-glass-card"
                        >
                            <div className="success-lighting" />
                            <div className="celebration-glow" style={{ top: '-10%', left: '-10%' }} />
                            <div className="celebration-glow" style={{ bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }} />
                            
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                                className="success-icon-wrapper"
                            >
                                <FaCheckCircle size={60} />
                            </motion.div>

                            <h1 className="success-title">Payment Completed!</h1>
                            <p className="success-desc">
                                Congratulations! Your full payment has been verified successfully. 
                                Your ticket has been sent to your email.
                            </p>

                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center justify-content-center gap-3 text-success fw-bold small uppercase tracking-widest">
                                    <FaEnvelope /> Ticket Dispatched to Email
                                </div>
                                <Button 
                                    className="futuristic-btn mt-4"
                                    onClick={() => {
                                        setShowSuccess(false);
                                        // Clean URL
                                        navigate(`/digital-pass/${id}`, { replace: true });
                                    }}
                                >
                                    <FaRocket className="me-2" /> View My Digital Pass
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Container fluid className="px-md-5">
                {/* ─── Back + Header ─── */}
                <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-5 mt-4">
                    <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                        <FaShieldAlt className="me-2" /> Authorized Clearance Node
                    </Badge>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
                        <div>
                            <h1 className="fw-black m-0 tracking-tighter text-bright" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1 }}>
                                Digital <span style={{ color: '#AD1457' }}>Pass</span>
                            </h1>
                            <p className="text-soft mt-3 mb-0 fw-medium">
                                Secure identifier for <span className="text-bright">{ticket?.event?.title}</span>
                            </p>
                        </div>
                        <div className="d-flex gap-3">
                            {((ticket?.amountPaid || ticket?.booking?.amountPaid || 0) >= (ticket?.totalAmount || ticket?.booking?.totalAmount || 0)) ? (
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={downloadTicketPDF}
                                        className="btn btn-pink"
                                    >
                                        <FaDownload className="me-2" /> Export PDF
                                    </Button>
                                </>
                            ) : (
                                <Badge bg="danger" className="rounded-pill px-4 py-2 d-flex align-items-center gap-2">
                                    <FaShieldAlt /> Payment Incomplete
                                </Badge>
                            )}
                        </div>
                    </div>
                </motion.div>

                <Row className="justify-content-center">
                    <Col lg={10} xl={9}>
                        {/* ─── Premium Event Pass Card ─── */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.2, type: 'spring', damping: 20 }}
                            className="d-flex flex-column align-items-center"
                        >
                            {(ticket?.amountPaid || ticket?.booking?.amountPaid || 0) < (ticket?.totalAmount || ticket?.booking?.totalAmount || 0) && (
                                <Alert variant="warning" className="w-100 mb-4 rounded-4 border-warning/20 bg-warning/10 text-warning fw-bold d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 p-4 shadow-lg">
                                    <div className="d-flex align-items-center gap-3">
                                        <FaShieldAlt className="fs-4 flex-shrink-0" />
                                        <div>
                                            ACCESS DENIED: Please pay the remaining balance of ₹{(ticket?.totalAmount || ticket?.booking?.totalAmount || 0) - (ticket?.amountPaid || ticket?.booking?.amountPaid || 0)} for entry clearance.
                                        </div>
                                    </div>
                                    <Button 
                                        className="btn btn-pink"
                                        onClick={handlePayRemaining}
                                    >
                                        <FaCreditCard className="me-2" /> Pay Remaining
                                    </Button>
                                </Alert>
                            )}
                            <div id="ticket-to-download" className="ticket-pass-card">
                                {/* Left Section: Brand & Event Details */}
                                <div className="ticket-pass-left">
                                    <div className="pass-logo">🎫</div>

                                    <div>
                                        <div className="pass-category">{ticket?.event?.category}</div>
                                        <h2 className="pass-title">{ticket?.event?.title}</h2>

                                        <div className="pass-info-row">
                                            <div className="pass-info-item">
                                                <span className="pass-info-label">Date</span>
                                                <span className="pass-info-value">
                                                    {ticket?.booking?.selectedDays && ticket.booking.selectedDays.length > 0
                                                        ? `${ticket.booking.selectedDays.length} Day(s) Selected`
                                                        : ((ticket?.booking?.selectedDate || ticket?.event?.date) ? new Date(ticket?.booking?.selectedDate || ticket.event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A')}
                                                </span>
                                            </div>
                                            <div className="pass-info-item">
                                                <span className="pass-info-label">Time</span>
                                                <span className="pass-info-value">{ticket?.event?.time || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="pass-info-item mb-4">
                                            <span className="pass-info-label">Venue</span>
                                            <span className="pass-info-value">{ticket?.event?.venue || 'N/A'}</span>
                                        </div>

                                        <div className="pass-info-item mb-4">
                                            <span className="pass-info-label">Validity</span>
                                            <span className="pass-info-value">
                                                <div className="fw-bold">VALID FOR: {(ticket?.selectedDays?.length || ticket?.booking?.selectedDays?.length) > 0 ? `${(ticket.selectedDays || ticket.booking.selectedDays).length} Days` : '1 Day'}</div>
                                                <div className="fw-bold mt-1" style={{ fontSize: '0.85em', opacity: 0.8 }}>
                                                    {(ticket?.selectedDays?.length || ticket?.booking?.selectedDays?.length) > 0 
                                                        ? `DATES: ${(ticket.selectedDays || ticket.booking.selectedDays).map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).join(', ')}`
                                                        : `DATE: ${new Date(ticket?.selectedDate || ticket?.booking?.selectedDate || ticket?.event?.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                                </div>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-end">
                                        <div className="pass-info-item">
                                            <span className="pass-info-label">Tier</span>
                                            <span className="pass-info-value" style={{ color: '#ec407a', fontSize: '1.2rem', fontWeight: 800 }}>
                                                {ticket?.booking?.ticketType || 'GEN'}
                                            </span>
                                        </div>
                                        <div className="text-white-50 font-monospace small opacity-50" style={{ fontSize: '0.6rem' }}>
                                            GU-X-{(ticket?._id || 'ID').slice(-8).toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Validation & Price */}
                                <div className="ticket-pass-right">
                                    <div className="ticket-pass-divider" />

                                    <div className="pass-qr-wrapper">
                                        <img src={qrCode} alt="Validation Code" className="pass-qr-image" />
                                    </div>

                                    <div className="text-center">
                                        <div className="pass-info-label mb-1">Pass Value</div>
                                        <div className="h4 fw-black text-white m-0">₹{ticket?.totalAmount || ticket?.booking?.totalAmount || 0}</div>
                                        <div className="mt-2 small fw-bold" style={{ color: (ticket?.amountPaid || ticket?.booking?.amountPaid || 0) >= (ticket?.totalAmount || ticket?.booking?.totalAmount || 0) ? '#4caf50' : '#ff9800' }}>
                                            Paid: ₹{ticket?.amountPaid || ticket?.booking?.amountPaid || 0}
                                        </div>
                                        <div className="mt-3">
                                            <Badge bg={(ticket?.amountPaid || ticket?.booking?.amountPaid || 0) >= (ticket?.totalAmount || ticket?.booking?.totalAmount || 0) ? 'success' : 'warning'} className="pass-badge">
                                                {(ticket?.amountPaid || ticket?.booking?.amountPaid || 0) >= (ticket?.totalAmount || ticket?.booking?.totalAmount || 0) ? 'Fully Paid' : 'Partial Payment'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="mt-5 p-4 glass-panel rounded-5 border-white/5 shadow-2xl d-flex align-items-center gap-4"
                            style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', color: '#333' }}
                        >
                            <div className="bg-primary rounded-circle p-3 shadow-lg flex-shrink-0 animate-pulse" style={{ background: '#ec407a' }}>
                                <FaIdCard size={20} className="text-white" />
                            </div>
                            <div className='bt-1'>
                                <h6 className="fw-black text-dark mb-1 uppercase tracking-widest" style={{ color: '#000000' }}>Entry Protocol</h6>
                                <p className="mb-0 small fw-medium opacity-80" style={{ color: '#000000' }}>Present this credential at the deployment base. Physical ID synchronization may be required for sector clearance.</p>
                            </div>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default TicketView;

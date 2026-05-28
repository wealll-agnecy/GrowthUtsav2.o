import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as ticketApi from '../api/ticketApi';
import { Badge, Spinner, Row, Col } from 'react-bootstrap';
import { 
    FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaTicketAlt, 
    FaExclamationTriangle, FaMapMarkerAlt, FaChair, FaPhoneAlt, FaEnvelope, FaClock 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyTicket = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id || id === 'undefined') {
            console.error("[CLIENT]: Detected invalid 'undefined' verification ID in URL");
            setError("Invalid verification ticket ID. Signature could not be verified.");
            setLoading(false);
            return;
        }

        const verify = async () => {
            try {
                // Fetch high-fidelity verification data
                const res = await ticketApi.verifyTicketForScanner(id);
                setResult(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Access Denied: Ticket signature not found.');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [id]);

    if (loading) {
        return (
            <div className="vh-100 vw-100 d-flex flex-column align-items-center justify-content-center bg-white">
                <motion.div animate={{ scale: [1, 1.1, 1], rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
                    <div className="p-4 rounded-circle bg-primary shadow-glow">
                        <FaTicketAlt size={40} className="text-white" />
                    </div>
                </motion.div>
                <div className="mt-4 text-secondary fw-black tracking-widest uppercase opacity-40 small">Syncing Clearance Node...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="vh-100 vw-100 d-flex align-items-center justify-content-center bg-white p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-100 max-w-500">
                    <div className="glass-card border-danger/20 text-center p-5 rounded-5 shadow-2xl bg-white">
                        <FaTimesCircle size={80} className="text-danger mb-4 shadow-glow mx-auto" />
                        <h1 className="text-dark fw-black display-6 tracking-tightest mb-3 uppercase">INVALID</h1>
                        <p className="text-secondary fs-5 mb-0 font-bold">{error}</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    const { data: ticket, message, isDuplicate } = result;
    
    const amountPaid = ticket.amountPaid || 0;
    const totalAmount = ticket.totalAmount || 0;
    const remainingAmount = ticket.remainingAmount || 0;
    const paymentStatus = (ticket.paymentStatus || 'PENDING').toUpperCase();

    const isFullyPaid = amountPaid >= totalAmount || paymentStatus === 'COMPLETED' || paymentStatus === 'PAID';
    const isBlocked = result.status === 'DENIED' || !isFullyPaid;
    const isSuccess = !isDuplicate && !isBlocked;

    const headerBgClass = isBlocked ? 'bg-danger' : isDuplicate ? 'bg-warning' : 'bg-success';

    return (
        <div className="vh-100 vw-100 bg-light-rose overflow-hidden d-flex align-items-center justify-content-center p-3 p-md-0">
            <AnimatePresence mode="wait">
                <motion.div
                    key={ticket.ticketId}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="w-100 max-w-500"
                >
                    <div className="glass-card border-dark/5 rounded-5 overflow-hidden shadow-2xl bg-white">
                        {/* Native App Style Header */}
                        <div className={`p-4 p-md-5 text-center position-relative ${headerBgClass}`}>
                            <div className="position-relative z-index-1">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    {isBlocked ? (
                                        <FaTimesCircle size={80} className="text-white mb-3 shadow-glow" />
                                    ) : isDuplicate ? (
                                        <FaExclamationTriangle size={80} className="text-white mb-3 shadow-glow" />
                                    ) : (
                                        <FaCheckCircle size={80} className="text-white mb-3 shadow-glow" />
                                    )}
                                </motion.div>
                                <h1 className="text-white fw-black display-5 tracking-tighter mb-1 uppercase">
                                    {isBlocked ? 'ACCESS DENIED ❌' : isDuplicate ? 'ALREADY USED ❌' : 'VALID PASS'}
                                </h1>
                                <p className="text-white fw-black uppercase tracking-widest opacity-80 small m-0 font-bold">
                                    {message}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 p-md-5 bg-white">
                            {/* Attendee Name Header */}
                            <div className="text-center mb-5">
                                <span className="text-primary small fw-black uppercase tracking-widest mb-1 d-block opacity-60">Credential Holder</span>
                                <h1 className="text-dark fw-black display-4 m-0 tracking-tightest text-uppercase">{ticket.name}</h1>
                            </div>

                            <Row className="g-3 mb-4">
                                <Col xs={12}>
                                    <div className="p-4 bg-light rounded-4 border border-dark/5 shadow-inner">
                                        <span className="text-secondary small fw-black uppercase tracking-widest mb-2 d-block opacity-50">Event Node</span>
                                        <div className="text-dark fw-black h4 m-0 d-flex align-items-center gap-3">
                                            <FaMapMarkerAlt className="text-primary" /> {ticket.eventName}
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12}>
                                    <div className="p-4 bg-light rounded-4 border border-dark/5 shadow-inner">
                                        <span className="text-secondary small fw-black uppercase tracking-widest mb-2 d-block opacity-50">Validity</span>
                                        <div className="text-dark fw-bold d-flex flex-column gap-1">
                                            <div className="fs-5">VALID FOR: {ticket.selectedDays?.length > 0 ? `${ticket.selectedDays.length} Days` : '1 Day'}</div>
                                            <div className="small opacity-75 mt-1">
                                                {ticket.selectedDays?.length > 0 
                                                    ? `DATES: ${ticket.selectedDays.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).join(', ')}`
                                                    : `DATE: ${new Date(ticket.selectedDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12}>
                                    <div className="p-4 bg-light rounded-4 border border-dark/5 shadow-inner">
                                        <span className="text-secondary small fw-black uppercase tracking-widest mb-2 d-block opacity-50">Plan Node</span>
                                        <div className="text-pink fw-black h4 m-0 d-flex align-items-center gap-3">
                                            <FaTicketAlt /> {ticket.ticketTier || 'General'}
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={12}>
                                    <div className="p-4 bg-light rounded-4 border border-dark/5 shadow-inner d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="text-secondary small fw-black uppercase tracking-widest mb-2 d-block opacity-50">Payment Status</span>
                                            <div className="text-dark fw-bold d-flex flex-column gap-1">
                                                <div className="fs-5">
                                                    Paid: ₹{amountPaid} / ₹{totalAmount}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge bg={isFullyPaid ? 'success' : paymentStatus === 'PARTIAL' ? 'warning' : 'danger'} className="rounded-pill px-4 py-2 fw-black tracking-widest uppercase">
                                            {isFullyPaid ? 'Paid' : paymentStatus === 'PARTIAL' ? 'Partial' : 'Pending'}
                                        </Badge>
                                    </div>
                                </Col>

                                {!isFullyPaid && (
                                    <Col xs={12}>
                                        <div className="p-4 bg-danger bg-opacity-10 rounded-4 border border-danger border-opacity-20 shadow-inner">
                                            <span className="text-danger small fw-black uppercase tracking-widest mb-2 d-block opacity-70">⚠️ Outstanding Balance</span>
                                            <div className="text-danger fw-black h5 m-0">
                                                ₹{remainingAmount} payment remaining. Entry is blocked.
                                            </div>
                                        </div>
                                    </Col>
                                )}

                                {/* GROUP TICKET LOGIC: Display persons allowed */}
                                {ticket.personsAllowed && ticket.personsAllowed > 1 && (
                                    <Col xs={12}>
                                        <div className="p-4 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-20 shadow-inner">
                                            <span className="text-success small fw-black uppercase tracking-widest mb-2 d-block opacity-70">👥 Group Booking</span>
                                            <div className="text-success fw-black h5 m-0">
                                                {ticket.personsAllowed} Person{ticket.personsAllowed > 1 ? 's' : ''} Allowed Entry
                                            </div>
                                        </div>
                                    </Col>
                                )}

                                <Col xs={12}>
                                    <div className="p-4 bg-light rounded-4 border border-dark/5 shadow-inner">
                                        <span className="text-secondary small fw-black uppercase tracking-widest mb-2 d-block opacity-50">Booking Synchronization</span>
                                        <div className="text-dark fw-bold d-flex align-items-center gap-3">
                                            <FaClock className="text-primary" /> {new Date(ticket.bookedAt).toLocaleString(undefined, {
                                                year: 'numeric', month: '2-digit', day: '2-digit',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Contact & Seat Info */}
                            <div className="p-4 glass-panel rounded-4 border-dark/5 mb-5 shadow-inner bg-light">
                                <Row className="align-items-center g-3">
                                    <Col xs={12}>
                                        <div className="d-flex align-items-center gap-3">
                                            <FaEnvelope className="text-primary" />
                                            <span className="text-secondary small font-bold">{ticket.email}</span>
                                        </div>
                                    </Col>
                                    <Col xs={12}>
                                        <div className="d-flex align-items-center gap-3">
                                            <FaPhoneAlt className="text-success" />
                                            <span className="text-secondary small font-bold">{ticket.phone}</span>
                                        </div>
                                    </Col>
                                    <Col xs={12} className="border-top border-dark/5 pt-2 mt-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <FaChair className="text-warning" />
                                            <span className="text-secondary small font-bold text-uppercase tracking-widest">{ticket.seat} Sector</span>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            <div className="d-flex justify-content-between align-items-center pt-2">
                                <div>
                                    <span className="text-secondary small fw-black uppercase tracking-widest d-block opacity-40">Identifier</span>
                                    <span className="text-primary fw-black h5 m-0 font-bold tracking-widest">{ticket.ticketCode}</span>
                                </div>
                                <Badge className={`rounded-pill px-4 py-2 fw-black tracking-widest uppercase shadow-glow ${isSuccess ? 'bg-primary' : 'bg-warning'}`}>
                                    {ticket.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default VerifyTicket;

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { Container, Button, Badge, Row, Col } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaBackward, FaQrcode } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './StaffScanner.css';

const StaffScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [loading, setLoading] = useState(false);
    
    // Audio feedback refs
    const successAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'));
    const errorAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'));

    useEffect(() => {
        let scanner = null;
        
        if (isScanning && !scanResult) {
            scanner = new Html5QrcodeScanner('reader', {
                qrbox: { width: 280, height: 280 },
                fps: 20,
                rememberLastUsedCamera: true,
                aspectRatio: 1.0
            });

            scanner.render(onScanSuccess, onScanError);
        }

        async function onScanSuccess(result) {
            console.log("Captured Sequence:", result);
            if (scanner) {
                try {
                    await scanner.clear();
                } catch (e) {
                    console.warn("Scanner clear failed", e);
                }
            }
            handleVerification(result);
        }

        function onScanError(err) {
            // Silent error for continuous scan
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(error => console.error("Scanner cleanup failure", error));
            }
        };
    }, [isScanning, scanResult]);

    const handleVerification = async (qrUrl) => {
        setLoading(true);
        setIsScanning(false);
        try {
            const segments = qrUrl.split('/');
            const ticketId = segments[segments.length - 1] || segments[segments.length - 2];
            
            const res = await axios.post('/api/v1/tickets/verify-scan', { ticketId });
            const data = res.data;

            if (data.status === 'GRANTED') {
                successAudio.current.play().catch(() => {});
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            } else {
                errorAudio.current.play().catch(() => {});
                if (navigator.vibrate) navigator.vibrate(300);
            }

            setScanResult(data);
        } catch (err) {
            console.error("Verification Error:", err);
            errorAudio.current.play().catch(() => {});
            setScanResult({ 
                status: 'INVALID', 
                message: err.response?.data?.message || 'Verification system failure.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setIsScanning(true);
    };

    return (
        <div className="scanner-page">
            <Container>
                <div className="d-flex justify-content-between align-items-center w-100 max-w-500 mx-auto mb-4">
                    <Link to="/staff/dashboard" className="text-decoration-none text-muted small fw-bold">
                        <FaBackward className="me-2" /> EXIT
                    </Link>
                    <Badge bg={isScanning ? "success" : "secondary"} className="rounded-pill px-3 py-2">
                        {isScanning ? "SENSOR ACTIVE" : "PAUSED"}
                    </Badge>
                </div>

                <h2 className="scanner-title text-center">Scan Ticket</h2>

                <AnimatePresence mode="wait">
                    {!scanResult ? (
                        <motion.div 
                            key="scanner"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-100 d-flex justify-content-center"
                        >
                            <div className="scanner-box">
                                <div className="scanner-corner top-left"></div>
                                <div className="scanner-corner top-right"></div>
                                <div className="scanner-corner bottom-left"></div>
                                <div className="scanner-corner bottom-right"></div>
                                <div id="reader" style={{ width: '100%' }}></div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="scan-result-card mx-auto"
                        >
                            <div className={`status-badge ${scanResult.status === 'GRANTED' ? 'green' : 'red'}`}>
                                {scanResult.status === 'GRANTED' ? (
                                    <><FaCheckCircle className="me-2" /> GRANTED</>
                                ) : (
                                    <><FaTimesCircle className="me-2" /> DENIED</>
                                )}
                            </div>

                            {scanResult.ticket && (
                                <>
                                    <div className="attendee-name">{scanResult.ticket.user?.name || scanResult.ticket.name}</div>
                                    <div className="attendee-detail mb-4">{scanResult.ticket.user?.email || scanResult.ticket.email}</div>

                                    <div className="info-grid text-start">
                                        <div>
                                            <div className="info-label">Event</div>
                                            <div className="info-value text-truncate">{scanResult.ticket.event?.title || scanResult.ticket.eventName}</div>
                                        </div>
                                        <div>
                                            <div className="info-label">Payment Status</div>
                                            <div className="info-value">
                                                <Badge bg={scanResult.ticket.paymentStatus === 'PAID' ? 'success' : 'warning'} className="rounded-pill px-2">
                                                    {scanResult.ticket.paymentStatus || 'N/A'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="info-label">Total / Paid</div>
                                            <div className="info-value text-success">
                                                ₹{scanResult.ticket.amountPaid || 0} / ₹{scanResult.ticket.totalAmount || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="info-label">Remaining</div>
                                            <div className="info-value text-danger">
                                                ₹{(scanResult.ticket.totalAmount || 0) - (scanResult.ticket.amountPaid || 0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="info-label">Type</div>
                                            <div className="info-value">{scanResult.ticket.ticketType}</div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {!scanResult.ticket && (
                                <div className="py-4">
                                    <div className="h5 fw-bold text-danger mb-2">Invalid Sequence</div>
                                    <p className="text-muted small">{scanResult.message}</p>
                                </div>
                            )}

                            <button className="next-btn" onClick={resetScanner}>
                                NEXT SCAN
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="text-center mt-5 opacity-25">
                    <FaQrcode size={40} />
                    <div className="x-small fw-bold mt-2 uppercase tracking-widest">GrowthUtsav Terminal v2.0</div>
                </div>
            </Container>
        </div>
    );
};

export default StaffScanner;

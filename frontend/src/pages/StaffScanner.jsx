import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { playSound } from '../utils/soundManager';
import { Container, Button, Badge, Row, Col } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaBackward, FaQrcode } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './StaffScanner.css';

const StaffScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [loading, setLoading] = useState(false);
    const [scannerError, setScannerError] = useState(null);
    const isProcessingRef = useRef(false);

    const onScanSuccess = useCallback(async (result) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        
        console.log("Captured Sequence:", result);
        handleVerification(result);
    }, []); // Removed handleVerification as dependency to keep it stable

    const onScanError = useCallback((err) => {
        // Continuous scanning
    }, []);

    const handleVerification = async (qrUrl) => {
        setLoading(true);
        setIsScanning(false);
        try {
            const segments = qrUrl.split('/');
            const ticketId = segments[segments.length - 1] || segments[segments.length - 2];
            
            const res = await axios.post('/api/v1/tickets/verify-scan', { ticketId });
            const data = res.data;

            if (data.status === 'GRANTED') {
                playSound('scanSuccess');
                try {
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                } catch (vErr) {
                    console.debug("Vibration blocked or unavailable");
                }
            } else {
                playSound('scanDenied');
                try {
                    if (navigator.vibrate) navigator.vibrate(300);
                } catch (vErr) {
                    console.debug("Vibration blocked or unavailable");
                }
            }

            // Log entry for Recent Entries table (Persistent across pages)
            try {
                const ticket = data.ticket || {};
                
                // BACKEND MAPPING FIX: Use correct field names from details object
                const totalAmount = ticket.ticketPrice || ticket.totalAmount || ticket.amount || 0;
                const paidAmount = ticket.paidAmount || ticket.amountPaid || 0;
                const dueAmount = totalAmount - paidAmount;
                const planName = ticket.ticketTier || ticket.selectedPlan || ticket.planName || 'N/A';
                const actualTicketId = ticket.ticketId || ticket._id || 'N/A';

                let paymentStatus = "";
                if (paidAmount <= 0) {
                    paymentStatus = "UNPAID";
                } else if (dueAmount <= 0) {
                    paymentStatus = "FULLY PAID";
                } else {
                    paymentStatus = "PARTIAL";
                }

                // STRICT VALIDATION BLOCK
                const msg = (data.message || "").toLowerCase();
                
                const alreadyScanned = msg.includes("already") || msg.includes("used");
                const isValidTicket = data.status !== "ACCESS DENIED — Invalid ticket" && data.message !== "This identifier does not match any registered ticket.";
                const isExpired = ticket.event?.date && new Date(ticket.event.date) < new Date().setHours(0,0,0,0);
                const paymentDue = ticket.remainingAmount || 0;

                let finalStatus = "";
                let finalReason = "";

                if (alreadyScanned === true) {
                    finalStatus = "DENIED";
                    finalReason = "Already Scanned";
                }
                else if (isValidTicket === false) {
                    finalStatus = "DENIED";
                    finalReason = "False Ticket";
                }
                else if (isExpired === true) {
                    finalStatus = "DENIED";
                    finalReason = "Expired Ticket";
                }
                else if (paymentDue > 0) {
                    finalStatus = "DENIED";
                    finalReason = "Payment Due";
                }
                else {
                    finalStatus = "GRANTED";
                    finalReason = "Valid Ticket";
                }

                const newEntry = {
                    name: ticket.name || (ticket.user?.name) || 'Unknown',
                    event: ticket.eventName || (ticket.event?.title) || 'N/A',
                    total: totalAmount,
                    paid: paidAmount,
                    due: Math.max(dueAmount, 0),
                    status: finalStatus,
                    paymentStatus: paymentStatus,
                    selectedPlan: planName,
                    reason: finalReason,
                    time: new Date().toLocaleTimeString()
                };
                const existing = JSON.parse(localStorage.getItem('recent_scans') || '[]');
                localStorage.setItem('recent_scans', JSON.stringify([newEntry, ...existing].slice(0, 50)));
                
                // Final Assignment to scanResult data
                data.status = finalStatus;
                data.reason = finalReason;
                data.ticket = {
                    ...ticket,
                    _id: actualTicketId,
                    totalAmount,
                    paidAmount,
                    selectedPlan: planName,
                    dueAmount: Math.max(dueAmount, 0)
                };

                setScanResult(data);
            } catch (e) {
                console.error("Local Storage Log Error:", e);
            }
        } catch (err) {
            console.error("Verification Error:", err);
            playSound('error');
            setScanResult({ 
                status: 'DENIED', 
                reason: 'False Ticket',
                message: err.response?.data?.message || 'Verification system failure.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        isProcessingRef.current = false;
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
                            <ScannerView 
                                onScanSuccess={onScanSuccess} 
                                onScanError={onScanError}
                                scannerError={scannerError}
                                setScannerError={setScannerError}
                            />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="scan-result-wrapper"
                        >
                            <div className="scan-status">
                                <h2 className={scanResult.status === 'GRANTED' ? 'green' : 'red'}>
                                    {scanResult.status === 'GRANTED' ? (
                                        <><FaCheckCircle /> Access Granted</>
                                    ) : (
                                        <><FaTimesCircle /> Access Denied</>
                                    )}
                                </h2>
                            </div>

                            <div className="attendee-card">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h3>{scanResult.ticket?.user?.name || scanResult.ticket?.name || 'Unknown Attendee'}</h3>
                                        <p className="m-0">{scanResult.ticket?.user?.email || scanResult.ticket?.email || 'No email provided'}</p>
                                    </div>
                                    <div className={`scan-reason ${scanResult.reason?.toLowerCase().replace(' ', '-')}`}>
                                        {scanResult.reason}
                                    </div>
                                </div>

                                <div className="info-row">
                                    <span>Event</span>
                                    <b>{scanResult.ticket?.event?.title || scanResult.ticket?.eventName || 'N/A'}</b>
                                </div>

                                <div className="info-row">
                                    <span>Selected Plan</span>
                                    <b className="text-pink">{scanResult.ticket?.selectedPlan || scanResult.ticket?.planName || 'N/A'}</b>
                                </div>

                                <div className="info-row">
                                    <span>Amount Paid</span>
                                    <b>₹{scanResult.ticket?.amountPaid || 0}</b>
                                </div>

                                <div className="info-row">
                                    <span>Ticket ID</span>
                                    <b style={{ fontSize: '10px' }}>{scanResult.ticket?._id || 'N/A'}</b>
                                </div>

                                <div className="info-row">
                                    <span>Status</span>
                                    <b className={scanResult.ticket?.isScanned ? "red" : "green"}>
                                        {scanResult.ticket?.isScanned ? "Already Scanned" : "Valid"}
                                    </b>
                                </div>

                                {!scanResult.ticket && (
                                    <div className="mt-3 text-center">
                                        <p className="text-danger small fw-bold">{scanResult.message}</p>
                                    </div>
                                )}

                                <button className="next-btn" onClick={resetScanner}>
                                    Next Scan
                                </button>
                            </div>
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

// --- Helper Components ---
const ScannerView = ({ onScanSuccess, onScanError, scannerError, setScannerError }) => {
    const scannerRef = useRef(null);
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (hasInitializedRef.current) return;
        
        const readerElement = document.getElementById('reader');
        if (!readerElement) {
            console.warn("Scanner reader element not found in DOM");
            return;
        }

        let html5QrCode;
        try {
            html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;
            hasInitializedRef.current = true;
        } catch (e) {
            console.error("Failed to create Html5Qrcode instance", e);
            return;
        }

        const startScanner = async () => {
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    onScanSuccess,
                    onScanError
                );
            } catch (err) {
                console.error("Scanner start error:", err);
                // Fallback to front camera
                try {
                    await html5QrCode.start(
                        { facingMode: "user" },
                        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                        onScanSuccess,
                        onScanError
                    );
                } catch (fallbackErr) {
                    console.error("Total scanner failure:", fallbackErr);
                    setScannerError("Camera access failed. Please ensure permissions are granted and you are using HTTPS.");
                }
            }
        };

        const timer = setTimeout(startScanner, 300);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                const scannerInstance = scannerRef.current;
                const stopScanner = async () => {
                    try {
                        if (scannerInstance.isScanning) {
                            await scannerInstance.stop();
                        }
                    } catch (e) {
                        console.warn("Scanner cleanup stop failed", e);
                    }
                };
                stopScanner();
                scannerRef.current = null;
                hasInitializedRef.current = false;
            }
        };
    }, [onScanSuccess, onScanError, setScannerError]);

    return (
        <div className="scanner-box">
            <div className="scanner-corner top-left"></div>
            <div className="scanner-corner top-right"></div>
            <div className="scanner-corner bottom-left"></div>
            <div className="scanner-corner bottom-right"></div>
            
            {scannerError ? (
                <div className="scanner-error-overlay">
                    <FaTimesCircle size={40} className="mb-3 text-danger" />
                    <p>{scannerError}</p>
                    <Button variant="outline-light" size="sm" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            ) : (
                <div id="reader" style={{ width: '100%' }}></div>
            )}
        </div>
    );
};

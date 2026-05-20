import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import apiClient from '../api/apiClient';
import { playSound } from '../utils/soundManager';
import { Container, Button, Badge, Row, Col, Form } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaBackward, FaQrcode } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './StaffScanner.css';
import { formatCurrency } from '../utils/formatUtils';

const StaffScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [loading, setLoading] = useState(false);
    const [scannerError, setScannerError] = useState(null);
    const isProcessingRef = useRef(false);
    const [updatingFood, setUpdatingFood] = useState(false);
    const [updatingParking, setUpdatingParking] = useState(false);

    const handleFoodToggleUpdate = async (e) => {
        if (!scanResult || !scanResult.ticket || scanResult.ticket.foodTaken) return;
        setUpdatingFood(true);
        try {
            const ticketId = scanResult.ticket._id;
            const res = await apiClient.post('/api/v1/tickets/update-food', { ticketId });
            if (res.data.success) {
                toast.success('Food access marked as taken!');
                setScanResult(prev => ({
                    ...prev,
                    ticket: {
                        ...prev.ticket,
                        foodTaken: true
                    }
                }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update food access.');
        } finally {
            setUpdatingFood(false);
        }
    };

    const handleParkingToggleUpdate = async (e) => {
        if (!scanResult || !scanResult.ticket || scanResult.ticket.parkingUsed) return;
        setUpdatingParking(true);
        try {
            const ticketId = scanResult.ticket._id;
            const res = await apiClient.post('/api/v1/tickets/update-parking', { ticketId });
            if (res.data.success) {
                toast.success('Parking access marked as used!');
                setScanResult(prev => ({
                    ...prev,
                    ticket: {
                        ...prev.ticket,
                        parkingUsed: true
                    }
                }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update parking access.');
        } finally {
            setUpdatingParking(false);
        }
    };

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
            
            const res = await apiClient.post('/api/v1/tickets/verify-scan', { ticketId });
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
                                    <b>{formatCurrency(scanResult.ticket?.amountPaid || 0)}</b>
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

                                {/* --- New Food & Parking Access Tracking --- */}
                                {scanResult.ticket && (
                                    <div className="mt-4 pt-3 border-top border-pink border-opacity-10 d-flex flex-column gap-3">
                                        {/* Food Row */}
                                        <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 border">
                                            <div className="d-flex align-items-center gap-3">
                                                <div 
                                                    className={`d-flex justify-content-center align-items-center rounded-circle ${
                                                        scanResult.ticket.foodTaken ? 'bg-secondary text-white' : 'bg-pink text-white'
                                                    }`} 
                                                    style={{ width: '36px', height: '36px' }}
                                                >
                                                    <span style={{ fontSize: '16px' }}>🍔</span>
                                                </div>
                                                <div className="d-flex flex-column text-start">
                                                    <span className="fw-bold small text-dark">Food</span>
                                                    <span className={`x-small fw-bold ${scanResult.ticket.foodTaken ? 'text-secondary' : 'text-success'}`}>
                                                        {scanResult.ticket.foodTaken ? 'Food is already taken' : 'Food Available'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <Form.Check 
                                                    type="switch"
                                                    id="food-access-toggle"
                                                    checked={scanResult.ticket.foodTaken}
                                                    disabled={scanResult.ticket.foodTaken || updatingFood}
                                                    onChange={handleFoodToggleUpdate}
                                                />
                                            </div>
                                        </div>

                                        {/* Parking Row */}
                                        <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 border">
                                            <div className="d-flex align-items-center gap-3">
                                                <div 
                                                    className={`d-flex justify-content-center align-items-center rounded-circle ${
                                                        scanResult.ticket.parkingUsed ? 'bg-secondary text-white' : 'bg-pink text-white'
                                                    }`} 
                                                    style={{ width: '36px', height: '36px' }}
                                                >
                                                    <span style={{ fontSize: '16px' }}>🚗</span>
                                                </div>
                                                <div className="d-flex flex-column text-start">
                                                    <span className="fw-bold small text-dark">Parking</span>
                                                    <span className={`x-small fw-bold ${scanResult.ticket.parkingUsed ? 'text-secondary' : 'text-success'}`}>
                                                        {scanResult.ticket.parkingUsed ? 'Parking is already done' : 'Parking Available'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <Form.Check 
                                                    type="switch"
                                                    id="parking-access-toggle"
                                                    checked={scanResult.ticket.parkingUsed}
                                                    disabled={scanResult.ticket.parkingUsed || updatingParking}
                                                    onChange={handleParkingToggleUpdate}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

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

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { Container, Button, Card, Badge } from 'react-bootstrap';
import { FaCamera, FaHistory, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaBackward } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const StaffScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [loading, setLoading] = useState(false);
    
    // Audio feedback refs
    const successAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'));
    const errorAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'));

    useEffect(() => {
        let scanner = null;
        
        if (isScanning) {
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
    }, [isScanning]);

    const handleVerification = async (qrUrl) => {
        setLoading(true);
        setIsScanning(false);
        try {
            // Robust extraction: get the last segment of the URL
            // Works for: https://domain/ticket/ID or just ID
            const segments = qrUrl.split('/');
            const ticketId = segments[segments.length - 1] || segments[segments.length - 2];
            
            console.log("Verifying ID:", ticketId);
            const res = await axios.get(`/api/v1/tickets/verify/${ticketId}`);
            const data = res.data;

            if (data.status === 'VALID') {
                successAudio.current.play().catch(() => {});
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            } else {
                errorAudio.current.play().catch(() => {});
                if (navigator.vibrate) navigator.vibrate(300);
            }

            setScanResult(data);

            // AUTO RESET PROTOCOL
            setTimeout(() => {
                resetScanner();
            }, 4000);

        } catch (err) {
            console.error("Verification Error:", err);
            errorAudio.current.play().catch(() => {});
            setScanResult({ 
                status: 'INVALID', 
                message: err.response?.data?.message || 'Biometric identifier breach detected.' 
            });
            
            // Auto-reset even on error
            setTimeout(() => {
                resetScanner();
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setIsScanning(true);
    };

    return (
        <div className="bg-black vh-100 vw-100 overflow-hidden d-flex flex-column">
            {/* Header Hub */}
            <div className="p-3 d-flex justify-content-between align-items-center bg-dark/50 backdrop-blur z-3">
                <Link to="/staff/dashboard" className="btn btn-outline-light rounded-pill px-4 py-2 small fw-bold tracking-widest text-uppercase border-white/20">
                    <FaBackward className="me-2" /> Exit Terminal
                </Link>
                <div className="d-flex align-items-center gap-3">
                    <div className={`status-indicator ${isScanning ? 'pulse-green' : 'pulse-amber'}`}></div>
                    <Badge bg="primary" className="rounded-pill px-3 py-2 fw-black uppercase tracking-widest shadow-glow">
                        SCANNER_ACTIVE_v5.4
                    </Badge>
                </div>
            </div>

            {/* Main Scanner Node */}
            <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3 relative bg-deep-space">
                {isScanning ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-100 max-w-500">
                        <div className="text-center mb-5">
                            <div className="h4 text-white fw-black tracking-widest uppercase mb-2">Target Recognition Active</div>
                            <div className="text-white-50 x-small fw-bold opacity-60 tracking-tighter">ALIGN QR CODE WITHIN THE ILLUMINATED BOUNDS</div>
                        </div>
                        <div className="scanner-container position-relative">
                            <div id="reader" className="scanner-frame glass-card border-white/10 overflow-hidden shadow-2xl rounded-5 bg-black/40"></div>
                            {/* Scanning Animation Overlays */}
                            <div className="scanner-laser"></div>
                        </div>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="wait">
                        {scanResult && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`vh-100 vw-100 fixed-top z-index-1050 d-flex align-items-center justify-content-center p-4 ${
                                    scanResult.status === 'VALID' ? 'bg-success' : 'bg-danger'
                                }`}
                                style={{ transition: 'background-color 0.5s ease' }}
                            >
                                <div className="max-w-500 w-100 text-center text-white">
                                    <motion.div
                                        initial={{ y: 50, scale: 0.9, opacity: 0 }}
                                        animate={{ y: 0, scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', damping: 15 }}
                                    >
                                        <div className="mb-5">
                                            {scanResult.status === 'VALID' ? (
                                                <div className="result-icon-wrapper success">
                                                    <FaCheckCircle size={120} className="shadow-glow" />
                                                </div>
                                            ) : (
                                                <div className="result-icon-wrapper danger">
                                                    {scanResult.status === 'USED' ? <FaExclamationTriangle size={120} className="shadow-glow" /> : <FaTimesCircle size={120} className="shadow-glow" />}
                                                </div>
                                            )}
                                        </div>

                                        <h1 className="display-2 fw-black tracking-tightest mb-2 uppercase">
                                            {scanResult.status === 'VALID' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                                        </h1>
                                        <div className="h3 fw-bold opacity-90 mb-5 tracking-widest uppercase">
                                            {scanResult.status === 'VALID' ? 'Clear for Entry ✅' : (scanResult.status === 'USED' ? 'ALREADY SCANNED ❌' : 'INVALID TICKET ❌')}
                                        </div>

                                        {scanResult.ticket && (
                                            <div className="glass-panel text-start p-5 rounded-5 mb-5 border-white/20 shadow-2xl backdrop-blur-3xl bg-white/10">
                                                <div className="mb-4 border-bottom border-white/10 pb-4">
                                                    <div className="x-small fw-black uppercase tracking-widest opacity-60 mb-1">Credential Holder</div>
                                                    <div className="h1 m-0 fw-black tracking-tight">{scanResult.ticket.name}</div>
                                                    <div className="text-white-50 small font-monospace">{scanResult.ticket.email}</div>
                                                </div>
                                                <div className="d-flex flex-column gap-4">
                                                    <div>
                                                        <div className="x-small fw-black uppercase tracking-widest opacity-60 mb-1">Deployment Location</div>
                                                        <div className="fw-bold fs-4">{scanResult.ticket.eventName}</div>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <div className="x-small fw-black uppercase tracking-widest opacity-60 mb-1">Access Tier</div>
                                                            <div className="fw-black fs-5 text-primary-light">{scanResult.ticket.ticketType}</div>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="x-small fw-black uppercase tracking-widest opacity-60 mb-1">Status</div>
                                                            <Badge bg={scanResult.status === 'VALID' ? 'primary' : 'warning'} className="px-3 py-2 rounded-pill uppercase tracking-widest">
                                                                {scanResult.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-5 pt-4">
                                            <div className="text-white-50 small fw-bold tracking-widest uppercase mb-3 opacity-60">System will auto-reset in 5 seconds</div>
                                            <Button 
                                                variant="light" 
                                                size="lg" 
                                                onClick={resetScanner}
                                                className="rounded-pill btn fw-medium px-4 py-2"
                                            >
                                                Manual Reset
                                            </Button>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer Intel */}
            <div className="p-4 text-center">
                <div className="text-white-50 x-small fw-black uppercase tracking-widest opacity-20 font-monospace">
                    SECURE HUB NODE: {window.location.hostname.toUpperCase()} // STATUS: ONLINE
                </div>
            </div>
        </div>
    );
};

export default StaffScanner;

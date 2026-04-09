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
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: { width: 300, height: 300 },
            fps: 10,
        });

        scanner.render(onScanSuccess, onScanError);

        function onScanSuccess(result) {
            // Check if scanning is paused for a result
            if (!isScanning) return;
            
            console.log("Captured Sequence:", result);
            handleVerification(result);
            scanner.clear(); // Clear scanner to show results
        }

        function onScanError(err) {
            // Silent error for continuous scan
        }

        return () => {
             scanner.clear().catch(error => console.error("Scanner cleanup failure", error));
        };
    }, [isScanning]);

    const handleVerification = async (qrUrl) => {
        setLoading(true);
        setIsScanning(false);
        try {
            // Extract UUID/ID from URL
            // Format: https://yourdomain.com/ticket/:id
            const ticketId = qrUrl.split('/').pop();
            
            const res = await axios.get(`/api/v1/tickets/verify/${ticketId}`);
            const data = res.data;

            if (data.status === 'VALID') {
                successAudio.current.play();
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            } else {
                errorAudio.current.play();
                if (navigator.vibrate) navigator.vibrate(200);
            }

            setScanResult(data);
        } catch (err) {
            errorAudio.current.play();
            setScanResult({ 
                status: 'INVALID', 
                message: err.response?.data?.message || 'Biometric identifier breach detected.' 
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
        <div className="bg-black vh-100 vw-100 overflow-hidden d-flex flex-column">
            {/* Header Hub */}
            <div className="p-4 d-flex justify-content-between align-items-center bg-dark/50 backdrop-blur">
                <Link to="/staff/dashboard" className="btn btn-outline-light rounded-pill px-4 py-2 small fw-black tracking-widest text-uppercase">
                    <FaBackward className="me-2" /> Exit Terminal
                </Link>
                <Badge bg="primary" className="rounded-pill px-3 py-2 fw-black uppercase tracking-widest shadow-glow">
                    ACCESS_CONTROL_v5.3
                </Badge>
            </div>

            {/* Main Scanner Node */}
            <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3 relative">
                {isScanning ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-100 max-w-500">
                        <div className="text-center mb-4">
                            <div className="h4 text-white fw-black tracking-widest uppercase">Target Recognition Active</div>
                            <div className="text-white-50 x-small fw-bold opacity-40">POSITION QR SIGNATURE WITHIN FRAME</div>
                        </div>
                        <div id="reader" className="scanner-frame glass-card border-white/10 overflow-hidden shadow-2xl rounded-5"></div>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        {scanResult && (
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }}
                                className={`vh-100 vw-100 fixed-top z-index-1050 d-flex align-items-center justify-content-center p-4 ${
                                    scanResult.status === 'VALID' ? 'bg-success' : 'bg-danger'
                                }`}
                            >
                                <div className="max-w-500 w-100 text-center text-white">
                                    <motion.div
                                        initial={{ y: 20 }}
                                        animate={{ y: 0 }}
                                    >
                                        {scanResult.status === 'VALID' ? (
                                            <FaCheckCircle size={100} className="mb-4 shadow-glow" />
                                        ) : scanResult.status === 'USED' ? (
                                            <FaExclamationTriangle size={100} className="mb-4 shadow-glow" />
                                        ) : (
                                            <FaTimesCircle size={100} className="mb-4 shadow-glow" />
                                        )}

                                        <h1 className="display-3 fw-black tracking-tightest mb-2 uppercase">
                                            {scanResult.status === 'VALID' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                                        </h1>
                                        <div className="h4 fw-bold opacity-80 mb-5 tracking-widest uppercase">
                                            {scanResult.message}
                                        </div>

                                        {scanResult.ticket && (
                                            <div className="glass-panel text-start p-4 rounded-5 mb-5 border-white/20 shadow-2xl backdrop-blur-3xl">
                                                <div className="mb-3 border-bottom border-white/10 pb-3">
                                                    <div className="x-small fw-black uppercase tracking-widest opacity-60">Credential Holder</div>
                                                    <div className="h2 m-0 fw-black tracking-tight">{scanResult.ticket.name}</div>
                                                </div>
                                                <div className="d-flex gap-4">
                                                    <div className="flex-grow-1">
                                                        <div className="x-small fw-black uppercase tracking-widest opacity-60">Deployment</div>
                                                        <div className="fw-bold fs-5">{scanResult.ticket.eventName}</div>
                                                    </div>
                                                    <div>
                                                        <div className="x-small fw-black uppercase tracking-widest opacity-60">Sector</div>
                                                        <div className="fw-bold fs-5">{scanResult.ticket.ticketType}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <Button 
                                            variant="light" 
                                            size="lg" 
                                            onClick={resetScanner}
                                            className="rounded-pill px-5 py-3 fw-black uppercase tracking-widest shadow-2xl"
                                        >
                                            IDENTIFY NEXT TARGET
                                        </Button>
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

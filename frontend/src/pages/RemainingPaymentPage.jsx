import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as bookingApi from "../api/bookingApi";
import toast from "react-hot-toast";
import { playSound } from "../utils/soundManager";

const RemainingPaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [partialAmount, setPartialAmount] = useState("");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                setLoading(true);
                const res = await bookingApi.getMyBookings();
                const found = res.data.data.find(b => b._id === bookingId);
                if (!found) {
                    toast.error("Booking node not found");
                    navigate('/my-bookings');
                    return;
                }
                setBooking(found);
            } catch (err) {
                console.error("Booking Fetch Error:", err);
                toast.error("Failed to synchronize booking data");
            } finally {
                setLoading(false);
            }
        };
        fetchBookingData();
    }, [bookingId, navigate]);

    const initiatePaymentFlow = async (amount) => {
        try {
            setProcessing(true);
            const loadToast = toast.loading(`Initiating payment for ₹${amount}...`);

            // 1. Initiate Order
            await bookingApi.initiateInstallment(bookingId, amount);

            // 2. Verify Payment (Using existing Demo/Razorpay integration flow)
            const verifyRes = await bookingApi.verifyInstallment({
                bookingId: bookingId,
                amount: amount,
                razorpay_payment_id: "REMAINING_PAY_" + Date.now(),
                razorpay_order_id: "ORDER_" + Date.now()
            });

            if (verifyRes.data.success) {
                playSound('paymentSuccess');
                toast.success("Payment Verified! Synchronization complete.", { id: loadToast });
                // Return to digital pass to see updated status
                if (booking.ticketId) {
                    setTimeout(() => navigate(`/digital-pass/${booking.ticketId}?success=true`), 1000);
                } else {
                    setTimeout(() => navigate('/my-bookings'), 1000);
                }
            }
        } catch (err) {
            console.error("Payment Flow Error:", err);
            toast.error(err.response?.data?.message || "Payment protocol failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleFullPayment = () => {
        const due = Math.max((booking.totalAmount || 0) - (booking.amountPaid || 0), 0);
        if (due <= 0) {
            toast.error("No outstanding balance detected");
            return;
        }
        initiatePaymentFlow(due);
    };

    const handlePartialPayment = () => {
        const amount = Number(partialAmount);
        const due = Math.max((booking.totalAmount || 0) - (booking.amountPaid || 0), 0);

        if (!amount || amount <= 0) {
            toast.error("Please enter a valid partial amount");
            return;
        }

        if (amount > due) {
            toast.error(`Amount exceeds the remaining due of ₹${due}`);
            return;
        }

        initiatePaymentFlow(amount);
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#fff1f2" }}>
                <div style={{ fontWeight: "bold", color: "#ec4899" }}>Synchronizing Payment Node...</div>
            </div>
        );
    }

    if (!booking) return null;

    const totalAmount = booking.totalAmount || 0;
    const paidAmount = booking.amountPaid || 0;
    const dueAmount = Math.max(totalAmount - paidAmount, 0);

    return (
        <div className="payment-page">
            <div className="payment-card">
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ background: "none", border: "none", color: "#64748b", marginBottom: "20px", fontWeight: "600", cursor: "pointer" }}
                >
                    ← Back
                </button>

                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                    Complete Your Remaining Payment
                </h2>
                <p style={{ color: "#64748b", marginBottom: "24px" }}>
                    Choose how you want to settle your outstanding balance.
                </p>

                <div className="amount-box">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "600", color: "#475569" }}>Total Amount:</span>
                        <span style={{ fontWeight: "800" }}>₹{totalAmount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "600", color: "#475569" }}>Paid So Far:</span>
                        <span style={{ fontWeight: "800", color: "#16a34a" }}>₹{paidAmount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(236,72,153,0.1)", paddingTop: "12px", marginTop: "4px" }}>
                        <span style={{ fontWeight: "700", color: "#0f172a" }}>Remaining Due:</span>
                        <span style={{ fontWeight: "900", color: "#dc2626", fontSize: "1.2rem" }}>₹{dueAmount}</span>
                    </div>
                </div>

                <div style={{ marginTop: "32px" }}>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#475569", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Option 1: Full Payment
                    </h4>
                    <button 
                        className="payment-btn" 
                        onClick={handleFullPayment}
                        disabled={processing || dueAmount <= 0}
                    >
                        {processing ? "Processing..." : `Pay Full Due Amount (₹${dueAmount})`}
                    </button>
                </div>

                <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #f1f5f9" }}>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#475569", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Option 2: Partial Payment
                    </h4>
                    
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontWeight: "bold", color: "#94a3b8" }}>₹</span>
                        <input
                            type="number"
                            placeholder="Enter amount"
                            value={partialAmount}
                            onChange={(e) => setPartialAmount(e.target.value)}
                            style={{ 
                                width: "100%", 
                                height: "54px", 
                                padding: "0 16px 0 32px", 
                                borderRadius: "16px", 
                                border: "2px solid #f1f5f9", 
                                background: "#f8fafc",
                                fontSize: "1rem",
                                fontWeight: "600",
                                outline: "none",
                                transition: "0.2s"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#ec4899"}
                            onBlur={(e) => e.target.style.borderColor = "#f1f5f9"}
                        />
                    </div>

                    <button 
                        className="payment-btn" 
                        style={{ background: "#fff", color: "#ec4899", border: "2px solid #ec4899", marginTop: "16px" }}
                        onClick={handlePartialPayment}
                        disabled={processing || !partialAmount}
                    >
                        {processing ? "Processing..." : "Pay Partial Amount"}
                    </button>
                </div>
            </div>

            <style>{`
                .payment-page {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #fff1f2;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                .payment-card {
                    width: 100%;
                    max-width: 480px;
                    background: #fff;
                    padding: 40px;
                    border-radius: 32px;
                    box-shadow: 0 25px 50px -12px rgba(236, 72, 153, 0.15);
                }
                .amount-box {
                    margin: 24px 0;
                    padding: 24px;
                    border-radius: 20px;
                    background: rgba(236,72,153,0.04);
                }
                .payment-btn {
                    width: 100%;
                    height: 56px;
                    border: none;
                    border-radius: 16px;
                    background: #ec4899;
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .payment-btn:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.05);
                    box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3);
                }
                .payment-btn:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

export default RemainingPaymentPage;

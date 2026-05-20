import { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import apiClient from '../api/apiClient';
import { FaTicketAlt, FaWallet, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../css/dashboard.css';
import { formatCurrency } from '../utils/formatUtils';
 
const OrganizerBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
 
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await apiClient.get('/api/v1/organizer/bookings');
                setBookings(res.data.data);
            } catch (err) {
                setError('Failed to load bookings.');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    const totalExpected = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalCollected = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
    const totalPending = totalExpected - totalCollected;

    return (
        <div className="dashboard-page">
            <Container fluid className="px-md-5">
                <div className="dashboard-header mb-5">
                    <h2 className="dashboard-title-main">Attendee Bookings</h2>
                    <p className="dashboard-subtext">Monitor ticket sales and payment collection status.</p>
                </div>

                <div className="stats-grid-saas mb-5">
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Gross Sales</span>
                        <h3 className="card-value-lg">{formatCurrency(totalExpected)}</h3>
                    </div>
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Collected</span>
                        <h3 className="card-value-lg text-success">{formatCurrency(totalCollected)}</h3>
                    </div>
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Pending Dues</span>
                        <h3 className="card-value-lg text-warning">{formatCurrency(totalPending)}</h3>
                    </div>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <div className="dashboard-card shadow-sm d-none d-lg-block">
                    <div className="table-responsive rounded-4 border overflow-hidden shadow-sm">
                        <Table hover className="m-0 align-middle text-nowrap">
                            <thead className="bg-light">
                                <tr className="small text-uppercase fw-bold text-slate tracking-widest">
                                    <th className="px-4 py-3">Attendee</th>
                                    <th className="py-3">Event</th>
                                    <th className="py-3">Payment Progress</th>
                                    <th className="py-3">Status</th>
                                    <th className="px-4 py-3 text-end">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking._id} className="border-bottom border-slate-100">
                                        <td className="px-4 py-3">
                                            <div className="fw-bold">{booking.user?.name || 'Unknown'}</div>
                                            <div className="tiny-text text-muted">{booking.user?.email}</div>
                                        </td>
                                        <td className="py-3 small">
                                            <div className="fw-bold">{booking.event?.title}</div>
                                            <div className="tiny-text text-muted">{new Date(booking.event?.date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="py-3" style={{ minWidth: '180px' }}>
                                            <div className="d-flex justify-content-between mb-1 tiny-text fw-bold">
                                                <span>{formatCurrency(booking.amountPaid || 0)} Paid</span>
                                                <span className="text-danger">{formatCurrency(booking.totalAmount - (booking.amountPaid || 0))} Due</span>
                                            </div>
                                            {(() => {
                                                const paidAmount = booking.amountPaid || 0;
                                                const totalAmount = booking.totalAmount || 1;
                                                const progress = Math.min((paidAmount / totalAmount) * 100, 100);
                                                return (
                                                    <div className="payment-progress-wrapper">
                                                        <div className="payment-progress-track">
                                                            <div
                                                                className={`payment-progress-fill ${progress >= 100 ? 'full' : 'partial'}`}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                            <div className="tiny-text text-muted">Total: {formatCurrency(booking.totalAmount)}</div>
                                        </td>
                                        <td className="py-3">
                                            {(booking.amountPaid || 0) >= booking.totalAmount ? (
                                                <Badge bg="success" className="px-3 py-2 rounded-pill uppercase tracking-widest small shadow-sm">
                                                    PAID
                                                </Badge>
                                            ) : (
                                                <Badge bg="warning" className="text-dark px-3 py-2 rounded-pill uppercase tracking-widest small shadow-sm">
                                                    PARTIAL
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-end fw-black h5 m-0">
                                            {formatCurrency(booking.totalAmount)}
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">No bookings detected in sector.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>

                {/* Mobile View: Premium Vertical Cards */}
                <div className="d-lg-none d-flex flex-column gap-3 mb-5">
                    {bookings.map((booking) => {
                        const paidAmount = booking.amountPaid || 0;
                        const totalAmount = booking.totalAmount || 1;
                        const progress = Math.min((paidAmount / totalAmount) * 100, 100);
                        const isPaid = paidAmount >= totalAmount;

                        return (
                            <Card key={booking._id} className="border-0 rounded-4 p-4 shadow-sm bg-white position-relative overflow-hidden">
                                {/* Accent gradient top border */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #ee749f, #a855f7)'
                                }} />
                                
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <div className="fw-bold text-dark fs-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                            {booking.user?.name || 'Unknown'}
                                        </div>
                                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{booking.user?.email}</div>
                                    </div>
                                    {isPaid ? (
                                        <Badge bg="success" className="px-3 py-2 rounded-pill uppercase tracking-widest small shadow-sm" style={{ fontSize: '0.65rem', fontWeight: '700' }}>
                                            PAID
                                        </Badge>
                                    ) : (
                                        <Badge bg="warning" className="text-dark px-3 py-2 rounded-pill uppercase tracking-widest small shadow-sm" style={{ fontSize: '0.65rem', fontWeight: '700' }}>
                                            PARTIAL
                                        </Badge>
                                    )}
                                </div>

                                <div className="border-top border-bottom py-3 my-2" style={{ borderColor: '#f1f5f9 !important' }}>
                                    <div className="text-muted small fw-bold text-uppercase tracking-wider mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                        Event Details
                                    </div>
                                    <div className="fw-bold text-secondary" style={{ fontFamily: 'Outfit, sans-serif' }}>{booking.event?.title}</div>
                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                        {new Date(booking.event?.date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="text-muted small fw-bold text-uppercase tracking-wider mb-2" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                        Payment Progress
                                    </div>
                                    <div className="d-flex justify-content-between mb-1 tiny-text fw-bold">
                                        <span>{formatCurrency(paidAmount)} Paid</span>
                                        <span className="text-danger">{formatCurrency(totalAmount - paidAmount)} Due</span>
                                    </div>
                                    <div className="payment-progress-wrapper mb-2">
                                        <div className="payment-progress-track">
                                            <div
                                                className={`payment-progress-fill ${isPaid ? 'full' : 'partial'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center pt-2">
                                    <span className="text-muted fw-bold" style={{ fontSize: '0.85rem' }}>Total Expected:</span>
                                    <span className="h4 m-0 fw-black text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatCurrency(booking.totalAmount)}</span>
                                </div>
                            </Card>
                        );
                    })}
                    {bookings.length === 0 && (
                        <Card className="border-0 rounded-4 p-5 text-center shadow-sm bg-white">
                            <div className="text-muted py-3">No bookings detected in sector.</div>
                        </Card>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default OrganizerBookings;

import { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
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
                const res = await axios.get('/api/v1/organizer/bookings');
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

                <div className="dashboard-card shadow-sm">
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
                                            <div className="progress mb-1" style={{ height: '6px', borderRadius: '10px' }}>
                                                <div 
                                                    className={`progress-bar ${(booking.amountPaid || 0) >= booking.totalAmount ? 'bg-success' : 'bg-warning'}`} 
                                                    role="progressbar" 
                                                    style={{ width: `${((booking.amountPaid || 0) / booking.totalAmount) * 100}%` }}
                                                ></div>
                                            </div>
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
            </Container>
        </div>
    );
};

export default OrganizerBookings;

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { FaUsers, FaQrcode } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import '../css/dashboard.css';
import { formatCurrency } from '../utils/formatUtils';

const StaffDashboard = () => {
    const [attendees, setAttendees] = useState([]);
    const [recentEntries, setRecentEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAttendees = async () => {
        try {
            // Load from LocalStorage first for instant results
            const saved = localStorage.getItem('recent_scans');
            if (saved) setRecentEntries(JSON.parse(saved));

            const res = await apiClient.get('/api/v1/organizer/bookings');
            setAttendees(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch attendees', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendees();
    }, []);

    return (
        <div className="staff-dashboard min-vh-100 py-5" style={{ background: '#f8f9fa' }}>
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-black text-dark mb-1">Staff Panel</h2>
                        <p className="text-muted small">Event Entry & Verification System</p>
                    </div>
                    <Button 
                        as={Link} 
                        to="/staff/scanner" 
                        variant="pink" 
                        className="rounded-pill px-4 py-2 fw-bold shadow-sm"
                    >
                        <FaQrcode className="me-2" /> Open Scanner
                    </Button>
                </div>

                <Row className="g-4">
                    <Col lg={12}>
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                            <Card.Header className="bg-white py-3 border-bottom-0 d-flex align-items-center">
                                <FaUsers className="text-pink me-2" />
                                <h5 className="m-0 fw-bold">Recent Entries</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive d-none d-lg-block">
                                    <Table hover className="m-0 align-middle">
                                        <thead className="bg-light">
                                            <tr className="small text-uppercase fw-bold text-muted">
                                                <th className="px-4 py-3">Attendee</th>
                                                <th className="py-3">Event</th>
                                                <th className="py-3">Payment</th>
                                                <th className="py-3">Status</th>
                                                <th className="py-3">Plan</th>
                                                <th className="py-3">Reason</th>
                                                <th className="text-end px-4 py-3">Scan Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentEntries.length > 0 ? (
                                                recentEntries.map((item, index) => {
                                                    const total = item.total || 0;
                                                    const paid = item.paid || 0;
                                                    const due = Math.max(total - paid, 0);
                                                    
                                                    const isFullyPaid = paid >= total && total > 0;
                                                    const isPartial = paid > 0 && paid < total;
 
                                                    return (
                                                        <tr key={index}>
                                                            <td className="px-4 py-3">
                                                                <div className="fw-bold">{item.name}</div>
                                                            </td>
                                                            <td className="py-3 small">{item.event}</td>
                                                            <td className="py-3">
                                                                <div className="payment-box">
                                                                    <h6 className="m-0 fw-bold">{formatCurrency(paid)} / {formatCurrency(total)}</h6>
                                                                    <p className="m-0 tiny-text text-muted">Due: {isFullyPaid ? formatCurrency(0) : formatCurrency(due)}</p>
                                                                    {isFullyPaid ? (
                                                                        <span className="paid-status full">FULLY PAID</span>
                                                                    ) : isPartial ? (
                                                                        <span className="paid-status partial">PARTIAL</span>
                                                                    ) : (
                                                                        <span className="paid-status unpaid">UNPAID</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-3">
                                                                <span className={item.status === 'GRANTED' ? 'green' : 'red'}>
                                                                    {item.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-3">
                                                                <span className="plan-badge">
                                                                    {item.selectedPlan || item.planName || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3">
                                                                <div className={`scan-reason ${item.reason?.toLowerCase().replace(' ', '-')}`}>
                                                                    {item.reason || 'Valid Ticket'}
                                                                </div>
                                                            </td>
                                                            <td className="text-end px-4 py-3 small text-muted">
                                                                {item.time}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                attendees.filter(a => a.status === 'used' || a.isScanned).slice(0, 10).map((attendee) => {
                                                    const total = attendee.totalAmount || 0;
                                                    const paid = attendee.amountPaid || 0;
                                                    const due = Math.max(total - paid, 0);
 
                                                    const isFullyPaid = paid >= total && total > 0;
                                                    const isPartial = paid > 0 && paid < total;
 
                                                    return (
                                                        <tr key={attendee._id}>
                                                            <td className="px-4 py-3">
                                                                <div className="fw-bold">{attendee.name || attendee.user?.name || attendee.attendeeDetails?.[0]?.name}</div>
                                                                <div className="small text-muted">{attendee.email || attendee.user?.email || attendee.attendeeDetails?.[0]?.email}</div>
                                                            </td>
                                                            <td className="py-3 small">{attendee.eventName || attendee.event?.title}</td>
                                                            <td className="py-3">
                                                                <div className="payment-box">
                                                                    <h6 className="m-0 fw-bold">{formatCurrency(paid)} / {formatCurrency(total)}</h6>
                                                                    <p className="m-0 tiny-text text-muted">Due: {isFullyPaid ? formatCurrency(0) : formatCurrency(due)}</p>
                                                                    {isFullyPaid ? (
                                                                        <span className="paid-status full">FULLY PAID</span>
                                                                    ) : isPartial ? (
                                                                        <span className="paid-status partial">PARTIAL</span>
                                                                    ) : (
                                                                        <span className="paid-status unpaid">UNPAID</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-3">
                                                                <Badge bg="primary-subtle" className="text-primary rounded-pill px-3">
                                                                    SCANNED
                                                                </Badge>
                                                            </td>
                                                            <td className="py-3">
                                                                <span className="plan-badge">
                                                                    {attendee.selectedPlan || attendee.planName || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3">
                                                                <div className="scan-reason valid-ticket">
                                                                    Valid Ticket
                                                                </div>
                                                            </td>
                                                            <td className="text-end px-4 py-3 small text-muted">
                                                                {attendee.scannedAt ? new Date(attendee.scannedAt).toLocaleTimeString() : 'N/A'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                            {recentEntries.length === 0 && attendees.length === 0 && !loading && (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-5 text-muted">No entries processed yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>

                                {/* Mobile Scanned Entries View */}
                                <div className="d-lg-none p-3">
                                    <div className="d-flex flex-column gap-3">
                                        {recentEntries.length > 0 ? (
                                            recentEntries.map((item, index) => {
                                                const total = item.total || 0;
                                                const paid = item.paid || 0;
                                                const due = Math.max(total - paid, 0);
                                                
                                                const isFullyPaid = paid >= total && total > 0;
                                                const isPartial = paid > 0 && paid < total;

                                                return (
                                                    <Card key={index} className="border-0 shadow-sm rounded-4 p-3 bg-light/30 mobile-scan-card">
                                                        <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-slate-100">
                                                            <div>
                                                                <h6 className="mb-0 fw-black text-dark" style={{ fontSize: '0.95rem' }}>{item.name}</h6>
                                                                <span className="small text-secondary fw-semibold uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>
                                                                    {item.event}
                                                                </span>
                                                            </div>
                                                            <span className={item.status === 'GRANTED' ? 'badge bg-success-subtle text-success px-3 py-1.5 rounded-pill fw-bold' : 'badge bg-danger-subtle text-danger px-3 py-1.5 rounded-pill fw-bold'} style={{ fontSize: '0.75rem' }}>
                                                                {item.status}
                                                            </span>
                                                        </div>

                                                        <div className="d-flex flex-column gap-2 mb-3">
                                                            <div className="d-flex align-items-center justify-content-between small text-secondary fw-medium">
                                                                <span>Plan Tier:</span>
                                                                <span className="plan-badge m-0 px-2.5 py-1 rounded fw-bold text-dark bg-slate-100" style={{ fontSize: '0.7rem' }}>
                                                                    {item.selectedPlan || item.planName || 'Standard'}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex align-items-center justify-content-between small text-secondary fw-medium">
                                                                <span>Scan Result:</span>
                                                                <span className={`scan-reason ${item.reason?.toLowerCase().replace(' ', '-')} m-0 px-2 py-0.5 rounded fw-bold`} style={{ fontSize: '0.7rem' }}>
                                                                    {item.reason || 'Valid Ticket'}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex align-items-center justify-content-between small text-secondary fw-medium">
                                                                <span>Scan Time:</span>
                                                                <span className="fw-semibold">{item.time}</span>
                                                            </div>
                                                        </div>

                                                        <div className="d-flex align-items-center justify-content-between pt-2.5 border-top border-slate-100 bg-slate-50/50 p-2 rounded-3">
                                                            <div>
                                                                <span className="text-secondary small fw-bold text-uppercase d-block mb-0.5" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>Paid / Total</span>
                                                                <div className="small text-secondary fw-bold">{formatCurrency(paid)} / {formatCurrency(total)}</div>
                                                            </div>
                                                            <div className="text-end">
                                                                <span className="text-secondary small fw-bold text-uppercase d-block mb-0.5" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>Payment Status</span>
                                                                {isFullyPaid ? (
                                                                    <span className="paid-status full px-2 py-0.5 rounded fw-bold bg-success-subtle text-success" style={{ fontSize: '0.65rem' }}>FULLY PAID</span>
                                                                ) : isPartial ? (
                                                                    <span className="paid-status partial px-2 py-0.5 rounded fw-bold bg-warning-subtle text-warning" style={{ fontSize: '0.65rem' }}>PARTIAL</span>
                                                                ) : (
                                                                    <span className="paid-status unpaid px-2 py-0.5 rounded fw-bold bg-danger-subtle text-danger" style={{ fontSize: '0.65rem' }}>UNPAID</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })
                                        ) : (
                                            attendees.filter(a => a.status === 'used' || a.isScanned).slice(0, 10).map((attendee) => {
                                                const total = attendee.totalAmount || 0;
                                                const paid = attendee.amountPaid || 0;
                                                const due = Math.max(total - paid, 0);

                                                const isFullyPaid = paid >= total && total > 0;
                                                const isPartial = paid > 0 && paid < total;

                                                return (
                                                    <Card key={attendee._id} className="border-0 shadow-sm rounded-4 p-3 bg-light/30 mobile-scan-card">
                                                        <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-slate-100">
                                                            <div className="overflow-hidden">
                                                                <h6 className="mb-0 fw-black text-dark text-truncate" style={{ fontSize: '0.95rem' }}>{attendee.name || attendee.user?.name || attendee.attendeeDetails?.[0]?.name}</h6>
                                                                <span className="small text-secondary fw-semibold uppercase tracking-wider text-truncate d-block" style={{ fontSize: '0.7rem' }}>
                                                                    {attendee.eventName || attendee.event?.title}
                                                                </span>
                                                            </div>
                                                            <Badge bg="primary-subtle" className="text-primary rounded-pill px-3 py-1.5 fw-bold flex-shrink-0" style={{ fontSize: '0.7rem' }}>
                                                                SCANNED
                                                            </Badge>
                                                        </div>

                                                        <div className="d-flex flex-column gap-2 mb-3">
                                                            <div className="d-flex align-items-center justify-content-between small text-secondary fw-medium">
                                                                <span>Plan Tier:</span>
                                                                <span className="plan-badge m-0 px-2.5 py-1 rounded fw-bold text-dark bg-slate-100" style={{ fontSize: '0.7rem' }}>
                                                                    {attendee.selectedPlan || attendee.planName || 'Standard'}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex align-items-center justify-content-between small text-secondary fw-medium">
                                                                <span>Scan Result:</span>
                                                                <span className="scan-reason valid-ticket m-0 px-2 py-0.5 rounded fw-bold" style={{ fontSize: '0.7rem' }}>
                                                                    Valid Ticket
                                                                </span>
                                                            </div>
                                                            <div className="d-flex align-items-center justify-content-between small text-secondary fw-medium">
                                                                <span>Scan Time:</span>
                                                                <span className="fw-semibold">
                                                                    {attendee.scannedAt ? new Date(attendee.scannedAt).toLocaleTimeString() : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="d-flex align-items-center justify-content-between pt-2.5 border-top border-slate-100 bg-slate-50/50 p-2 rounded-3">
                                                            <div>
                                                                <span className="text-secondary small fw-bold text-uppercase d-block mb-0.5" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>Paid / Total</span>
                                                                <div className="small text-secondary fw-bold">{formatCurrency(paid)} / {formatCurrency(total)}</div>
                                                            </div>
                                                            <div className="text-end">
                                                                <span className="text-secondary small fw-bold text-uppercase d-block mb-0.5" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>Payment Status</span>
                                                                {isFullyPaid ? (
                                                                    <span className="paid-status full px-2 py-0.5 rounded fw-bold bg-success-subtle text-success" style={{ fontSize: '0.65rem' }}>FULLY PAID</span>
                                                                ) : isPartial ? (
                                                                    <span className="paid-status partial px-2 py-0.5 rounded fw-bold bg-warning-subtle text-warning" style={{ fontSize: '0.65rem' }}>PARTIAL</span>
                                                                ) : (
                                                                    <span className="paid-status unpaid px-2 py-0.5 rounded fw-bold bg-danger-subtle text-danger" style={{ fontSize: '0.65rem' }}>UNPAID</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })
                                        )}
                                        {recentEntries.length === 0 && attendees.length === 0 && !loading && (
                                            <div className="text-center py-5 text-muted">No entries processed yet.</div>
                                        )}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default StaffDashboard;

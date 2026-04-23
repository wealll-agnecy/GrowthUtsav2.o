import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { FaUsers, FaQrcode } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StaffDashboard = () => {
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAttendees = async () => {
        try {
            const res = await axios.get('/api/v1/organizer/bookings');
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
                                <div className="table-responsive">
                                    <Table hover className="m-0 align-middle">
                                        <thead className="bg-light">
                                            <tr className="small text-uppercase fw-bold text-muted">
                                                <th className="px-4 py-3">Attendee</th>
                                                <th className="py-3">Event</th>
                                                <th className="py-3">Payment</th>
                                                <th className="py-3">Status</th>
                                                <th className="text-end px-4 py-3">Scan Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendees.filter(a => a.status === 'used' || a.isScanned).slice(0, 10).map((attendee) => (
                                                <tr key={attendee._id}>
                                                    <td className="px-4 py-3">
                                                        <div className="fw-bold">{attendee.name || attendee.user?.name || attendee.attendeeDetails?.[0]?.name}</div>
                                                        <div className="small text-muted">{attendee.email || attendee.user?.email || attendee.attendeeDetails?.[0]?.email}</div>
                                                    </td>
                                                    <td className="py-3 small">{attendee.eventName || attendee.event?.title}</td>
                                                    <td className="py-3">
                                                        <div className="tiny-text fw-bold mb-1">₹{attendee.amountPaid || 0} Paid</div>
                                                        <Badge bg={attendee.paymentStatus === 'PAID' ? 'success' : 'warning'} className="rounded-pill">
                                                            {attendee.paymentStatus || 'PARTIAL'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge bg="primary-subtle" className="text-primary rounded-pill px-3">
                                                            SCANNED
                                                        </Badge>
                                                    </td>
                                                    <td className="text-end px-4 py-3 small text-muted">
                                                        {attendee.scannedAt ? new Date(attendee.scannedAt).toLocaleTimeString() : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {attendees.length === 0 && !loading && (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-5 text-muted">No entries processed yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
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

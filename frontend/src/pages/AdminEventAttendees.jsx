
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaTicketAlt, FaCalendarDay, FaWallet, FaArrowLeft, FaSearch, FaUsers } from 'react-icons/fa';
import * as analyticsApi from '../api/analyticsApi';
import toast from 'react-hot-toast';
import '../css/AdminStyles.css';

const AdminEventAttendees = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        if (!eventId || eventId === 'undefined') {
            setLoading(false);
            return;
        }
        const fetchAttendees = async () => {
            try {
                const res = await analyticsApi.getEventAttendees(eventId);
                const rawData = res.data?.data || [];
                // Since a booking can have multiple attendees, we flatten them
                const flattened = rawData.flatMap(booking => 
                    (booking.attendeeDetails || []).map(attendee => ({
                        ...attendee,
                        ticketType: booking.ticketType || 'N/A',
                        plan: booking.selectedPlans?.label || booking.selectedPlans?.name || 'Standard',
                        totalAmount: booking.totalAmount || 0,
                        amountPaid: booking.amountPaid || 0,
                        paymentStatus: booking.paymentStatus || 'unknown',
                        orderId: booking.orderId || 'N/A',
                        bookingId: booking._id,
                        bookingDate: booking.createdAt
                    }))
                );
                setAttendees(flattened);
            } catch (err) {
                console.error('Error fetching attendees:', err);
                toast.error('Failed to load attendee list');
            } finally {
                setLoading(false);
            }
        };
        fetchAttendees();
    }, [eventId]);

    const filteredAttendees = attendees.filter(a => {
        const matchesSearch = a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             a.phone?.includes(searchTerm);
        
        const matchesFilter = filterType === 'all' || a.plan?.toLowerCase() === filterType;
        
        return matchesSearch && matchesFilter;
    });

    const silverCount = attendees.filter(a => a.plan?.toLowerCase() === 'silver').length;
    const goldCount = attendees.filter(a => a.plan?.toLowerCase() === 'gold').length;
    const platinumCount = attendees.filter(a => a.plan?.toLowerCase() === 'platinum').length;

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-premium-light">
                <Spinner animation="border" variant="pink" />
            </div>
        );
    }

    return (
        <div className="dashboard-page bg-premium-light pb-5">
            <Container fluid className="px-md-5 py-4">
                {/* Header Section */}
                <div className="mb-5 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
                    <div className="d-flex align-items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="avatar-gradient-pink rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm transition-premium hover-translate-y text-white"
                            style={{ width: '56px', height: '56px', flexShrink: 0 }}
                        >
                            <FaArrowLeft size={20} style={{ color: 'white' }} />
                        </button>
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="badge-pink-soft px-3 py-1 rounded-pill small fw-bold text-uppercase tracking-wider">Attendee Registry</span>
                            </div>
                             <h2 className="dashboard-title-main text-dark fw-black tracking-tighter m-0 d-flex align-items-center gap-3" style={{ fontSize: '2.2rem' }}>
                                 <FaUsers className="text-pink d-none d-lg-inline-flex" /> Event Guests
                             </h2>
                        </div>
                    </div>
                    
                    <div className="admin-search-wrapper position-relative">
                        <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                        <input 
                            type="text" 
                            className="form-control ps-5 py-3 rounded-pill border-0 shadow-sm" 
                            placeholder="" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ minWidth: '350px' }}
                        />
                    </div>
                </div>

                {/* Statistics Summary */}
                <Row className="mb-4 g-3">
                    <Col xs={6} md={6} lg>
                        <Card 
                            className={`border-0 shadow-sm rounded-4 p-3 bg-white h-100 cursor-pointer attendee-stat-card transition-all ${filterType === 'all' ? 'ring-pink' : ''}`}
                            onClick={() => setFilterType('all')}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="icon-box-premium rounded-4 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <FaUsers size={18} />
                                </div>
                                <div>
                                    <h6 className="text-secondary tiny-text fw-bold text-uppercase mb-1">Attendees</h6>
                                    <h5 className="fw-black mb-0">{attendees.length}</h5>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={6} md={6} lg>
                        <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100 attendee-stat-card">
                            <div className="d-flex align-items-center gap-3">
                                <div className="icon-box-premium rounded-4 d-flex align-items-center justify-content-center bg-success-subtle text-success" style={{ width: '45px', height: '45px' }}>
                                    <FaWallet size={18} />
                                </div>
                                <div>
                                    <h6 className="text-secondary tiny-text fw-bold text-uppercase mb-1">Revenue</h6>
                                    <h5 className="fw-black mb-0">₹{attendees.reduce((acc, a) => acc + (a.amountPaid / (attendees.filter(at => at.bookingId === a.bookingId).length || 1)), 0).toLocaleString()}</h5>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={4} md={4} lg>
                        <Card 
                            className={`border-0 shadow-sm rounded-4 p-3 bg-white h-100 cursor-pointer attendee-stat-card transition-all ${filterType === 'silver' ? 'ring-pink' : ''}`}
                            onClick={() => setFilterType('silver')}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="icon-box-premium rounded-4 d-flex align-items-center justify-content-center bg-secondary-subtle text-secondary" style={{ width: '45px', height: '45px' }}>
                                    <FaTicketAlt size={18} />
                                </div>
                                <div>
                                    <h6 className="text-secondary tiny-text fw-bold text-uppercase mb-1">Silver</h6>
                                    <h5 className="fw-black mb-0">{silverCount}</h5>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={4} md={4} lg>
                        <Card 
                            className={`border-0 shadow-sm rounded-4 p-3 bg-white h-100 cursor-pointer attendee-stat-card transition-all ${filterType === 'gold' ? 'ring-pink' : ''}`}
                            onClick={() => setFilterType('gold')}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="icon-box-premium rounded-4 d-flex align-items-center justify-content-center bg-warning-subtle text-warning" style={{ width: '45px', height: '45px' }}>
                                    <FaTicketAlt size={18} />
                                </div>
                                <div>
                                    <h6 className="text-secondary tiny-text fw-bold text-uppercase mb-1">Gold</h6>
                                    <h5 className="fw-black mb-0">{goldCount}</h5>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={4} md={4} lg>
                        <Card 
                            className={`border-0 shadow-sm rounded-4 p-3 bg-white h-100 cursor-pointer attendee-stat-card transition-all ${filterType === 'platinum' ? 'ring-pink' : ''}`}
                            onClick={() => setFilterType('platinum')}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="icon-box-premium rounded-4 d-flex align-items-center justify-content-center bg-primary-subtle text-primary" style={{ width: '45px', height: '45px' }}>
                                    <FaTicketAlt size={18} />
                                </div>
                                <div>
                                    <h6 className="text-secondary tiny-text fw-bold text-uppercase mb-1">Platinum</h6>
                                    <h5 className="fw-black mb-0">{platinumCount}</h5>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Attendee Table (Desktop View) */}
                <Card className="border-0 shadow-sm rounded-5 overflow-hidden bg-white d-none d-lg-block">
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0 custom-premium-table">
                            <thead>
                                <tr>
                                    <th className="px-4 py-4 text-secondary small fw-black text-uppercase tracking-widest">Attendee</th>
                                    <th className="px-4 py-4 text-secondary small fw-black text-uppercase tracking-widest">Contact Info</th>
                                    <th className="px-4 py-4 text-secondary small fw-black text-uppercase tracking-widest text-center">Ticket Type</th>
                                    <th className="px-4 py-4 text-secondary small fw-black text-uppercase tracking-widest text-center">Booking Date</th>
                                    <th className="px-4 py-4 text-secondary small fw-black text-uppercase tracking-widest text-center">Amount Paid</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttendees.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="display-1 mb-4 opacity-10">👤</div>
                                            <h5 className="text-secondary fw-bold">No attendees found matching your search.</h5>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttendees.map((attendee, idx) => (
                                        <tr key={idx} className="transition-all hover-bg-slate-50 border-bottom border-slate-100">
                                            <td className="px-4 py-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="avatar-gradient-pink text-white d-flex align-items-center justify-content-center rounded-circle shadow-sm fw-bold" style={{ width: '45px', height: '45px' }}>
                                                        {attendee.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <h6 className="mb-0 fw-black text-dark">{attendee.name}</h6>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="d-flex flex-column gap-1">
                                                    <div className="d-flex align-items-center gap-2 small text-secondary fw-medium">
                                                        <FaEnvelope className="text-pink" size={12} />
                                                        {attendee.email}
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 small text-secondary fw-medium">
                                                        <FaPhone className="text-pink" size={12} />
                                                        {attendee.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Badge className="bg-light text-dark border border-slate-200 rounded-pill px-3 py-2 fw-bold small text-uppercase">
                                                    <FaCalendarDay className="me-2 text-pink" />
                                                    {attendee.ticketType}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="small fw-bold text-dark mb-0">
                                                    {new Date(attendee.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="small text-secondary" style={{ fontSize: '0.65rem' }}>
                                                    {new Date(attendee.bookingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="fw-black text-dark h6 mb-0">₹{attendee.amountPaid.toLocaleString()}</div>
                                                <div className="small text-secondary fw-bold" style={{ fontSize: '0.65rem' }}>TOTAL ORDER: ₹{attendee.totalAmount}</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card>

                {/* Attendee Mobile Cards View */}
                <div className="d-lg-none">
                    {filteredAttendees.length === 0 ? (
                        <Card className="border-0 shadow-sm rounded-5 text-center py-5 bg-white mb-4">
                            <Card.Body className="py-5">
                                <div className="display-1 mb-4 opacity-10">👤</div>
                                <h5 className="text-secondary fw-bold">No attendees found matching your search.</h5>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {filteredAttendees.map((attendee, idx) => (
                                <Card key={idx} className="border-0 shadow-sm rounded-4 p-3 bg-white mobile-attendee-card-item">
                                    <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-slate-100">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar-gradient-pink text-white d-flex align-items-center justify-content-center rounded-circle shadow-sm fw-bold" style={{ width: '45px', height: '45px', minWidth: '45px' }}>
                                                {attendee.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h6 className="mb-0 fw-black text-dark text-truncate" style={{ fontSize: '0.95rem' }}>{attendee.name}</h6>
                                                <span className="small text-secondary fw-semibold uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>
                                                    {attendee.plan || 'Standard'} Plan
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className="bg-light text-dark border border-slate-200 rounded-pill px-3 py-2 fw-bold small text-uppercase flex-shrink-0">
                                            {attendee.ticketType}
                                        </Badge>
                                    </div>
                                    
                                    <div className="d-flex flex-column gap-2 mb-3">
                                        <div className="d-flex align-items-center gap-2 small text-secondary fw-medium">
                                            <FaEnvelope className="text-pink flex-shrink-0" size={12} />
                                            <span className="text-truncate">{attendee.email}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 small text-secondary fw-medium">
                                            <FaPhone className="text-pink flex-shrink-0" size={12} />
                                            <span>{attendee.phone}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 small text-secondary fw-medium">
                                            <FaCalendarDay className="text-pink flex-shrink-0" size={12} />
                                            <span>
                                                {new Date(attendee.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(attendee.bookingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between pt-2 border-top border-slate-100">
                                        <div>
                                            <span className="text-secondary small fw-bold text-uppercase d-block mb-0.5" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>Total Order</span>
                                            <div className="small text-secondary fw-bold">₹{attendee.totalAmount}</div>
                                        </div>
                                        <div className="text-end">
                                            <span className="text-secondary small fw-bold text-uppercase d-block mb-0.5" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>Paid Amount</span>
                                            <div className="fw-black text-pink h6 mb-0">₹{attendee.amountPaid.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default AdminEventAttendees;

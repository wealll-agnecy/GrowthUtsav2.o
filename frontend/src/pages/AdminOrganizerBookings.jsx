
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowRight, FaTicketAlt } from 'react-icons/fa';
import * as adminBookingApi from '../api/adminBookingApi';
import toast from 'react-hot-toast';
import '../css/AdminStyles.css';

const AdminOrganizerBookings = () => {
    const { organizerId } = useParams();
    const [eventGroups, setEventGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!organizerId || organizerId === 'undefined') {
            setLoading(false);
            return;
        }
        const fetchBookings = async () => {
            try {
                const res = await adminBookingApi.getOrganizerBookings(organizerId);
                setEventGroups(res.data.data);
            } catch (err) {
                console.error('Error fetching bookings:', err);
                toast.error('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [organizerId]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="dashboard-page bg-premium-light pb-5">
            <Container fluid className="px-md-5 py-4">
                <div className="mb-5 d-flex flex-column flex-md-row align-items-md-center gap-4">
                    <div className="d-flex align-items-center gap-4">
                        <Link 
                            to="/admin/bookings" 
                            className="avatar-gradient-pink rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm transition-premium hover-translate-y text-white"
                            style={{ width: '56px', height: '56px', flexShrink: 0, textDecoration: 'none' }}
                        >
                            <FaArrowLeft size={20} style={{ color: 'white' }} />
                        </Link>
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                 <span className="badge-pink-soft px-3 py-1 rounded-pill small fw-bold">EVENT TELEMETRY</span>
                            </div>
                             <h2 className="dashboard-title-main text-dark fw-black tracking-tighter m-0 d-flex align-items-center gap-3" style={{ fontSize: '2.2rem' }}>
                                 <FaTicketAlt className="text-pink d-none d-lg-inline-flex" /> Organizer's Events
                             </h2>
                        </div>
                    </div>
                    <p className="dashboard-subtext text-secondary fw-medium m-0 ms-md-auto">Operational intelligence across all deployment nodes.</p>
                </div>

                {eventGroups.length === 0 ? (
                    <Card className="border-0 shadow-sm rounded-5 text-center py-5 bg-white">
                        <Card.Body className="py-5">
                            <div className="display-1 mb-4 opacity-10">🔭</div>
                            <h4 className="fw-black text-dark mb-2">No events detected for this host.</h4>
                            <p className="text-secondary fw-medium mb-4">When this node initializes events, they will appear in the registry.</p>
                            <Button as={Link} to="/admin/bookings" className="btn-pink rounded-pill px-5 py-3 fw-bold shadow-lg">
                                Return to Registry
                            </Button>
                        </Card.Body>
                    </Card>
                ) : (
                    <Row className="g-4">
                        {eventGroups.map((group) => (
                            <Col key={group.event._id} xl={4} lg={6} md={6}>
                                <Card className="border-0 shadow-sm rounded-5 overflow-hidden h-100 transition-premium hover-translate-y bg-white">
                                    <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                                        <img 
                                            src={group.event.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80'} 
                                            alt={group.event.title}
                                            className="w-100 h-100 object-fit-cover transition-all"
                                        />
                                        <div className="position-absolute top-0 end-0 p-3">
                                            <Badge className={`rounded-pill px-3 py-2 fw-bold small ${group.event.status === 'live' ? 'bg-success' : 'bg-warning'}`}>
                                                {group.event.status?.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Card.Body className="p-4 d-flex flex-column">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span className="badge-slate-soft px-2 py-1 rounded small fw-bold text-uppercase" style={{ fontSize: '0.6rem' }}>
                                                {group.event.category}
                                            </span>
                                        </div>
                                        <h5 className="fw-black text-dark mb-3 tracking-tight text-truncate-2">{group.event.title}</h5>
                                        
                                        <div className="mt-auto pt-3 border-top border-slate-100">
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <div className="d-flex align-items-center gap-2 text-secondary small fw-medium">
                                                    <FaCalendarAlt className="text-pink" />
                                                    {new Date(group.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="d-flex align-items-center gap-2 text-secondary small fw-medium">
                                                    <FaUsers className="text-pink" />
                                                    {group.bookings.length} Guests
                                                </div>
                                            </div>
                                            <Button 
                                                as={Link}
                                                to={`/admin/event-attendees/${group.event._id}`}
                                                className="btn-pink-outline w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                                            >
                                                View Attendees <FaArrowRight size={12} />
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default AdminOrganizerBookings;

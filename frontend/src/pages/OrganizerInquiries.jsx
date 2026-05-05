import { useState, useEffect } from 'react';
import { Row, Col, Badge, Button, Spinner, Dropdown } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaCalendarDay, FaReply, FaCheckCircle, FaClock } from 'react-icons/fa';
import * as inquiryApi from '../api/inquiryApi';
import './OrganizerInquiries.css';

const OrganizerInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInquiries = async () => {
        try {
            const res = await inquiryApi.getOrganizerInquiries();
            setInquiries(res.data.data);
        } catch (err) {
            console.error('Error fetching inquiries:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this inquiry?')) return;
        try {
            await inquiryApi.deleteInquiry(id);
            setInquiries(inquiries.filter(inq => inq._id !== id));
        } catch (err) {
            console.error('Error deleting inquiry:', err);
            alert('Failed to delete inquiry');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (newStatus === 'closed') {
            handleDelete(id);
            return;
        }
        try {
            await inquiryApi.updateInquiryStatus(id, { status: newStatus });
            setInquiries(inquiries.map(inq => 
                inq._id === id ? { ...inq, status: newStatus } : inq
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="pink" />
                <p className="mt-3 text-muted">Loading inquiries...</p>
            </div>
        );
    }

    return (
        <div className="organizer-inquiries-section mt-5">
            <h4 className="dashboard-title-main mb-4" style={{ fontSize: '1.25rem' }}>Event Enquiries</h4>
            
            {inquiries.length === 0 ? (
                <div className="dashboard-card text-center py-5">
                    <FaEnvelope size={40} className="text-muted mb-3 opacity-20" />
                    <p className="text-muted m-0">No inquiries received yet.</p>
                </div>
            ) : (
                <Row className="g-4">
                    {inquiries.map((inquiry) => (
                        <Col key={inquiry._id} lg={4} md={6}>
                            <div className="inquiry-card">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h5 className="m-0 fw-bold text-white">{inquiry.name}</h5>
                                        <div className="inquiry-meta">
                                            <FaCalendarDay className="me-1" /> 
                                            {new Date(inquiry.createdAt).toLocaleDateString()} at {new Date(inquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <Badge className={`inquiry-status status-${inquiry.status}`}>
                                        {inquiry.status}
                                    </Badge>
                                </div>

                                <div className="inquiry-contact-item">
                                    <FaEnvelope size={12} />
                                    <span>{inquiry.email}</span>
                                </div>
                                <div className="inquiry-contact-item">
                                    <FaPhone size={12} />
                                    <span>{inquiry.phone}</span>
                                </div>
                                <div className="inquiry-contact-item mt-2 text-pink fw-bold">
                                    <FaClock size={12} />
                                    <span>Event: {inquiry.eventId?.title || 'Unknown Event'}</span>
                                </div>

                                <div className="inquiry-message">
                                    "{inquiry.message}"
                                </div>

                                <div className="inquiry-actions">
                                    <Button 
                                        variant="outline-light" 
                                        size="sm" 
                                        className="rounded-pill px-3 border-white/10"
                                        onClick={() => handleStatusUpdate(inquiry._id, 'replied')}
                                        disabled={inquiry.status === 'replied'}
                                    >
                                        <FaReply className="me-1" /> Mark Replied
                                    </Button>
                                    <Button 
                                        variant="outline-light" 
                                        size="sm" 
                                        className="rounded-pill px-3 border-white/10"
                                        onClick={() => handleStatusUpdate(inquiry._id, 'closed')}
                                    >
                                        <FaCheckCircle className="me-1" /> Remove
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default OrganizerInquiries;

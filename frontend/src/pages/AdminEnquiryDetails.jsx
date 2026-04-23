import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaEnvelope, FaPhone, FaUser, FaClock, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminEnquiryDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [enquiry, setEnquiry] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || id === 'undefined') {
            console.error("🕵️ [CLIENT]: Detected invalid 'undefined' ID in URL");
            setLoading(false);
            return;
        }

        const fetchEnquiry = async () => {
            try {
                const res = await axios.get(`/api/v1/enquiries/${id}`, { withCredentials: true });
                setEnquiry(res.data);
            } catch (err) {
                toast.error('Failed to load enquiry details');
                navigate('/admin/enquiries');
            } finally {
                setLoading(false);
            }
        };
        fetchEnquiry();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
        try {
            await axios.delete(`/api/v1/enquiries/${id}`, { withCredentials: true });
            toast.success('Enquiry deleted successfully');
            navigate('/admin/enquiries');
        } catch (err) {
            toast.error('Failed to delete enquiry');
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-50">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!enquiry) return null;

    return (
        <Container className="pt-1 pb-4">
            <Button 
                onClick={() => navigate('/admin/enquiries')}
                className="btn btn-outline-pink mb-4 p-0 d-flex align-items-center gap-2 transition-all fw-medium"
            >
                <FaArrowLeft /> Back to Enquiries
            </Button>

            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-bottom p-4">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h3 className="fw-bold mb-1">{enquiry.name}</h3>
                            <div className="d-flex gap-2 align-items-center">
                                <Badge bg={enquiry.status === 'New' ? 'warning' : 'info'} pill className="small px-3">
                                    {enquiry.status || 'New'}
                                </Badge>
                                <span className="text-muted small d-flex align-items-center gap-1">
                                    <FaClock size={12} /> {new Date(enquiry.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <Button className="btn btn-pink rounded-pill px-4" onClick={handleDelete}>
                            <FaTrash className="me-2" /> Delete
                        </Button>
                    </div>
                </Card.Header>
                
                <Card.Body className="p-4 p-md-5">
                    <Row className="gy-4">
                        <Col md={6}>
                            <div className="p-3 bg-light rounded-4 border">
                                <label className="text-muted small text-uppercase tracking-wider fw-bold mb-2 d-block">Contact Information</label>
                                <div className="mb-3 d-flex align-items-center gap-3">
                                    <div className="icon-box bg-primary-glow text-primary rounded-circle p-2">
                                        <FaEnvelope size={14} />
                                    </div>
                                    <div>
                                        <div className="small text-muted">Email Address</div>
                                        <div className="fw-medium">{enquiry.email}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="icon-box bg-primary-glow text-primary rounded-circle p-2">
                                        <FaPhone size={14} />
                                    </div>
                                    <div>
                                        <div className="small text-muted">Mobile Number</div>
                                        <div className="fw-medium">{enquiry.phone}</div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        
                        <Col md={12}>
                            <div className="p-4 bg-white border rounded-4 shadow-sm h-100">
                                <label className="text-muted small text-uppercase tracking-wider fw-bold mb-3 d-block">Full Message</label>
                                <div className="fs-5 lh-lg text-dark" style={{ whiteSpace: 'pre-wrap' }}>
                                    {enquiry.message}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminEnquiryDetails;

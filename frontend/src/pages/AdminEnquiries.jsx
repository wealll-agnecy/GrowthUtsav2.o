import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Badge, Spinner, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaClock, FaChevronRight, FaInbox } from 'react-icons/fa';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnquiries = async () => {
        try {
            const res = await axios.get("/api/v1/enquiries", { withCredentials: true });
            setEnquiries(res.data.data || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchEnquiries();
  }, []);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-black text-primary mb-1">Enquiries</h2>
          <p className="text-secondary small tracking-widest uppercase mb-0">Incoming customer messages</p>
        </div>
        <Badge bg="primary" pill className="px-3 py-2 shadow-glow">
          {enquiries.length} TOTAL
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
        </div>
      ) : enquiries.length > 0 ? (
        <Row className="gy-3">
          {enquiries.map((e) => (
            <Col xs={12} key={e._id || e.id || Math.random()}>
              <Card 
                className="border-0 shadow-sm rounded-4 overflow-hidden enquiry-list-card transition-premium cursor-pointer"
                onClick={() => {
                    const targetId = e._id || e.id;
                    console.log(`🎯 [CLIENT]: Navigating to Details for ID: ${targetId}`);
                    if (targetId) {
                        navigate(`/admin/enquiries/${targetId}`);
                    } else {
                        console.error("❌ [CLIENT]: Cannot navigate - ID is undefined!", e);
                    }
                }}
              >
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col lg={3} md={4} className="mb-3 mb-md-0">
                            <div className="fw-bold fs-6 text-dark text-truncate">{e.name}</div>
                            <div className="text-muted small text-truncate fw-medium">{e.email}</div>
                        </Col>
                        
                        <Col lg={6} md={5} className="mb-3 mb-md-0">
                            <div className="text-secondary small d-flex align-items-start gap-2">
                                <span className="flex-shrink-0 mt-1 opacity-50"><FaEnvelope size={12} /></span>
                                <span className="text-truncate-2 lines-3">
                                    {e.message.length > 60 ? e.message.substring(0, 60) + '...' : e.message}
                                </span>
                            </div>
                        </Col>

                        <Col lg={2} md={2} className="text-md-center d-none d-lg-block">
                            <Badge bg={e.status === 'Read' ? 'light' : 'warning'} className={`${e.status === 'Read' ? 'text-secondary' : 'text-dark'} px-3 rounded-pill`}>
                                {e.status || 'New'}
                            </Badge>
                        </Col>

                        <Col lg={1} md={3} className="text-end">
                            <div className="d-flex flex-column align-items-end">
                                <div className="text-muted tiny-text uppercase tracking-tighter d-flex align-items-center gap-1 mb-1">
                                    <FaClock size={10} /> {new Date(e.createdAt).toLocaleDateString()}
                                </div>
                                <FaChevronRight className="text-primary-light transition-all arrow-icon" size={14} />
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5 bg-white rounded-5 border-2 border-dashed border-light">
            <div className="icon-box bg-light rounded-circle p-4 d-inline-block mb-3">
                <FaInbox size={40} className="text-secondary opacity-25" />
            </div>
            <h4 className="fw-bold text-secondary">Inbox Clear</h4>
            <p className="text-muted small">No enquiries found in the system nodes.</p>
        </div>
      )}
    </Container>
  );
}

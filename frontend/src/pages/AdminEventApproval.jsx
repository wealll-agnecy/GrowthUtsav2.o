import { useState, useEffect } from 'react';
import * as eventApi from '../api/eventApi';
import { Container, Table, Button, Badge, Card, Spinner, Alert, Modal, Row, Col, Tab, Nav } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaInbox, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/admin-pages.css';

const AdminEventApproval = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState({});

    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const activeTab = searchParams.get('status') || 'pending';

    const fetchEvents = async () => {
        setLoading(true);
        try {
            if (activeTab === 'pending') {
                const res = await eventApi.getAdminPendingEvents();
                setEvents(res.data.data);
            } else {
                const res = await eventApi.getEvents();
                const filtered = res.data.data.filter(e => {
                    if (activeTab === 'approved') return ['approved', 'live', 'completed'].includes(e.status);
                    return e.status === activeTab;
                });
                setEvents(filtered);
            }
            setError(null);
        } catch (err) {
            setError(`Failed to fetch ${activeTab} events`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [activeTab]);

    const handleAction = async (id, status) => {
        if (!window.confirm(`Confirm ${status} for this event?`)) return;
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            if (status === 'approved') await eventApi.adminApproveEvent(id);
            else if (status === 'rejected') await eventApi.adminRejectEvent(id);
            else await eventApi.updateEventStatus(id, status);
            
            fetchEvents();
            setShowModal(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const filteredEvents = events.filter(e => 
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.organizer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.venue?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-page-container">
            <Container fluid>
                <div className="admin-page-header">
                    <div>
                        <h1>Event Governance</h1>
                        <p className="dashboard-subtext">Moderate and approve event submissions</p>
                    </div>
                    <div className="d-flex gap-3">
                        <div className="admin-search-wrapper position-relative">
                            <FaSearch className="search-icon position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 10 }} />
                            <input
                                type="text"
                                className="form-control admin-search-input"
                                placeholder="Search by title, host, venue..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ minWidth: '300px' }}
                            />
                        </div>
                    </div>
                </div>

                {error && <Alert variant="danger" className="border-0 shadow-sm mb-4">{error}</Alert>}

                <div className="nav-tabs-saas mb-4 d-flex gap-2">
                    {['pending', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            className={`btn ${activeTab === status ? 'btn-pink' : 'btn-outline-pink'}`}
                            onClick={() => navigate(`/admin/event-approvals?status=${status}`)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)} Notifications
                        </button>
                    ))}
                </div>

                <div className="admin-card">
                    {loading ? (
                        <div className="loading-skeleton">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-row" />)}
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon"><FaInbox /></div>
                            <h3>Queue Clear</h3>
                            <p>{search ? `No findings for "${search}"` : `The ${activeTab} moderation queue is empty.`}</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Event Title</th>
                                        <th>Host Node</th>
                                        <th>Schedule & Venue</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEvents.map(event => (
                                        <tr key={event._id}>
                                            <td>
                                                <div className="fw-bold">{event.title}</div>
                                                <div className="small text-muted">{event.category}</div>
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{event.organizer?.name}</div>
                                                <div className="small text-muted">{event.organizer?.email}</div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2 small mb-1">
                                                    <FaCalendarAlt className="text-slate-400" /> {new Date(event.date).toLocaleDateString()}
                                                </div>
                                                <div className="d-flex align-items-center gap-2 small text-muted">
                                                    <FaMapMarkerAlt className="text-slate-400" /> {event.venue}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`admin-badge badge-${activeTab}`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btn-group justify-content-end">
                                                    <button className="btn btn-outline-pink" onClick={() => { setSelectedEvent(event); setShowModal(true); }}>
                                                        <FaEye />
                                                    </button>
                                                    {activeTab === 'pending' && (
                                                        <>
                                                            <button className="btn btn-pink" onClick={() => handleAction(event._id, 'approved')} disabled={actionLoading[event._id]}>
                                                                {actionLoading[event._id] ? <Spinner size="sm" /> : <FaCheck />}
                                                            </button>
                                                            <button className="btn btn-outline-pink" onClick={() => handleAction(event._id, 'rejected')} disabled={actionLoading[event._id]}>
                                                                <FaTimes />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Container>

            {/* Audit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Event Audit Log</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedEvent && (
                        <div className="row g-4">
                            <div className="col-12">
                                <div className="p-4 bg-light rounded-4">
                                    <h3 className="fw-bold mb-3">{selectedEvent.title}</h3>
                                    <p className="text-slate-600 lh-lg">{selectedEvent.description}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="card-title-sm mb-3">Host Origin</label>
                                <div className="p-3 border rounded-3">
                                    <div className="fw-bold">{selectedEvent.organizer?.name}</div>
                                    <div className="small text-muted">{selectedEvent.organizer?.email}</div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="card-title-sm mb-3">Pricing Architecture</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {selectedEvent.ticketTypes?.map((t, i) => (
                                        <Badge key={i} bg="white" className="border text-dark p-2">₹{t.price} - {t.name}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button className="btn btn-outline-pink" onClick={() => setShowModal(false)}>Terminate Audit</Button>
                    {activeTab === 'pending' && (
                        <>
                            <Button className="btn btn-outline-pink" onClick={() => handleAction(selectedEvent._id, 'rejected')}>Reject Node</Button>
                            <Button className="btn btn-pink" onClick={() => handleAction(selectedEvent._id, 'approved')}>Authorize Node</Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminEventApproval;

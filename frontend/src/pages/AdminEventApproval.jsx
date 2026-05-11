import { useState, useEffect } from 'react';
import * as eventApi from '../api/eventApi';
import { Container, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaInbox, FaUserCircle, FaTicketAlt, FaClock, FaTag, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { playSound } from '../utils/soundManager';
import '../css/admin-pages.css';
import { formatCurrency } from '../utils/formatUtils';

const API_BASE = `http://${window.location.hostname}:5000`;

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
            if (status === 'approved') {
                await eventApi.adminApproveEvent(id);
                playSound('success');
            }
            else if (status === 'rejected') {
                await eventApi.adminRejectEvent(id);
                playSound('reject');
            }
            else {
                await eventApi.updateEventStatus(id, status);
                playSound('notification');
            }
            
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

            {/* Premium Audit Modal */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                centered 
                size="lg" 
                className="premium-popup"
            >
                <div className="popup-body">
                    {/* Close Button */}
                    <button className="close-btn" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                        <FaTimes size={16} />
                    </button>

                    {selectedEvent && (<>
                        <div className="popup-content pb-0">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="modal-icon-header">
                                    <FaCalendarAlt />
                                </div>
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <h4 className="fw-black m-0">{selectedEvent.title}</h4>
                                        <span className={`admin-badge badge-${activeTab} ms-2`}>
                                            {selectedEvent.status}
                                        </span>
                                    </div>
                                    <p className="m-0 tiny-text uppercase tracking-widest text-pink fw-bold">Event Moderation Protocol</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="popup-content pt-2">
                            {/* Description */}
                            <p className="description-text mb-4" style={{ fontSize: '1rem' }}>
                                {selectedEvent.description}
                            </p>

                            {/* Info Grid */}
                            <div className="info-grid mb-4">
                                {/* Organizer Card */}
                                <div className="section-card m-0">
                                    <div className="section-header-mini mb-3">
                                        <FaUserCircle className="me-2 text-pink" /> 
                                        <span>Host Origin</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {selectedEvent.organizer?.avatar && selectedEvent.organizer.avatar !== 'no-avatar.jpg' ? (
                                                <img src={selectedEvent.organizer.avatar.startsWith('http') ? selectedEvent.organizer.avatar : `${API_BASE}${selectedEvent.organizer.avatar}`} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : <FaUserCircle size={24} color="#fff" />}
                                        </div>
                                        <div>
                                            <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>{selectedEvent.organizer?.name}</div>
                                            <div className="small text-muted">{selectedEvent.organizer?.email}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule Card */}
                                <div className="section-card m-0">
                                    <div className="section-header-mini mb-3">
                                        <FaClock className="me-2 text-pink" /> 
                                        <span>Schedule</span>
                                    </div>
                                    <div className="d-flex flex-column gap-2">
                                        <div className="d-flex align-items-center gap-2 small fw-bold" style={{ color: 'var(--text-primary)' }}>
                                            <FaCalendarAlt className="text-pink" size={14} />
                                            {new Date(selectedEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 small fw-bold" style={{ color: 'var(--text-primary)' }}>
                                            <FaClock className="text-pink" size={14} />
                                            {selectedEvent.time || 'TBD'}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 small fw-bold" style={{ color: 'var(--text-primary)' }}>
                                            <FaMapMarkerAlt className="text-pink" size={14} />
                                            {selectedEvent.venue}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Tiers */}
                            {selectedEvent.ticketTypes?.length > 0 && (
                                <div className="section-card mb-4">
                                    <div className="section-header-mini mb-3">
                                        <FaTicketAlt className="me-2 text-pink" /> 
                                        <span>Pricing Architecture</span>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                        {selectedEvent.ticketTypes.map((t, i) => (
                                            <div key={i} style={{ background: 'rgba(236,72,153,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '10px 16px' }}>
                                                <div className="tiny-text uppercase tracking-widest text-pink fw-bold">{t.name}</div>
                                                <div className="fw-black h5 m-0" style={{ color: 'var(--text-primary)' }}>{formatCurrency(t.price)}</div>
                                                <div className="small text-muted">{t.quantity - (t.sold || 0)} left</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Category & Stats Row */}
                            <div className="d-flex gap-2 mb-4">
                                <div className="badge bg-pink-subtle text-pink px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                                    <FaTag size={12} />
                                    <span className="fw-bold">{selectedEvent.category}</span>
                                </div>
                                {selectedEvent.maxAttendees && (
                                    <div className="badge bg-slate-100 text-slate-600 px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                                        <FaUsers size={12} />
                                        <span className="fw-bold">Max {selectedEvent.maxAttendees}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex justify-content-end gap-3 mt-2">
                                <Button
                                    variant="light"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-pill px-4 fw-bold"
                                >
                                    Dismiss
                                </Button>
                                {activeTab === 'pending' && (<>
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => handleAction(selectedEvent._id, 'rejected')}
                                        disabled={actionLoading[selectedEvent._id]}
                                        className="rounded-pill px-4 fw-bold"
                                    >
                                        <FaTimes size={12} className="me-2" /> Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(selectedEvent._id, 'approved')}
                                        disabled={actionLoading[selectedEvent._id]}
                                        className="btn-pink rounded-pill px-4 fw-black shadow-glow"
                                    >
                                        {actionLoading[selectedEvent._id] ? <Spinner size="sm" /> : <><FaCheck size={12} className="me-2" /> Authorize</>}
                                    </Button>
                                </>)}
                            </div>
                        </div>
                    </>)}
                </div>
            </Modal>

        </div>
    );
};

export default AdminEventApproval;

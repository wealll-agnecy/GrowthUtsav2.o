import { useState, useEffect } from 'react';
import * as eventApi from '../api/eventApi';
import { Container, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaInbox, FaUserCircle, FaTicketAlt, FaClock, FaTag, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/admin-pages.css';

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

            {/* Premium Audit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="premium-audit-modal">
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(236,72,153,0.2)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
                }}>
                    {/* Close Button */}
                    <button
                        onClick={() => setShowModal(false)}
                        style={{
                            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                            width: '32px', height: '32px', color: '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(10px)'
                        }}
                    ><FaTimes size={12} /></button>

                    {selectedEvent && (<>
                        {/* Banner */}
                        <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                            {selectedEvent.bannerImage ? (
                                <img
                                    src={selectedEvent.bannerImage.startsWith('http') ? selectedEvent.bannerImage : `${API_BASE}${selectedEvent.bannerImage}`}
                                    alt={selectedEvent.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4)' }} />
                            )}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)' }} />
                            <div style={{ position: 'absolute', bottom: '16px', left: '20px' }}>
                                <span style={{ background: 'rgba(236,72,153,0.9)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {selectedEvent.status}
                                </span>
                                <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', margin: '6px 0 0', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                                    {selectedEvent.title}
                                </h2>
                            </div>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '20px 24px' }}>
                            {/* Description */}
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '20px' }}>
                                {selectedEvent.description}
                            </p>

                            {/* Info Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                {/* Organizer Card */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div style={{ color: '#ec4899', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Host Origin</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {selectedEvent.organizer?.avatar && selectedEvent.organizer.avatar !== 'no-avatar.jpg' ? (
                                                <img src={selectedEvent.organizer.avatar.startsWith('http') ? selectedEvent.organizer.avatar : `${API_BASE}${selectedEvent.organizer.avatar}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : <FaUserCircle size={20} color="#fff" />}
                                        </div>
                                        <div>
                                            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.875rem' }}>{selectedEvent.organizer?.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{selectedEvent.organizer?.email}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule Card */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div style={{ color: '#06b6d4', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Schedule</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                            <FaCalendarAlt color="#ec4899" size={12} />
                                            {new Date(selectedEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                            <FaClock color="#ec4899" size={12} />
                                            {selectedEvent.time || 'TBD'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                            <FaMapMarkerAlt color="#ec4899" size={12} />
                                            {selectedEvent.venue}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Tiers */}
                            {selectedEvent.ticketTypes?.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ color: '#8b5cf6', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Pricing Architecture</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {selectedEvent.ticketTypes.map((t, i) => (
                                            <div key={i} style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', padding: '8px 14px' }}>
                                                <div style={{ color: '#c4b5fd', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{t.name}</div>
                                                <div style={{ color: '#f1f5f9', fontWeight: 900, fontSize: '1rem' }}>₹{t.price}</div>
                                                <div style={{ color: '#64748b', fontSize: '10px' }}>{t.quantity - (t.sold || 0)} left</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Category & Stats Row */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                                <div style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '8px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaTag color="#ec4899" size={11} />
                                    <span style={{ color: '#f9a8d4', fontSize: '0.75rem', fontWeight: 600 }}>{selectedEvent.category}</span>
                                </div>
                                {selectedEvent.maxAttendees && (
                                    <div style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaUsers color="#06b6d4" size={11} />
                                        <span style={{ color: '#67e8f9', fontSize: '0.75rem', fontWeight: 600 }}>Max {selectedEvent.maxAttendees}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 20px', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                                {activeTab === 'pending' && (<>
                                    <button
                                        onClick={() => handleAction(selectedEvent._id, 'rejected')}
                                        disabled={actionLoading[selectedEvent._id]}
                                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 20px', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <FaTimes size={12} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(selectedEvent._id, 'approved')}
                                        disabled={actionLoading[selectedEvent._id]}
                                        style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', border: 'none', borderRadius: '10px', padding: '10px 24px', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(236,72,153,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        {actionLoading[selectedEvent._id] ? <Spinner size="sm" /> : <><FaCheck size={12} /> Authorize</>}
                                    </button>
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

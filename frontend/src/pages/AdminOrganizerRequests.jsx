import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Form, Modal, Tab, Nav } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUserTie, FaCheckCircle, FaTimesCircle, FaSearch, FaEnvelope,
    FaBuilding, FaLightbulb, FaPhone, FaGlobe, FaClock, FaUsers
} from 'react-icons/fa';
import * as adminApi from '../api/adminApi';

const statusConfig = {
    pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: <FaClock /> },
    approved: { label: 'Approved', color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: <FaCheckCircle /> },
    rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: <FaTimesCircle /> },
};

const OrganizerCard = ({ org, onApprove, onReject, view }) => {
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState('');
    const [showDetails, setShowDetails] = useState(false);

    const cfg = statusConfig[view] || statusConfig.pending;

    return (
        <>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
        >
            <Card className="h-100 border-0" style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${cfg.color}30`,
                borderRadius: 20,
                overflow: 'hidden'
            }}>
                {/* Top accent bar */}
                <div style={{ height: 3, background: cfg.color }} />

                <Card.Body className="p-4">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center justify-content-center rounded-circle fw-black text-white"
                                style={{ width: 48, height: 48, background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}88)`, fontSize: '1.2rem' }}>
                                {org.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h6 className="fw-black text-white mb-0">{org.name}</h6>
                                <div className="d-flex align-items-center gap-1 mt-1" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                    <FaEnvelope size={11} />
                                    <span>{org.email}</span>
                                </div>
                            </div>
                        </div>
                        <Badge style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}50`, fontSize: '0.7rem', fontWeight: 800 }}>
                            {cfg.icon} <span className="ms-1">{cfg.label}</span>
                        </Badge>
                    </div>

                    {/* Summary Details */}
                    <div className="d-flex flex-column gap-2 mb-3">
                        {org.organizationDetails?.companyName && (
                            <div className="d-flex align-items-center gap-2" style={{ color: '#94a3b8', fontSize: '0.83rem' }}>
                                <FaBuilding style={{ color: cfg.color, flexShrink: 0 }} />
                                <span>{org.organizationDetails.companyName}</span>
                            </div>
                        )}
                        {org.organizationDetails?.phone && (
                            <div className="d-flex align-items-center gap-2" style={{ color: '#94a3b8', fontSize: '0.83rem' }}>
                                <FaPhone style={{ color: cfg.color, flexShrink: 0 }} />
                                <span>{org.organizationDetails.phone}</span>
                            </div>
                        )}
                        {org.rejectionReason && (
                            <div className="mt-2 p-2 rounded-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <p className="mb-0 small" style={{ color: '#fca5a5' }}>
                                    <strong>Rejection Reason:</strong> {org.rejectionReason}
                                </p>
                            </div>
                        )}
                    </div>

                    <div style={{ color: '#64748b', fontSize: '0.75rem' }} className="mb-3">
                        Applied: {new Date(org.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>

                    {/* View Details Button */}
                    <Button size="sm" variant="outline-secondary" className="w-100 mb-2 py-2 btn rounded-pill fw-medium px-4"
                        style={{ borderRadius: 10, borderColor: 'rgba(255,255,255,0.15)', color: '#94a3b8', fontSize: '0.8rem' }}
                        onClick={() => setShowDetails(true)}>
                        👁 View Full Details
                    </Button>

                    {/* Actions */}
                    {view === 'pending' && (
                        <>
                            {!rejecting ? (
                                <div className="d-flex gap-2">
                                    <Button size="sm" className="flex-grow-1 py-2 btn rounded-pill fw-medium px-4"
                                        style={{ background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: 10 }}
                                        onClick={() => onApprove(org._id)}>
                                        <FaCheckCircle className="me-2" /> Approve
                                    </Button>
                                    <Button size="sm" variant="outline-danger" className="flex-grow-1 py-2 btn rounded-pill fw-medium px-4"
                                        style={{ borderRadius: 10 }}
                                        onClick={() => setRejecting(true)}>
                                        <FaTimesCircle className="me-2" /> Reject
                                    </Button>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Reason for rejection (optional)..."
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.3)', color: '#fff', borderRadius: 10, fontSize: '0.83rem' }}
                                    />
                                    <div className="d-flex gap-2">
                                        <Button size="sm" variant="danger" className="flex-grow-1 py-2 btn rounded-pill fw-medium px-4"
                                            style={{ borderRadius: 10 }}
                                            onClick={() => { onReject(org._id, reason); setRejecting(false); }}>
                                            Confirm Reject
                                        </Button>
                                        <Button size="sm" variant="secondary" className="py-2 btn rounded-pill fw-medium px-4"
                                            style={{ borderRadius: 10 }}
                                            onClick={() => setRejecting(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {view === 'approved' && (
                        <Button size="sm" variant="outline-danger" className="w-100 py-2 btn rounded-pill fw-medium px-4"
                            style={{ borderRadius: 10 }}
                            onClick={() => onReject(org._id, 'Revoked by admin')}>
                            <FaTimesCircle className="me-2" /> Revoke Approval
                        </Button>
                    )}

                    {view === 'rejected' && (
                        <Button size="sm" className="w-100 py-2 btn rounded-pill fw-medium px-4"
                            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: 10 }}
                            onClick={() => onApprove(org._id)}>
                            <FaCheckCircle className="me-2" /> Approve Now
                        </Button>
                    )}
                </Card.Body>
            </Card>
        </motion.div>

        {/* View Details Modal */}
        <Modal show={showDetails} onHide={() => setShowDetails(false)} centered size="lg"
            contentClassName="border-0 rounded-4"
            style={{ '--bs-modal-bg': '#0f172a' }}>
            <Modal.Header closeButton className="border-0 pb-0"
                style={{ background: '#0f172a', borderRadius: '1rem 1rem 0 0' }}>
                <Modal.Title className="fw-black text-white d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center rounded-circle fw-black text-white"
                        style={{ width: 44, height: 44, background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}88)`, fontSize: '1.1rem', flexShrink: 0 }}>
                        {org.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: '1.1rem' }}>{org.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>Organizer Application Details</div>
                    </div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ background: '#0f172a', borderRadius: '0 0 1rem 1rem', padding: '1.5rem' }}>
                {/* Logo and Status */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-3">
                        {org.organizationDetails?.logo ? (
                            <div className="rounded-3 overflow-hidden border border-white/10" style={{ width: 80, height: 80 }}>
                                <img 
                                    src={`http://localhost:5000${org.organizationDetails.logo}`} 
                                    alt="Org Logo" 
                                    className="w-100 h-100 object-fit-cover"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Logo'; }}
                                />
                            </div>
                        ) : (
                            <div className="d-flex align-items-center justify-content-center rounded-3 fw-black text-white border border-white/10"
                                style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.05)', fontSize: '1.5rem' }}>
                                {org.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <Badge style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}50`, fontSize: '0.75rem', fontWeight: 800, padding: '6px 14px' }}>
                            {cfg.icon} <span className="ms-1">{cfg.label}</span>
                        </Badge>
                    </div>
                </div>

                <div className="row g-3">
                    {/* Personal Info */}
                    <div className="col-12">
                        <p className="text-uppercase fw-black mb-2" style={{ color: cfg.color, fontSize: '0.7rem', letterSpacing: '0.1em' }}>Personal Information</p>
                        <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="row g-2">
                                <div className="col-sm-6">
                                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Full Name</div>
                                    <div className="fw-semibold text-white mt-1">{org.name || '—'}</div>
                                </div>
                                <div className="col-sm-6">
                                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</div>
                                    <div className="fw-semibold mt-1" style={{ color: cfg.color }}>{org.email || '—'}</div>
                                </div>
                                <div className="col-sm-6">
                                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Phone</div>
                                    <div className="fw-semibold text-white mt-1">{org.phone || '—'}</div>
                                </div>
                                <div className="col-sm-6">
                                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Applied On</div>
                                    <div className="fw-semibold text-white mt-1">{new Date(org.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Organization Info */}
                    {org.organizationDetails && (
                        <div className="col-12">
                            <p className="text-uppercase fw-black mb-2" style={{ color: cfg.color, fontSize: '0.7rem', letterSpacing: '0.1em' }}>Organization Details</p>
                            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="row g-2">
                                    {org.organizationDetails.companyName && (
                                        <div className="col-sm-6">
                                            <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company / Artist Name</div>
                                            <div className="fw-semibold text-white mt-1">{org.organizationDetails.companyName}</div>
                                        </div>
                                    )}
                                    {org.organizationDetails.phone && (
                                        <div className="col-sm-6">
                                            <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Org. Phone</div>
                                            <div className="fw-semibold text-white mt-1">{org.organizationDetails.phone}</div>
                                        </div>
                                    )}
                                    {org.organizationDetails.website && (
                                        <div className="col-sm-6">
                                            <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Website</div>
                                            <a href={org.organizationDetails.website} target="_blank" rel="noopener noreferrer"
                                                className="fw-semibold mt-1 d-block" style={{ color: cfg.color, textDecoration: 'none' }}>
                                                {org.organizationDetails.website}
                                            </a>
                                        </div>
                                    )}
                                    {org.organizationDetails.eventIntent && (
                                        <div className="col-12">
                                            <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Event Intent / Goals</div>
                                            <div className="fw-semibold text-white mt-1" style={{ lineHeight: 1.6 }}>{org.organizationDetails.eventIntent}</div>
                                        </div>
                                    )}
                                    {org.organizationDetails.selectedEventTypes?.length > 0 && (
                                        <div className="col-12">
                                            <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Event Types</div>
                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                {org.organizationDetails.selectedEventTypes.map(t => (
                                                    <span key={t} className="badge" style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40`, borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem' }}>{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rejection reason if any */}
                    {org.rejectionReason && (
                        <div className="col-12">
                            <div className="p-3 rounded-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                <div style={{ color: '#f87171', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Rejection Reason</div>
                                <div className="mt-1" style={{ color: '#fca5a5' }}>{org.rejectionReason}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action buttons inside modal */}
                {view === 'pending' && (
                    <div className="d-flex gap-3 mt-4">
                        <Button className="flex-grow-1 py-2 btn rounded-pill fw-medium px-4"
                            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: 10 }}
                            onClick={() => { onApprove(org._id); setShowDetails(false); }}>
                            <FaCheckCircle className="me-2" /> Approve
                        </Button>
                        <Button variant="outline-danger" className="flex-grow-1 py-2 btn rounded-pill fw-medium px-4"
                            style={{ borderRadius: 10 }}
                            onClick={() => { setShowDetails(false); setRejecting(true); }}>
                            <FaTimesCircle className="me-2" /> Reject
                        </Button>
                    </div>
                )}
            </Modal.Body>
        </Modal>
        </>
    );
};

const AdminOrganizerRequests = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [data, setData] = useState({ pending: [], approved: [], rejected: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [p, a, r] = await Promise.all([
                adminApi.getPendingOrganizers(),
                adminApi.getApprovedOrganizers(),
                adminApi.getRejectedOrganizers(),
            ]);
            setData({
                pending: p.data.data,
                approved: a.data.data,
                rejected: r.data.data,
            });
        } catch (err) {
            console.error('Failed to fetch organizers', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleApprove = async (id) => {
        try {
            await adminApi.approveOrganizer(id);
            showToast('Organizer approved! They can now access their dashboard.', 'success');
            fetchAll();
        } catch (err) {
            showToast('Failed to approve organizer.', 'danger');
        }
    };

    const handleReject = async (id, reason) => {
        try {
            await adminApi.rejectOrganizer(id, reason);
            showToast('Organizer rejected.', 'warning');
            fetchAll();
        } catch (err) {
            showToast('Failed to reject organizer.', 'danger');
        }
    };

    const filtered = (list) => list.filter(o =>
        o.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.email?.toLowerCase().includes(search.toLowerCase()) ||
        o.organizationDetails?.companyName?.toLowerCase().includes(search.toLowerCase())
    );

    const tabs = [
        { key: 'pending', label: 'Pending', count: data.pending.length, color: '#f59e0b' },
        { key: 'approved', label: 'Approved', count: data.approved.length, color: '#10b981' },
        { key: 'rejected', label: 'Rejected', count: data.rejected.length, color: '#ef4444' },
    ];

    return (
        <div className="dashboard-content pb-5">
            <Container fluid className="p-0">

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300 }}
                        >
                            <Alert variant={toast.type} className="mb-0 border-0 shadow-lg fw-semibold" style={{ borderRadius: 14 }}>
                                {toast.msg}
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                    <Badge className="mb-3 px-3 py-2 text-uppercase fw-black small"
                        style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8 }}>
                        <FaUsers className="me-2" /> Organizer Management
                    </Badge>
                    <h1 className="fw-black text-white mb-0 tracking-tighter" style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}>
                        Organizer <span className="gradient-text">Requests</span>
                    </h1>
                    <p className="text-soft mt-2 mb-0">Review and manage organizer applications from this control panel.</p>
                </motion.div>

                {/* Search + Stats */}
                <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between mb-4">
                    <div className="d-flex gap-3">
                        {tabs.map(t => (
                            <div key={t.key} className="text-center px-4 py-3 rounded-3"
                                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${t.color}30`, minWidth: 90 }}>
                                <div className="fw-black" style={{ fontSize: '1.6rem', color: t.color }}>{t.count}</div>
                                <div className="small fw-bold text-uppercase" style={{ color: '#64748b', fontSize: '0.68rem', letterSpacing: '0.1em' }}>{t.label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', minWidth: 260 }}>
                        <FaSearch style={{ color: '#64748b' }} />
                        <input
                            className="border-0 bg-transparent text-white w-100"
                            style={{ outline: 'none', fontSize: '0.9rem' }}
                            placeholder="Search by name, email, company..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="d-flex gap-2 mb-4">
                    {tabs.map(t => (
                        <button key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className="px-4 py-2 btn rounded-pill fw-medium btn-primary"
                            style={{
                                borderRadius: 100,
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: activeTab === t.key ? t.color : 'rgba(255,255,255,0.06)',
                                color: activeTab === t.key ? '#fff' : '#94a3b8',
                                boxShadow: activeTab === t.key ? `0 8px 20px ${t.color}40` : 'none',
                            }}>
                            {t.label} ({t.count})
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <Spinner animation="border" style={{ color: '#7c3aed', width: 48, height: 48, borderWidth: 3 }} />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {filtered(data[activeTab]).length === 0 ? (
                                <div className="text-center py-5">
                                    <FaUserTie size={48} style={{ color: '#334155', marginBottom: 16 }} />
                                    <p className="text-soft fw-bold">
                                        {search ? `No ${activeTab} organizers match "${search}".` : `No ${activeTab} organizer requests.`}
                                    </p>
                                </div>
                            ) : (
                                <Row className="g-4">
                                    {filtered(data[activeTab]).map(org => (
                                        <Col key={org._id} xs={12} md={6} xl={4}>
                                            <OrganizerCard
                                                org={org}
                                                view={activeTab}
                                                onApprove={handleApprove}
                                                onReject={handleReject}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </Container>
        </div>
    );
};

export default AdminOrganizerRequests;

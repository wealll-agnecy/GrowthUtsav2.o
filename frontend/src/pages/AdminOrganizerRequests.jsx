import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Form, Modal, Tab, Nav } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUserTie, FaCheckCircle, FaTimesCircle, FaSearch, FaEnvelope,
    FaBuilding, FaLightbulb, FaPhone, FaGlobe, FaClock, FaUsers, FaEye, FaTrash, FaCheck, FaTimes, FaUserCircle, FaExclamationTriangle
} from 'react-icons/fa';
import * as adminApi from '../api/adminApi';
import { playSound } from '../utils/soundManager';
import '../css/admin-pages.css';

const AdminOrganizerRequests = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [data, setData] = useState({ pending: [], approved: [], rejected: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    
    // Rejection States
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [confirmReject, setConfirmReject] = useState(false);

    // Approval States
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [confirmApprove, setConfirmApprove] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [p, a, r] = await Promise.all([
                adminApi.getPendingOrganizers().catch(() => ({ data: { data: [] } })),
                adminApi.getApprovedOrganizers().catch(() => ({ data: { data: [] } })),
                adminApi.getRejectedOrganizers().catch(() => ({ data: { data: [] } })),
            ]);
            setData({
                pending: p.data.data || [],
                approved: a.data.data || [],
                rejected: r.data.data || [],
            });
        } catch (err) {
            console.error('Failed to fetch organizers', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAction = async (id, status, reason = '') => {
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            if (status === 'approve') {
                await adminApi.approveOrganizer(id);
                playSound('success');
                setToast({ msg: 'Organizer approved successfully', type: 'success' });
            } else {
                await adminApi.rejectOrganizer(id, reason || 'Moderation refusal');
                playSound('reject');
                setToast({ msg: 'Organizer request rejected', type: 'warning' });
            }
            fetchAll();
        } catch (err) {
            setToast({ msg: 'Action failed', type: 'danger' });
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
            setShowModal(false);
            setShowRejectModal(false);
            setShowApproveModal(false);
            setRejectionReason('');
            setConfirmReject(false);
            setConfirmApprove(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const openRejectFlow = (org) => {
        setSelectedOrg(org);
        setShowRejectModal(true);
    };

    const openApproveFlow = (org) => {
        setSelectedOrg(org);
        setShowApproveModal(true);
    };

    const filtered = (list) => (list || []).filter(o =>
        o.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.organizationDetails?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        o.organizationDetails?.registrationNumber?.toLowerCase().includes(search.toLowerCase())
    );

    const renderTable = (list, type) => {
        const items = filtered(list);
        if (items.length === 0) {
            return (
                <div className="empty-state">
                    <div className="empty-state-icon"><FaUserTie /></div>
                    <h3>No {type} requests found</h3>
                    <p>{search ? `Matching "${search}"` : `The ${type} queue is currently empty.`}</p>
                </div>
            );
        }

        return (
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Organizer</th>
                            <th>Organization</th>
                            <th>Applied Date</th>
                            <th>Status</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(org => (
                            <tr key={org._id}>
                                <td>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center fw-bold text-slate-500" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                                            {org.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="fw-bold">{org.name}</div>
                                            <div className="small text-muted">{org.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="fw-medium">{org.organizationDetails?.companyName || 'Individual'}</div>
                                    {org.organizationDetails?.registrationNumber && (
                                        <div className="tiny-text opacity-50 mt-1" style={{ fontSize: '0.65rem' }}>
                                            REG: {org.organizationDetails.registrationNumber}
                                        </div>
                                    )}
                                </td>
                                <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <span className={`admin-badge badge-${type}`}>
                                        {type}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-btn-group justify-content-end">
                                        <button className="btn btn-outline-pink" onClick={() => { setSelectedOrg(org); setShowModal(true); }}>
                                            <FaEye />
                                        </button>
                                        {type === 'pending' && (
                                            <>
                                                <button className="btn btn-pink" onClick={() => openApproveFlow(org)} disabled={actionLoading[org._id]}>
                                                    {actionLoading[org._id] ? <Spinner size="sm" /> : <FaCheck />}
                                                </button>
                                                <button className="btn btn-outline-pink" onClick={() => openRejectFlow(org)} disabled={actionLoading[org._id]}>
                                                    <FaTimes />
                                                </button>
                                            </>
                                        )}
                                        {type === 'approved' && (
                                            <button className="btn btn-pink" title="Revoke" onClick={() => openRejectFlow(org)}>
                                                <FaTimes />
                                            </button>
                                        )}
                                        {type === 'rejected' && (
                                            <button className="btn btn-pink" title="Approve Now" onClick={() => openApproveFlow(org)}>
                                                <FaCheckCircle />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="admin-page-container">
            <Container fluid>
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
                            <Alert variant={toast.type} className="border-0 shadow-lg">{toast.msg}</Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="admin-page-header">
                    <div>
                        <h1>Organizer Management</h1>
                        <p className="dashboard-subtext">Review and moderate host applications</p>
                    </div>
                    <div className="d-flex gap-3">
                        <div className="admin-search-wrapper position-relative">
                            <FaSearch className="search-icon position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 10 }} />
                            <input
                                type="text"
                                className="form-control admin-search-input"
                                placeholder="Search organizers..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ minWidth: '300px' }}
                            />
                        </div>
                    </div>
                </div>

                <Tab.Container activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                    <Nav className="nav-tabs-saas mb-4 gap-2 border-0">
                        {['pending', 'approved', 'rejected'].map(tab => (
                            <Nav.Item key={tab}>
                                <Nav.Link eventKey={tab} className={`btn ${activeTab === tab ? 'btn-pink' : 'btn-outline-pink'}`}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)} ({data[tab].length})
                                </Nav.Link>
                            </Nav.Item>
                        ))}
                    </Nav>

                    <div className="admin-card">
                        {loading ? (
                            <div className="loading-skeleton">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-row" />)}
                            </div>
                        ) : (
                            <Tab.Content>
                                {['pending', 'approved', 'rejected'].map(tab => (
                                    <Tab.Pane key={tab} eventKey={tab}>
                                        {renderTable(data[tab], tab)}
                                    </Tab.Pane>
                                ))}
                            </Tab.Content>
                        )}
                    </div>
                </Tab.Container>
            </Container>

            {/* Premium Details Modal */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                centered 
                size="lg"
                className="premium-popup"
            >
                <div className="popup-body">
                    <button className="close-btn" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                        <FaTimes size={16} />
                    </button>
                    <div className="popup-content">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="modal-icon-header">
                                <FaUserTie />
                            </div>
                            <div>
                                <h4 className="fw-black m-0">Application Intel</h4>
                                <p className="m-0 tiny-text uppercase tracking-widest text-pink fw-bold">Verification Protocol Active</p>
                            </div>
                        </div>
                        {selectedOrg && (
                            <div className="info-grid">
                                {/* Personal Segment */}
                                <div className="section-card m-0">
                                    <div className="section-header-mini">
                                        <FaUserCircle className="me-2 text-pink" /> 
                                        <span>Identity Profile</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Full Name</label>
                                        <div className="value">{selectedOrg.name}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email Address</label>
                                        <div className="value">{selectedOrg.email}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Contact Node</label>
                                        <div className="value">{selectedOrg.phone || 'Protocol Hidden'}</div>
                                    </div>
                                </div>
                                {/* Org Segment */}
                                <div className="section-card m-0">
                                    <div className="section-header-mini">
                                        <FaBuilding className="me-2 text-pink" /> 
                                        <span>Organizational Node</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Company Entity</label>
                                        <div className="value">{selectedOrg.organizationDetails?.companyName || 'Individual Operator'}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Registration Number</label>
                                        <div className="value">{selectedOrg.organizationDetails?.registrationNumber || 'Not Provided'}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Digital Hub</label>
                                        <div className="value">
                                            {selectedOrg.organizationDetails?.website ? (
                                                <a href={selectedOrg.organizationDetails.website} target="_blank" rel="noreferrer" className="text-pink text-decoration-none d-flex align-items-center gap-1">
                                                    Visit Website <FaGlobe size={10} />
                                                </a>
                                            ) : 'No Web Presence'}
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Requested Role</label>
                                        <div className="value text-capitalize">{selectedOrg.role || 'Organizer'}</div>
                                    </div>
                                </div>
                                {/* Mission Segment */}
                                <div className="section-card m-0" style={{ gridColumn: 'span 2' }}>
                                    <div className="section-header-mini">
                                        <FaLightbulb className="me-2 text-pink" /> 
                                        <span>Event Intent & Strategic Goals</span>
                                    </div>
                                    <div className="intent-box mt-3">
                                        <p className="m-0" style={{ color: 'var(--text-primary)' }}>{selectedOrg.organizationDetails?.eventIntent || 'No specific mission parameters provided for this application node.'}</p>
                                    </div>
                                </div>
                                {/* Rejection Intel Segment (Only for Rejected) */}
                                {selectedOrg.rejectionReason && (
                                    <div className="section-card m-0 border-danger bg-danger-subtle bg-opacity-10" style={{ gridColumn: 'span 2' }}>
                                        <div className="section-header-mini text-danger">
                                            <FaExclamationTriangle className="me-2" /> 
                                            <span>Rejection Intel</span>
                                        </div>
                                        <div className="intent-box mt-2 border-danger bg-white">
                                            <label className="tiny-text uppercase tracking-widest text-danger fw-bold mb-1 d-block">Official Reason</label>
                                            <p className="m-0 fw-bold text-dark">{selectedOrg.rejectionReason}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="d-flex justify-content-end gap-3 mt-4">
                            <Button variant="light" className="rounded-pill px-4 fw-bold" onClick={() => setShowModal(false)}>
                                Dismiss
                            </Button>
                            {activeTab === 'pending' && selectedOrg && (
                                <>
                                    <Button 
                                        variant="outline-danger"
                                        className="rounded-pill px-4 fw-bold"
                                        onClick={() => {
                                            setShowModal(false);
                                            openRejectFlow(selectedOrg);
                                        }}
                                    >
                                        <FaTimesCircle className="me-2" /> Decline
                                    </Button>
                                    <Button 
                                        className="btn-pink rounded-pill px-4 fw-black shadow-glow"
                                        onClick={() => {
                                            setShowModal(false);
                                            openApproveFlow(selectedOrg);
                                        }}
                                    >
                                        <FaCheckCircle className="me-2" /> Approve Node
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>


            {/* Rejection Confirmation Modal */}
            <Modal 
                show={showRejectModal} 
                onHide={() => setShowRejectModal(false)} 
                centered
                className="premium-popup"
            >
                <div className="popup-body">
                    <button className="close-btn" onClick={() => setShowRejectModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                        <FaTimes size={16} />
                    </button>
                    <div className="popup-content">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="modal-icon-header bg-danger text-white">
                                <FaTimesCircle />
                            </div>
                            <div>
                                <h4 className="fw-black m-0">Reject Application</h4>
                                <p className="m-0 tiny-text uppercase tracking-widest text-danger fw-bold">Refusal Protocol</p>
                            </div>
                        </div>
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold small text-uppercase tracking-wider">Rejection Reason</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={4} 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="modern-textarea"
                                required
                            />
                        </Form.Group>

                        <div className="mb-3 d-flex justify-content-between align-items-center p-2 rounded-3" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            <Form.Label htmlFor="reject-confirm-check" className="fw-bold text-danger mb-0 cursor-pointer">
                                Are you sure you want to reject this host request?
                            </Form.Label>
                            <Form.Check 
                                type="checkbox"
                                id="reject-confirm-check"
                                checked={confirmReject}
                                onChange={(e) => setConfirmReject(e.target.checked)}
                                className="m-0"
                            />
                        </div>
                    </Form>
                <div className="d-flex justify-content-end gap-3 mt-4">
                    <Button variant="light" className="rounded-pill px-4 fw-bold" onClick={() => setShowRejectModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="danger" 
                        className="rounded-pill px-5 fw-black shadow-lg"
                        onClick={() => {
                            if (!rejectionReason.trim()) {
                                toast.error('Please provide a rejection reason');
                                return;
                            }
                            if (!confirmReject) {
                                toast.error('Please check the confirmation box');
                                return;
                            }
                            handleAction(selectedOrg._id, 'reject', rejectionReason);
                        }}
                    >
                        {actionLoading[selectedOrg?._id] ? <Spinner size="sm" /> : 'Confirm Rejection'}
                    </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Approval Confirmation Modal */}
            <Modal 
                show={showApproveModal} 
                onHide={() => setShowApproveModal(false)} 
                centered
                className="premium-popup"
            >
                <div className="popup-body">
                    <button className="close-btn" onClick={() => setShowApproveModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                        <FaTimes size={16} />
                    </button>
                    <div className="popup-content">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="modal-icon-header bg-success text-white">
                                <FaCheckCircle />
                            </div>
                            <div>
                                <h4 className="fw-black m-0">Confirm Approval</h4>
                                <p className="m-0 tiny-text uppercase tracking-widest text-success fw-bold">Verification Protocol</p>
                            </div>
                        </div>

                        <div className="text-center mb-4">
                            <div className="h5 fw-bold mb-2">You are about to approve {selectedOrg?.name}</div>
                            <p className="text-muted">This will grant them full access to host and manage events on the platform.</p>
                        </div>

                        <div className="mb-4 d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                            <Form.Label htmlFor="approve-confirm-check" className="fw-bold text-success mb-0 cursor-pointer small">
                                I confirm this host has been verified and meets platform requirements.
                            </Form.Label>
                            <Form.Check 
                                type="checkbox"
                                id="approve-confirm-check"
                                checked={confirmApprove}
                                onChange={(e) => setConfirmApprove(e.target.checked)}
                                className="m-0"
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-3 mt-4">
                            <Button variant="light" className="rounded-pill px-4 fw-bold" onClick={() => setShowApproveModal(false)}>
                                Cancel
                            </Button>
                            <Button 
                                className="btn-pink rounded-pill px-5 fw-black shadow-lg"
                                onClick={() => {
                                    if (!confirmApprove) {
                                        toast.error('Please check the confirmation box');
                                        return;
                                    }
                                    handleAction(selectedOrg._id, 'approve');
                                }}
                            >
                                {actionLoading[selectedOrg?._id] ? <Spinner size="sm" /> : 'Grant Access'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminOrganizerRequests;

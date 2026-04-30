import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Form, Modal, Tab, Nav } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUserTie, FaCheckCircle, FaTimesCircle, FaSearch, FaEnvelope,
    FaBuilding, FaLightbulb, FaPhone, FaGlobe, FaClock, FaUsers, FaEye, FaTrash, FaCheck, FaTimes, FaUserCircle
} from 'react-icons/fa';
import * as adminApi from '../api/adminApi';
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
                setToast({ msg: 'Organizer approved successfully', type: 'success' });
            } else {
                await adminApi.rejectOrganizer(id, reason || 'Moderation refusal');
                setToast({ msg: 'Organizer request rejected', type: 'warning' });
            }
            fetchAll();
        } catch (err) {
            setToast({ msg: 'Action failed', type: 'danger' });
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
            setShowModal(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const filtered = (list) => (list || []).filter(o =>
        o.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.email?.toLowerCase().includes(search.toLowerCase()) ||
        o.organizationDetails?.companyName?.toLowerCase().includes(search.toLowerCase())
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
                                <td>{org.organizationDetails?.companyName || 'Individual'}</td>
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
                                                <button className="btn btn-pink" onClick={() => handleAction(org._id, 'approve')} disabled={actionLoading[org._id]}>
                                                    {actionLoading[org._id] ? <Spinner size="sm" /> : <FaCheck />}
                                                </button>
                                                <button className="btn btn-outline-pink" onClick={() => handleAction(org._id, 'reject')} disabled={actionLoading[org._id]}>
                                                    <FaTimes />
                                                </button>
                                            </>
                                        )}
                                        {type === 'approved' && (
                                            <button className="btn btn-pink" title="Revoke" onClick={() => handleAction(org._id, 'reject', 'Revoked by admin')}>
                                                <FaTimes />
                                            </button>
                                        )}
                                        {type === 'rejected' && (
                                            <button className="btn btn-pink" title="Approve Now" onClick={() => handleAction(org._id, 'approve')}>
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
                className="premium-modal"
                contentClassName="glass-modal-content"
            >
                <Modal.Header className="modal-header-premium border-0">
                    <div className="d-flex align-items-center gap-3">
                        <div className="modal-icon-header">
                            <FaUserTie />
                        </div>
                        <div>
                            <Modal.Title className="fw-black tracking-tight h4 m-0">Application Intel</Modal.Title>
                            <p className="m-0 tiny-text uppercase tracking-widest text-pink fw-bold">Verification Protocol Active</p>
                        </div>
                    </div>
                    <button className="btn-close-premium" onClick={() => setShowModal(false)}><FaTimes /></button>
                </Modal.Header>
                
                <Modal.Body className="p-4 pt-2">
                    {selectedOrg && (
                        <div className="row g-4">
                            {/* Personal Segment */}
                            <div className="col-md-6">
                                <div className="detail-section-card">
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
                            </div>

                            {/* Org Segment */}
                            <div className="col-md-6">
                                <div className="detail-section-card">
                                    <div className="section-header-mini">
                                        <FaBuilding className="me-2 text-pink" /> 
                                        <span>Organizational Node</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Company Entity</label>
                                        <div className="value">{selectedOrg.organizationDetails?.companyName || 'Individual Operator'}</div>
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
                            </div>

                            {/* Mission Segment */}
                            <div className="col-12">
                                <div className="detail-section-card mission-card">
                                    <div className="section-header-mini">
                                        <FaLightbulb className="me-2 text-pink" /> 
                                        <span>Event Intent & Strategic Goals</span>
                                    </div>
                                    <div className="intent-box mt-3">
                                        <p className="m-0">{selectedOrg.organizationDetails?.eventIntent || 'No specific mission parameters provided for this application node.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                
                <Modal.Footer className="border-0 modal-footer-premium px-4 pb-4">
                    <Button variant="link" className="text-muted text-decoration-none fw-bold me-auto" onClick={() => setShowModal(false)}>
                        Dismiss
                    </Button>
                    
                    {activeTab === 'pending' && selectedOrg && (
                        <div className="d-flex gap-3">
                            <Button 
                                className="btn btn-outline-danger rounded-pill px-4 fw-bold shadow-sm"
                                onClick={() => handleAction(selectedOrg._id, 'reject')}
                            >
                                <FaTimesCircle className="me-2" /> Decline
                            </Button>
                            <Button 
                                className="btn btn-pink rounded-pill px-4 fw-black shadow-glow"
                                onClick={() => handleAction(selectedOrg._id, 'approve')}
                            >
                                <FaCheckCircle className="me-2" /> Approve Node
                            </Button>
                        </div>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminOrganizerRequests;

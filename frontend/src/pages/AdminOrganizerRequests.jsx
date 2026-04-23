import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Form, Modal, Tab, Nav } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUserTie, FaCheckCircle, FaTimesCircle, FaSearch, FaEnvelope,
    FaBuilding, FaLightbulb, FaPhone, FaGlobe, FaClock, FaUsers, FaEye, FaTrash, FaCheck, FaTimes
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

            {/* Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Application Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedOrg && (
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="card-title-sm">Personal Info</label>
                                <div className="p-3 bg-light rounded-3">
                                    <div className="mb-2"><small className="text-muted d-block uppercase tiny-text">Name</small><strong>{selectedOrg.name}</strong></div>
                                    <div className="mb-2"><small className="text-muted d-block uppercase tiny-text">Email</small><strong>{selectedOrg.email}</strong></div>
                                    <div><small className="text-muted d-block uppercase tiny-text">Phone</small><strong>{selectedOrg.phone || 'N/A'}</strong></div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="card-title-sm">Organization</label>
                                <div className="p-3 bg-light rounded-3">
                                    <div className="mb-2"><small className="text-muted d-block uppercase tiny-text">Company</small><strong>{selectedOrg.organizationDetails?.companyName || 'N/A'}</strong></div>
                                    <div><small className="text-muted d-block uppercase tiny-text">Website</small><a href={selectedOrg.organizationDetails?.website} target="_blank" className="text-info">{selectedOrg.organizationDetails?.website || 'N/A'}</a></div>
                                </div>
                            </div>
                            <div className="col-12">
                                <label className="card-title-sm">Intent & Goals</label>
                                <div className="p-3 bg-light rounded-3">
                                    <p className="mb-0 small">{selectedOrg.organizationDetails?.eventIntent || 'No intent provided.'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button className="btn btn-outline-pink rounded-8" onClick={() => setShowModal(false)}>Close</Button>
                    {activeTab === 'pending' && selectedOrg && (
                        <>
                            <Button className="btn btn-outline-pink rounded-8" onClick={() => handleAction(selectedOrg._id, 'reject')}>Reject</Button>
                            <Button className="btn btn-pink rounded-8" onClick={() => handleAction(selectedOrg._id, 'approve')}>Approve Application</Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminOrganizerRequests;

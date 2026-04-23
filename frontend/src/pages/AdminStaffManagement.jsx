import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Spinner, Table, Alert } from 'react-bootstrap';
import { FaUserPlus, FaTrash, FaLink, FaIdBadge, FaCheck, FaShieldAlt, FaEye, FaSearch, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as adminApi from '../api/adminApi';
import * as eventApi from '../api/eventApi';
import '../css/admin-pages.css';

const AdminStaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [search, setSearch] = useState('');

    // Form states
    const [formData, setFormData] = useState({ name: '', email: '', password: '', staffRole: 'gate staff' });
    const [selectedEvents, setSelectedEvents] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffRes, eventsRes] = await Promise.all([
                adminApi.getStaff(),
                eventApi.getEvents()
            ]);
            setStaffList(staffRes.data.data);
            setEvents(eventsRes.data.data.filter(e => e.status === 'approved' || e.status === 'live'));
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            await adminApi.createStaff(formData);
            setShowCreateModal(false);
            setFormData({ name: '', email: '', password: '', staffRole: 'gate staff' });
            toast.success('Personnel record created');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Initialization failure');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this staff member?')) {
            try {
                await adminApi.deleteStaff(id);
                toast.success('Personnel terminated');
                fetchData();
            } catch (err) {
                toast.error('Termination failure');
            }
        }
    };

    const openAssignModal = (staff) => {
        setSelectedStaff(staff);
        setSelectedEvents(staff.assignedEvents.map(e => e._id));
        setShowAssignModal(true);
    };

    const toggleEventSelection = (eventId) => {
        setSelectedEvents(prev =>
            prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
        );
    };

    const handleAssignEvents = async () => {
        try {
            await adminApi.assignStaffToEvents(selectedStaff._id, selectedEvents);
            setShowAssignModal(false);
            toast.success('Node assignment synchronized');
            fetchData();
        } catch (err) {
            toast.error('Assignment synchronization failure');
        }
    };

    const filteredStaff = staffList.filter(s => 
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.staffRole?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-page-container">
            <Container fluid>
                <div className="admin-page-header">
                    <div>
                        <h1>Personnel Management</h1>
                        <p className="dashboard-subtext">Manage platform staff and assignment protocols</p>
                    </div>
                    <div className="d-flex gap-3">
                        <div className="admin-search-wrapper position-relative">
                            <FaSearch className="search-icon position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 10 }} />
                            <input
                                type="text"
                                className="form-control admin-search-input"
                                placeholder="Search by name, role..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ minWidth: '300px' }}
                            />
                        </div>
                        <button className="btn btn-pink" onClick={() => setShowCreateModal(true)}>
                            <FaUserPlus /> New Personnel
                        </button>
                    </div>
                </div>

                <div className="admin-card">
                    {loading ? (
                        <div className="loading-skeleton">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-row" />)}
                        </div>
                    ) : filteredStaff.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon"><FaUsers /></div>
                            <h3>No Personnel Found</h3>
                            <p>{search ? `Matching "${search}"` : 'The staff registry is currently empty.'}</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Identity Name</th>
                                        <th>Operational Role</th>
                                        <th>Active Assignments</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map(staff => (
                                        <tr key={staff._id}>
                                            <td>
                                                <div className="fw-bold">{staff.name}</div>
                                                <div className="small text-muted">{staff.email}</div>
                                            </td>
                                            <td>
                                                <span className={`admin-badge badge-${
                                                    staff.staffRole === 'coordinator' ? 'approved' : 'resolved'
                                                }`}>
                                                    {staff.staffRole}
                                                </span>
                                            </td>
                                            <td>
                                                {staff.assignedEvents.length > 0 ? (
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {staff.assignedEvents.map(e => (
                                                            <span key={e._id} className="small bg-light px-2 py-1 rounded border" style={{ fontSize: '11px' }}>
                                                                {e.title}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="small text-muted italic">No active nodes</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-btn-group justify-content-end">
                                                    <button className="btn btn-outline-pink" title="Assign Nodes" onClick={() => openAssignModal(staff)}>
                                                        <FaLink />
                                                    </button>
                                                    <button className="btn btn-pink" title="Terminate" onClick={() => handleDelete(staff._id)}>
                                                        <FaTrash size={12} />
                                                    </button>
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

            {/* Create Staff Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="sm">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold fs-5">New Personnel</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-3">
                    <Form onSubmit={handleCreateStaff}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small uppercase fw-bold text-muted">Full Name</Form.Label>
                            <Form.Control required type="text" className="rounded-8" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small uppercase fw-bold text-muted">Email Link</Form.Label>
                            <Form.Control required type="email" className="rounded-8" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small uppercase fw-bold text-muted">Initial Access Key</Form.Label>
                            <Form.Control required type="password" minLength={6} className="rounded-8" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="small uppercase fw-bold text-muted">Operational Designation</Form.Label>
                            <Form.Select className="rounded-8" value={formData.staffRole} onChange={e => setFormData({ ...formData, staffRole: e.target.value })}>
                                <option value="gate staff">Gate Staff</option>
                                <option value="coordinator">Coordinator</option>
                                <option value="support">Support</option>
                            </Form.Select>
                        </Form.Group>
                        <Button type="submit" className="btn btn-pink w-100 rounded-8 py-2 fw-bold">CREATE RECORD</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Assign Events Modal */}
            <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered size="sm">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold fs-5">Assign Nodes</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <div className="list-group list-group-flush">
                            {events.map(event => (
                                <div
                                    key={event._id}
                                    className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-2 px-3 cursor-pointer ${selectedEvents.includes(event._id) ? 'bg-light' : ''}`}
                                    onClick={() => toggleEventSelection(event._id)}
                                >
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="fw-bold small text-truncate">{event.title}</div>
                                        <div className="text-muted text-truncate" style={{ fontSize: '10px' }}>{new Date(event.date).toLocaleDateString()} • {event.venue}</div>
                                    </div>
                                <div className={`border rounded-circle d-flex align-items-center justify-content-center ${selectedEvents.includes(event._id) ? 'bg-primary border-primary text-white' : 'bg-white'}`} style={{ width: 24, height: 24 }}>
                                    {selectedEvents.includes(event._id) && <FaCheck size={12} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button className="btn btn-outline-pink" onClick={() => setShowAssignModal(false)}>Close</Button>
                    <Button className="btn btn-pink" onClick={handleAssignEvents}>Sync Assignments</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminStaffManagement;

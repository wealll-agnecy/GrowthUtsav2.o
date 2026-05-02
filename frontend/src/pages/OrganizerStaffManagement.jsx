import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Spinner, Table } from 'react-bootstrap';
import { FaUserPlus, FaTrash, FaLink, FaIdBadge, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import * as organizerApi from '../api/organizerApi';
import * as eventApi from '../api/eventApi';
import { playSound } from '../utils/soundManager';

const OrganizerStaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    // Form states
    const [formData, setFormData] = useState({ name: '', email: '', password: '', staffRole: 'gate staff' });
    const [selectedEvents, setSelectedEvents] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffRes, eventsRes] = await Promise.all([
                organizerApi.getStaff(),
                eventApi.getMyEvents()
            ]);
            setStaffList(staffRes.data?.data || []);
            setEvents((eventsRes.data?.data || []).filter(e => e.status === 'approved' || e.status === 'live'));
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
            await organizerApi.createStaff(formData);
            setShowCreateModal(false);
            setFormData({ name: '', email: '', password: '', staffRole: 'gate staff' });
            playSound('success');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create staff');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this staff member?')) {
            try {
                await organizerApi.deleteStaff(id);
                playSound('delete');
                fetchData();
            } catch (err) {
                alert('Failed to delete staff');
            }
        }
    };

    const openAssignModal = (staff) => {
        setSelectedStaff(staff);
        setSelectedEvents((staff?.assignedEvents || []).map(e => e._id));
        setShowAssignModal(true);
    };

    const toggleEventSelection = (eventId) => {
        setSelectedEvents(prev =>
            prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
        );
    };

    const handleAssignEvents = async () => {
        try {
            await organizerApi.assignStaffToEvents(selectedStaff._id, selectedEvents);
            setShowAssignModal(false);
            playSound('success');
            fetchData();
        } catch (err) {
            alert('Failed to assign events');
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" className="text-pink" /></div>;

    return (
        <div className="dashboard-page">
            <Container fluid className="px-md-5">
                <div className="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
                    <div>
                        <h1 className="dashboard-title-main">Staff Management</h1>
                        <p className="dashboard-subtext">Event Entry & Operations Personnel Registry</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)} className="btn btn-pink d-flex align-items-center gap-2 rounded-pill fw-bold px-4 py-3">
                        <FaUserPlus /> Initialize Staff
                    </Button>
                </div>

                <div className="dashboard-card shadow-sm p-0 overflow-hidden border-0 mb-5">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr className="uppercase tracking-widest small text-slate" style={{ fontSize: '0.7rem' }}>
                                <th className="py-4 px-5 fw-bold">Staff Member</th>
                                <th className="py-4 px-5 fw-bold">Role</th>
                                <th className="py-4 px-5 fw-bold">Assigned Nodes</th>
                                <th className="py-4 px-5 fw-bold text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-5 text-slate-500 fs-5 fw-medium italic">No staff personnel detected in your current sector.</td></tr>
                            )}
                            {staffList.map(staff => (
                                <tr key={staff._id} className="border-bottom border-slate-100 hover-bg-slate-50 transition-all">
                                    <td className="py-4 px-5">
                                        <div className="fw-bold mb-1 text-dark fs-5">{staff.name}</div>
                                        <div className="small text-slate fw-medium">{staff.email}</div>
                                    </td>
                                    <td className="py-4 px-5">
                                        <span className={`status-badge ${staff.staffRole === 'coordinator' ? 'badge-pink' : ''}`}>
                                            <FaIdBadge className="me-2" /> {staff.staffRole.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-5">
                                        {(staff.assignedEvents || []).length > 0 ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                {staff.assignedEvents.map(e => (
                                                    <span key={e._id} className="status-badge" style={{ background: '#f8fafc', color: '#475569', fontSize: '0.65rem' }}>
                                                        {e.title}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="small text-slate opacity-40 italic">Standby</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-5 text-end">
                                        <Button className="btn btn-outline-pink me-2 py-2" onClick={() => openAssignModal(staff)}>
                                            <FaLink size={12} className="me-2" /> TASKS
                                        </Button>
                                        <button className="btn btn-link p-0 text-slate hover-text-danger transition-all ms-2" onClick={() => handleDelete(staff._id)}>
                                            <FaTrash size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>

                {/* Initialize Staff Modal */}
                <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
                    <Modal.Header closeButton className="border-bottom p-4">
                        <Modal.Title className="dashboard-title-main" style={{ fontSize: '1.25rem' }}>Initialize Staff Core</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        <Form onSubmit={handleCreateStaff}>
                            <Form.Group className="mb-4">
                                <Form.Label className="card-title-sm m-0 mb-2">Identity Signature</Form.Label>
                                <Form.Control required type="text" className="rounded-4 border-slate-200 p-2" placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="card-title-sm m-0 mb-2">Communication Uplink</Form.Label>
                                <Form.Control required type="email" className="rounded-4 border-slate-200 p-2" placeholder="email@nexus.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="card-title-sm m-0 mb-2">Security Access Key</Form.Label>
                                <Form.Control required type="password" minLength={6} className="rounded-4 border-slate-200 p-2" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-5">
                                <Form.Label className="card-title-sm m-0 mb-2">Operational Designation</Form.Label>
                                <Form.Select className="rounded-4 border-slate-200 p-2" value={formData.staffRole} onChange={e => setFormData({ ...formData, staffRole: e.target.value })}>
                                    <option value="gate staff">Gate Staff (Scanning & Validation)</option>
                                    <option value="coordinator">Coordinator (Operations)</option>
                                    <option value="support">Support Personnel</option>
                                </Form.Select>
                            </Form.Group>
                            <Button type="submit" className="btn btn-pink w-100 fw-bold py-3">
                                DEPLOY PERSONNEL
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Task Assignment Modal */}
                <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered size="lg">
                    <Modal.Header closeButton className="border-bottom p-4">
                        <Modal.Title className="dashboard-title-main" style={{ fontSize: '1.25rem' }}>Assign Operational Nodes</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-0" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <div className="p-4 bg-light border-bottom">
                            <p className="card-title-sm m-0 text-pink">Assigning to: {selectedStaff?.name}</p>
                        </div>
                        <div className="list-group list-group-flush">
                            {events.length === 0 && <div className="p-5 text-center text-slate opacity-40 italic">No approved active nodes available for deployment.</div>}
                            {events.map(event => (
                                <div
                                    key={event._id}
                                    className={`list-group-item list-group-item-action border-bottom border-slate-100 py-3 px-4 d-flex align-items-center justify-content-between cursor-pointer transition-all ${selectedEvents.includes(event._id) ? 'bg-pink-subtle' : ''}`}
                                    onClick={() => toggleEventSelection(event._id)}
                                >
                                    <div>
                                        <div className="fw-bold text-dark">{event.title}</div>
                                        <div className="small text-slate">{new Date(event.date).toLocaleDateString()} • {event.venue}</div>
                                    </div>
                                    <div className={`rounded-circle d-flex align-items-center justify-content-center transition-all ${selectedEvents.includes(event._id) ? 'bg-pink text-white' : 'border border-slate-200 text-transparent'}`} style={{ width: 28, height: 28 }}>
                                        <FaCheck size={12} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-top p-4 d-flex justify-content-between">
                        <Button variant="link" className="text-slate text-decoration-none fw-bold" onClick={() => setShowAssignModal(false)}>CANCEL</Button>
                        <Button className="btn btn-pink px-4 fw-bold" onClick={handleAssignEvents}>SYNC ASSIGNMENTS</Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        </div>
    );
};

export default OrganizerStaffManagement;

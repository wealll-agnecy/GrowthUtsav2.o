import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Spinner, Table } from 'react-bootstrap';
import { FaUserPlus, FaTrash, FaLink, FaIdBadge, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import * as organizerApi from '../api/organizerApi';
import * as eventApi from '../api/eventApi';

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
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create staff');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this staff member?')) {
            try {
                await organizerApi.deleteStaff(id);
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
            fetchData();
        } catch (err) {
            alert('Failed to assign events');
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="light" /></div>;

    return (
        <div className="dashboard-content pb-5">
            <Container fluid className="px-md-5">
                <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-white/10 pb-3 mt-4">
                    <div>
                        <h2 className="fw-black text-white m-0 tracking-tighter" style={{ fontSize: '2.5rem' }}>Staff <span className="gradient-text">Management</span></h2>
                        <p className="text-white-50 m-0 small uppercase tracking-widest mt-1">Event Entry & Operations Personnel</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)} className="d-flex align-items-center gap-2 btn rounded-pill fw-medium px-4 py-2">
                        <FaUserPlus /> Initialize Staff
                    </Button>
                </div>

                <Card className="glass-panel border-white/5 rounded-5 shadow-2xl overflow-hidden border-0">
                    <Table responsive hover className="mb-0 text-white align-middle" variant="dark">
                        <thead>
                            <tr className="uppercase tracking-widest small text-white-50" style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>
                                <th className="py-4 px-5 fw-black border-0">Staff Member</th>
                                <th className="py-4 px-5 fw-black border-0">Role</th>
                                <th className="py-4 px-5 fw-black border-0">Assigned Nodes</th>
                                <th className="py-4 px-5 fw-black border-0 text-end">Governance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-5 text-white-50 fs-5 fw-medium italic">No staff personnel detected in your current sector.</td></tr>
                            )}
                            {staffList.map(staff => (
                                <tr key={staff._id} className="border-bottom border-white/5 bg-transparent hover-bg-white/5 transition-all">
                                    <td className="py-4 px-5">
                                        <div className="fw-black mb-1 text-bright fs-5">{staff.name}</div>
                                        <div className="small text-white-50 fw-medium font-monospace">{staff.email}</div>
                                    </td>
                                    <td className="py-4 px-5">
                                        <Badge bg={
                                            staff.staffRole === 'coordinator' ? 'warning' :
                                                staff.staffRole === 'support' ? 'info' : 'primary'
                                        } className="uppercase tracking-widest shadow-lg px-3 py-2 rounded-pill fw-black">
                                            <FaIdBadge className="me-2" /> {staff.staffRole}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-5">
                                        {(staff.assignedEvents || []).length > 0 ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                {staff.assignedEvents.map(e => (
                                                    <Badge bg="white/10" key={e._id} className="border border-white/10 fw-black uppercase tracking-tighter py-2 px-3 rounded-pill text-soft">
                                                        {e.title}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="small text-white-50 fst-italic opacity-40">Standby (Unassigned)</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-5 text-end">
                                        <Button variant="outline-light" size="sm" className="me-3 rounded-pill px-4 py-2 btn fw-medium" onClick={() => openAssignModal(staff)}>
                                            <FaLink size={12} className="me-2" /> TASKS
                                        </Button>
                                        <Button variant="outline-danger" size="sm" className="rounded-pill px-4 py-2 btn fw-medium" onClick={() => handleDelete(staff._id)}>
                                            <FaTrash size={12} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>

                {/* Initialize Staff Modal */}
                <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} contentClassName="bg-dark text-white border-white/10 rounded-5 shadow-2xl overflow-hidden" centered>
                    <Modal.Header closeButton closeVariant="white" className="border-bottom border-white/10 p-4">
                        <Modal.Title className="fw-black tracking-widest h4 m-0 text-bright uppercase">INITIALIZE STAFF CORE</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-5">
                        <Form onSubmit={handleCreateStaff}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small text-white-50 uppercase tracking-widest fw-black mb-3">Identity Signature (Name)</Form.Label>
                                <Form.Control required type="text" className="bg-white/5 border-white/10 text-white py-3 px-4 rounded-4 shadow-none focus-border-primary" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="small text-white-50 uppercase tracking-widest fw-black mb-3">Communication Uplink (Email)</Form.Label>
                                <Form.Control required type="email" className="bg-white/5 border-white/10 text-white py-3 px-4 rounded-4 shadow-none focus-border-primary" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="small text-white-50 uppercase tracking-widest fw-black mb-3">Security Access Key (Password)</Form.Label>
                                <Form.Control required type="password" minLength={6} className="bg-white/5 border-white/10 text-white py-3 px-4 rounded-4 shadow-none focus-border-primary" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-5">
                                <Form.Label className="small text-white-50 uppercase tracking-widest fw-black mb-3">Operational Designation</Form.Label>
                                <Form.Select className="bg-white/5 border-white/10 text-white py-3 px-4 rounded-4 shadow-none focus-border-primary cursor-pointer" value={formData.staffRole} onChange={e => setFormData({ ...formData, staffRole: e.target.value })}>
                                    <option value="gate staff">Gate Staff (Scanning & Validation)</option>
                                    <option value="coordinator">Coordinator (Operations)</option>
                                    <option value="support">Support Personnel</option>
                                </Form.Select>
                            </Form.Group>
                            <Button type="submit" variant="primary" className="w-100 btn rounded-pill fw-medium px-4 py-2">
                                DEPLOY PERSONNEL
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Task Assignment Modal */}
                <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} contentClassName="bg-dark text-white border-white/10 rounded-5 shadow-2xl overflow-hidden" centered size="lg">
                    <Modal.Header closeButton closeVariant="white" className="border-bottom border-white/10 p-4">
                        <Modal.Title className="fw-black tracking-widest h4 m-0 text-bright uppercase">ASSIGN OPERATIONAL NODES</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-0" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <div className="p-4 bg-white/5 border-bottom border-white/5">
                            <p className="text-white-50 small fw-black tracking-widest uppercase m-0">Assigning tasks to: <span className="text-primary font-monospace">{selectedStaff?.name}</span></p>
                        </div>
                        <div className="list-group list-group-flush">
                            {events.length === 0 && <div className="p-5 text-center text-white-50 italic fs-5">No approved active nodes available for deployment in your sector.</div>}
                            {events.map(event => (
                                <div
                                    key={event._id}
                                    className={`list-group-item list-group-item-action bg-transparent text-white border-bottom border-white/5 py-4 px-5 d-flex align-items-center justify-content-between cursor-pointer transition-all ${selectedEvents.includes(event._id) ? 'bg-primary/10' : ''}`}
                                    onClick={() => toggleEventSelection(event._id)}
                                >
                                    <div>
                                        <div className="fw-black fs-5 tracking-tight text-white">{event.title}</div>
                                        <div className="small text-white-50 uppercase tracking-widest font-monospace mt-1">{new Date(event.date).toLocaleDateString()} • {event.venue}</div>
                                    </div>
                                    <div className={`border-2 rounded-circle d-flex align-items-center justify-content-center transition-all ${selectedEvents.includes(event._id) ? 'bg-primary border-primary text-white shadow-glow-sm' : 'border-white/20'}`} style={{ width: 32, height: 32 }}>
                                        {selectedEvents.includes(event._id) && <FaCheck size={16} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-top border-white/10 bg-white/5 p-4 d-flex justify-content-between">
                        <Button variant="outline-light" className="rounded-pill btn fw-medium px-4 py-2" onClick={() => setShowAssignModal(false)}>ABORT MISSION</Button>
                        <Button variant="primary" className="rounded-pill btn fw-medium px-4 py-2" onClick={handleAssignEvents}>SYNC ASSIGNMENTS</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default OrganizerStaffManagement;

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Spinner, Table } from 'react-bootstrap';
import { FaUserPlus, FaTrash, FaLink, FaIdBadge, FaCheck, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as adminApi from '../api/adminApi';
import * as eventApi from '../api/eventApi';

const AdminStaffManagement = () => {
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
            toast.success('Personnel initialized and deployed');
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

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div className="dashboard-content pb-5">
            <Container fluid className="px-md-5">
                <div className="d-flex justify-content-between align-items-end mb-5 border-bottom border-white/10 pb-4 mt-4">
                    <div>
                        <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small">
                            <FaShieldAlt className="me-2" /> Global Protocol
                        </Badge>
                        <h2 className="fw-black text-white m-0 tracking-tighter" style={{ fontSize: '3rem' }}>Personnel <span className="gradient-text">Registry</span></h2>
                        <p className="text-white-50 m-0 small uppercase tracking-widest mt-1 opacity-60">Central Administrative Control of All Staff Assets</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)} className="fw-black px-5 py-3 rounded-pill d-flex align-items-center gap-2 shadow-2xl border-0 glow-hover text-uppercase tracking-widest small">
                        <FaUserPlus /> Initialize Personnel
                    </Button>
                </div>

                <Card className="glass-panel border-0 rounded-5 shadow-2xl overflow-hidden">
                    <Table responsive hover className="mb-0 text-white align-middle" variant="dark">
                        <thead>
                            <tr className="uppercase tracking-widest small text-white-50" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.03)' }}>
                                <th className="py-4 px-5 fw-black border-0">Identity Signature</th>
                                <th className="py-4 px-5 fw-black border-0">Operational Class</th>
                                <th className="py-4 px-5 fw-black border-0">Node Assignments</th>
                                <th className="py-4 px-5 fw-black border-0 text-end">Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-5 text-white-50 fs-5 fw-medium italic border-0">No active personnel detected in global registry.</td></tr>
                            )}
                            {staffList.map(staff => (
                                <tr key={staff._id} className="border-bottom border-white/5 bg-transparent hover-bg-white/5 transition-all">
                                    <td className="py-4 px-5">
                                        <div className="fw-black mb-1 text-bright fs-5">{staff.name}</div>
                                        <div className="small text-white-50 fw-medium font-monospace opacity-60">{staff.email}</div>
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
                                        {staff.assignedEvents.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                {staff.assignedEvents.map(e => (
                                                    <Badge bg="white/5" key={e._id} className="border border-white/10 fw-black uppercase tracking-tighter py-2 px-3 rounded-pill text-white/70">
                                                        {e.title}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="small text-white-50 fst-italic opacity-30">Standby Mode</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-5 text-end">
                                        <Button variant="outline-primary" size="sm" className="me-3 rounded-pill px-4 py-2 fw-black border-2 text-uppercase tracking-widest small shadow-lg" onClick={() => openAssignModal(staff)}>
                                            <FaLink size={12} className="me-2" /> ASSIGN
                                        </Button>
                                        <Button variant="outline-danger" size="sm" className="rounded-pill px-4 py-2 fw-black border-2 text-uppercase tracking-widest small shadow-lg" onClick={() => handleDelete(staff._id)}>
                                            <FaTrash size={12} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>

                {/* Create Staff Modal */}
                <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} contentClassName="bg-dark text-white border-white/10 rounded-5 shadow-2xl overflow-hidden" centered>
                    <Modal.Header closeButton closeVariant="white" className="border-bottom border-white/10 p-4">
                        <Modal.Title className="fw-black tracking-widest h4 m-0 text-bright uppercase">INITIALIZE PERSONNEL</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-5">
                        <Form onSubmit={handleCreateStaff}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small text-white-50 uppercase tracking-widest fw-black mb-3">Identity Signature</Form.Label>
                                <Form.Control required type="text" className="bg-white/5 border-white/10 text-white py-3 px-4 rounded-4 shadow-none focus-border-primary" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="small text-white-50 uppercase tracking-widest fw-black mb-3">Communication Uplink</Form.Label>
                                <Form.Control required type="email" className="bg-white/5 border-white/10 text-white py-3 px-4 rounded-4 shadow-none focus-border-primary" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="small text-white-50 uppercase tracking-widest fw-black mb-3">Security Access Key</Form.Label>
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
                            <Button type="submit" variant="primary" className="w-100 py-4 rounded-4 fw-black tracking-widest uppercase shadow-2xl border-0 glow-hover">
                                DEPLOY PERSONNEL
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Assign Events Modal */}
                <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} contentClassName="bg-dark text-white border-white/10 rounded-5 shadow-2xl overflow-hidden" centered size="lg">
                    <Modal.Header closeButton closeVariant="white" className="border-bottom border-white/10 p-4">
                        <Modal.Title className="fw-black tracking-widest h4 m-0 text-bright uppercase">ASSIGN OPERATIONAL NODES</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-0" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <div className="list-group list-group-flush">
                            {events.length === 0 && <div className="p-5 text-center text-white-50 italic fs-5">No active nodes available for deployment in global registry.</div>}
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
                        <Button variant="outline-light" className="rounded-pill px-5 py-3 fw-black border-2 text-uppercase tracking-widest small" onClick={() => setShowAssignModal(false)}>ABORT MISSION</Button>
                        <Button variant="primary" className="rounded-pill px-5 py-3 fw-black shadow-2xl border-0 glow-hover text-uppercase tracking-widest" onClick={handleAssignEvents}>SYNC ASSIGNMENTS</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default AdminStaffManagement;

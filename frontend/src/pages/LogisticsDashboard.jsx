import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Tab, Table, Button, Spinner, Badge, Form, Alert } from 'react-bootstrap';
import { FaTruck, FaTools, FaTasks, FaUserTag, FaPlus, FaTrash, FaArrowLeft, FaBox, FaShieldAlt, FaWarehouse, FaClipboardList, FaSatellite, FaBolt } from 'react-icons/fa';
import * as logisticsApi from '../api/logisticsApi';
import * as eventApi from '../api/eventApi';
import KanbanBoard from '../components/logistics/KanbanBoard';
import { motion, AnimatePresence } from 'framer-motion';

const LogisticsDashboard = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newVendor, setNewVendor] = useState({ name: '', category: 'Catering', contactPerson: '', phone: '', status: 'Proposed' });
    const [newEquip, setNewEquip] = useState({ name: '', quantity: 1, source: 'In-house', status: 'Required' });

    const fetchData = async () => {
        try {
            const [eRes, vRes, eqRes] = await Promise.all([
                eventApi.getEvent(eventId),
                logisticsApi.getVendors(eventId),
                logisticsApi.getEquipment(eventId)
            ]);
            setEvent(eRes.data.data);
            setVendors(vRes.data.data);
            setEquipment(eqRes.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch logistics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!eventId || eventId === 'undefined') {
            console.error("[CLIENT]: Detected invalid 'undefined' eventId in URL");
            setLoading(false);
            return;
        }
        fetchData();
    }, [eventId]);

    const handleAddVendor = async (e) => {
        e.preventDefault();
        try {
            await logisticsApi.addVendor(eventId, newVendor);
            setNewVendor({ name: '', category: 'Catering', contactPerson: '', phone: '', status: 'Proposed' });
            fetchData();
        } catch (err) {
            alert('Failed to add vendor');
        }
    };

    const handleAddEquip = async (e) => {
        e.preventDefault();
        try {
            await logisticsApi.addEquipment(eventId, newEquip);
            setNewEquip({ name: '', quantity: 1, source: 'In-house', status: 'Required' });
            fetchData();
        } catch (err) {
            alert('Failed to add equipment');
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Delete this ${type}?`)) return;
        try {
            if (type === 'vendor') await logisticsApi.deleteVendor(id);
            else await logisticsApi.deleteEquipment(id);
            fetchData();
        } catch (err) {
            alert(`Failed to delete ${type}`);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-transparent">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <FaTools size={50} className="text-primary opacity-50" />
            </motion.div>
        </div>
    );

    if (error) return (
        <div className="content-wrapper min-vh-100 d-flex align-items-center justify-content-center">
            <Container className="text-center">
                <Alert variant="danger" className="glass-panel text-danger border-danger/20 rounded-5 p-5 shadow-2xl">
                    <FaShieldAlt size={50} className="mb-4 opacity-50" />
                    <h3 className="fw-black mb-3 text-uppercase">ACCESS DENIED</h3>
                    <p className="fs-5 opacity-75">{error}</p>
                </Alert>
                <Button as={Link} to="/organizer/dashboard" className="btn btn-pink rounded-pill mt-4 fw-medium px-4 py-2">REVERT TO CONSOLE</Button>
            </Container>
        </div>
    );

    return (
        <div className="dashboard-content pb-5">
            <Container fluid className="p-0">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="mb-5"
                >
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
                        <div>
                            <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl uppercase">
                               <FaTruck className="me-2" /> Operations HQ v3.5
                            </Badge>
                            <h1 className="fw-black m-0 tracking-tighter text-bright" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1 }}>
                                {event.title} <span className="gradient-text">Ops</span>
                            </h1>
                        </div>
                        <div className="d-flex gap-4">
                            <div className="text-end px-4 border-end border-white/10">
                                <span className="text-primary-light fw-black h1 m-0 gradient-text shadow-glow">{vendors.length}</span>
                                <div className="text-soft small fw-black text-uppercase tracking-widest opacity-60">VENDORS</div>
                            </div>
                            <div className="text-end px-4">
                                <span className="text-primary-light fw-black h1 m-0 gradient-text shadow-glow">{equipment.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
                                <div className="text-soft small fw-black text-uppercase tracking-widest opacity-60">ASSETS</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <Tab.Container defaultActiveKey="tasks">
                    <Card className="border-0 shadow-2xl rounded-5 overflow-hidden glass-panel border-white/10">
                        <Card.Header className="bg-transparent border-bottom border-white/10 p-0">
                            <Nav variant="tabs" className="custom-dashboard-tabs border-0 bg-white/5 backdrop-blur-xl">
                                <Nav.Item>
                                    <Nav.Link eventKey="tasks" className="px-5 py-4 border-0 rounded-0 fw-black d-flex align-items-center gap-3 text-soft">
                                        <FaTasks size={18} /> <span className="d-none d-md-inline tracking-widest small">STRATEGY BOARD</span>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="vendors" className="px-5 py-4 border-0 rounded-0 fw-black d-flex align-items-center gap-3 text-soft">
                                        <FaTruck size={18} /> <span className="d-none d-md-inline tracking-widest small">VENDOR REGISTRY</span>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="equipment" className="px-5 py-4 border-0 rounded-0 fw-black d-flex align-items-center gap-3 text-soft">
                                        <FaBox size={18} /> <span className="d-none d-md-inline tracking-widest small">ASSET INVENTORY</span>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>
                        <Card.Body className="p-4 p-md-5 bg-transparent">
                            <Tab.Content>
                                <Tab.Pane eventKey="tasks">
                                    <KanbanBoard eventId={eventId} />
                                </Tab.Pane>

                                <Tab.Pane eventKey="vendors">
                                    <Row className="g-5">
                                        <Col lg={4}>
                                            <div className="glass-panel p-4 rounded-5 border-white/5 shadow-inner mb-4">
                                                <h4 className="fw-black mb-5 text-bright d-flex align-items-center gap-3">
                                                    <span className="bg-primary shadow-lg p-2 rounded-4 d-inline-flex"><FaPlus className="text-white" size={16} /></span>
                                                    New Resource
                                                </h4>
                                                <Form onSubmit={handleAddVendor}>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="small fw-black text-soft text-uppercase tracking-widest mb-2 opacity-60">Vendor Identity</Form.Label>
                                                        <Form.Control 
                                                            className="bg-white/5 border-white/10 py-3 px-4 rounded-4 shadow-none fw-bold text-bright placeholder-light"
                                                            type="text" required value={newVendor.name}
                                                            placeholder="Catering Elite Node..."
                                                            onChange={e => setNewVendor({...newVendor, name: e.target.value})}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="small fw-black text-soft text-uppercase tracking-widest mb-2 opacity-60">Segment</Form.Label>
                                                        <Form.Select 
                                                            className="bg-white/5 border-white/10 py-3 px-4 rounded-4 shadow-none fw-bold text-bright cursor-pointer"
                                                            value={newVendor.category}
                                                            onChange={e => setNewVendor({...newVendor, category: e.target.value})}
                                                        >
                                                            <option value="Catering">Catering</option>
                                                            <option value="AV">AV</option>
                                                            <option value="Venue">Venue</option>
                                                            <option value="Decor">Decor</option>
                                                            <option value="Security">Security</option>
                                                            <option value="Entertainment">Entertainment</option>
                                                            <option value="Transport">Transport</option>
                                                            <option value="Other">Other</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                    <Form.Group className="mb-5">
                                                        <Form.Label className="small fw-black text-soft text-uppercase tracking-widest mb-2 opacity-60">Lifecycle Status</Form.Label>
                                                        <Form.Select 
                                                            className="bg-white/5 border-white/10 py-3 px-4 rounded-4 shadow-none fw-bold text-bright cursor-pointer"
                                                            value={newVendor.status}
                                                            onChange={e => setNewVendor({...newVendor, status: e.target.value})}
                                                        >
                                                            <option value="Proposed">Proposed</option>
                                                            <option value="Contracted">Contracted</option>
                                                            <option value="Paid">Paid</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                    <Button type="submit" className="btn btn-pink w-100 rounded-pill fw-medium px-4 py-2">DEPLOY VENDOR</Button>
                                                </Form>
                                            </div>
                                        </Col>
                                        <Col lg={8}>
                                            <div className="table-responsive rounded-5 glass-panel border-white/5 overflow-hidden shadow-2xl">
                                                <Table hover variant="dark" className="m-0 align-middle bg-transparent">
                                                    <thead className="bg-white/5 border-bottom border-white/10">
                                                        <tr className="small text-uppercase fw-black text-soft tracking-widest font-monospace">
                                                            <th className="px-5 py-4">Entity Identity</th>
                                                            <th className="py-4">Segment</th>
                                                            <th className="py-4">Lifecycle</th>
                                                            <th className="text-end px-5 py-4">Ops</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="border-0">
                                                        {vendors.length === 0 ? (
                                                            <tr><td colSpan="4" className="text-center py-5 text-white-50 fw-black italic opacity-30">No active vendor telemetry detected.</td></tr>
                                                        ) : (
                                                            vendors.map((v, idx) => (
                                                                <motion.tr 
                                                                    key={v._id}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: idx * 0.05 }}
                                                                    className="border-bottom border-white/5 hover-bg-white/5 transition-all"
                                                                >
                                                                    <td className="px-5 py-4">
                                                                        <div className="fw-black text-bright fs-5 mb-1">{v.name}</div>
                                                                        <div className="text-soft small fw-bold text-uppercase opacity-60">{v.contactPerson || 'AUTO-SYNCHRONIZED'}</div>
                                                                    </td>
                                                                    <td><Badge bg="primary-subtle" text="primary" className="rounded-pill px-3 py-2 border border-primary-light fw-black uppercase">{v.category}</Badge></td>
                                                                    <td>
                                                                        <Badge bg={v.status === 'Contracted' || v.status === 'Paid' ? 'success' : 'secondary'} className="rounded-pill px-3 py-2 fw-black text-uppercase shadow-sm">
                                                                            {v.status}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="text-end px-5 py-4">
                                                                        <motion.button whileHover={{ scale: 1.1 }} className="btn btn-outline-danger btn-sm rounded-circle p-2 border-2 shadow-lg" onClick={() => handleDelete('vendor', v._id)}>
                                                                            <FaTrash size={14} />
                                                                        </motion.button>
                                                                    </td>
                                                                </motion.tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                <Tab.Pane eventKey="equipment">
                                    <Row className="g-5">
                                        <Col lg={4}>
                                            <div className="glass-panel p-4 rounded-5 border-white/5 shadow-inner mb-4">
                                                                                <h4 className="fw-black mb-5 text-bright d-flex align-items-center gap-3">
                                                                                    <span className="bg-secondary shadow-lg p-2 rounded-4 d-inline-flex"><FaPlus className="text-white" size={16} /></span>
                                                                                    New Asset
                                                                                </h4>
                                                <Form onSubmit={handleAddEquip}>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="small fw-black text-white-50 text-uppercase tracking-widest mb-2 opacity-60">Item Designation</Form.Label>
                                                        <Form.Control 
                                                            className="bg-white/5 border-white/10 py-3 px-4 rounded-4 shadow-none fw-bold text-white placeholder-light"
                                                            type="text" required value={newEquip.name}
                                                            placeholder="Linear Array Node..."
                                                            onChange={e => setNewEquip({...newEquip, name: e.target.value})}
                                                        />
                                                    </Form.Group>
                                                    <Row className="g-3">
                                                        <Col md={6}>
                                                            <Form.Group className="mb-4">
                                                                <Form.Label className="small fw-black text-soft text-uppercase tracking-widest mb-2 opacity-60">Vol</Form.Label>
                                                                <Form.Control 
                                                                    className="bg-white/5 border-white/10 py-3 px-4 rounded-4 shadow-none fw-bold text-bright"
                                                                    type="number" min="1" value={newEquip.quantity}
                                                                    onChange={e => setNewEquip({...newEquip, quantity: e.target.value})}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-4">
                                                                <Form.Label className="small fw-black text-soft text-uppercase tracking-widest mb-2 opacity-60">Origin</Form.Label>
                                                                <Form.Select 
                                                                    className="bg-white/5 border-white/10 py-3 px-4 rounded-4 shadow-none fw-bold text-bright cursor-pointer"
                                                                    value={newEquip.source}
                                                                    onChange={e => setNewEquip({...newEquip, source: e.target.value})}
                                                                >
                                                                    <option value="In-house">In-house</option>
                                                                    <option value="Rental">Rental</option>
                                                                    <option value="Venue">Venue</option>
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Form.Group className="mb-5">
                                                        <Form.Label className="small fw-black text-soft text-uppercase tracking-widest mb-2 opacity-60">Deployment Status</Form.Label>
                                                        <Form.Select 
                                                            className="bg-white/5 border-white/10 py-3 px-4 rounded-4 shadow-none fw-bold text-bright cursor-pointer"
                                                            value={newEquip.status}
                                                            onChange={e => setNewEquip({...newEquip, status: e.target.value})}
                                                        >
                                                            <option value="Required">Required</option>
                                                            <option value="Requested">Requested</option>
                                                            <option value="Secured">Secured</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Returned">Returned</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                    <Button type="submit" className="btn btn-outline-pink w-100 rounded-pill fw-medium px-4 py-2">REGISTER ASSET</Button>
                                                </Form>
                                            </div>
                                        </Col>
                                        <Col lg={8}>
                                            <div className="table-responsive rounded-5 glass-panel border-white/5 overflow-hidden shadow-2xl">
                                                <Table hover variant="dark" className="m-0 align-middle bg-transparent">
                                                    <thead className="bg-white/5 border-bottom border-white/10">
                                                        <tr className="small text-uppercase fw-black text-soft tracking-widest font-monospace">
                                                            <th className="px-5 py-4">Asset Designation</th>
                                                            <th className="py-4">Vitals</th>
                                                            <th className="py-4">Origin</th>
                                                            <th className="py-4">Deployment</th>
                                                            <th className="text-end px-5 py-4">Ops</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="border-0">
                                                        {equipment.length === 0 ? (
                                                            <tr><td colSpan="5" className="text-center py-5 text-white-50 fw-black italic opacity-30">Strategic inventory is currently offline.</td></tr>
                                                        ) : (
                                                            equipment.map((item, idx) => (
                                                                <motion.tr 
                                                                    key={item._id}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: idx * 0.05 }}
                                                                    className="border-bottom border-white/5 hover-bg-white/5 transition-all"
                                                                >
                                                                    <td className="px-5 py-4 fw-black text-bright fs-5">{item.name}</td>
                                                                    <td className="fw-black text-primary-light fs-4">{item.quantity} <span className="small text-soft fw-medium">U</span></td>
                                                                    <td><Badge bg="white/10" text="white" className="border border-white/10 rounded-pill px-3 py-2 fw-black text-uppercase shadow-sm">{item.source}</Badge></td>
                                                                    <td>
                                                                        <Badge bg={item.status === 'Secured' || item.status === 'Delivered' ? 'success' : 'info'} className="rounded-pill px-3 py-2 fw-black text-uppercase shadow-sm">
                                                                            {item.status}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="text-end px-5 py-4">
                                                                        <motion.button whileHover={{ scale: 1.1 }} className="btn btn-outline-danger btn-sm rounded-circle p-2 border-2 shadow-lg" onClick={() => handleDelete('equipment', item._id)}>
                                                                            <FaTrash size={14} />
                                                                        </motion.button>
                                                                    </td>
                                                                </motion.tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Col>
                                    </Row>
                                </Tab.Pane>
                            </Tab.Content>
                        </Card.Body>
                    </Card>
                </Tab.Container>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-5 p-5 rounded-5 glass-panel border-primary/20 shadow-2xl position-relative overflow-hidden"
                >
                    <div className="position-absolute top-0 end-0 m-5 opacity-5 pointer-events-none"><FaBolt size={100} /></div>
                    <div className="d-flex flex-column flex-md-row align-items-center gap-5">
                        <div className="bg-primary rounded-circle p-4 shadow-lg flex-shrink-0 animate-pulse"><FaShieldAlt size={40} className="text-white" /></div>
                        <div className="text-center text-md-start">
                            <h4 className="fw-black text-bright mb-2 text-uppercase tracking-tighter display-6 neon-text">OPERATIONAL INTEGRITY ALERT</h4>
                            <p className="text-soft mb-0 fw-medium fs-5 lh-base opacity-80">All logistical telemetry is logged in real-time. Ensure vendor contracts are synchronized via the quantum portal to maintain universal insurance eligibility.</p>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
};

export default LogisticsDashboard;

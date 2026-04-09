import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as eventApi from '../api/eventApi';
import * as analyticsApi from '../api/analyticsApi';
import { Container, Row, Col, Button, Badge, Card, Spinner, Alert, Tabs, Tab, ProgressBar, Form, Table } from 'react-bootstrap';
import {
    FaArrowLeft, FaCheck, FaTrash, FaEdit, FaTicketAlt,
    FaUsers, FaWallet, FaSatellite, FaBolt, FaExclamationTriangle,
    FaCloudDownloadAlt, FaSyncAlt, FaGavel, FaCheckCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AttendeeTable from '../components/analytics/AttendeeTable';
import { RevenueChart, TicketDistributionChart } from '../components/analytics/DashboardCharts';
import { useAuth } from '../context/AuthContext';

const OrganizerEventDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch initial data
    const fetchData = async () => {
        try {
            const [eventRes, attendeeRes] = await Promise.all([
                eventApi.getEvent(id),
                analyticsApi.getEventAttendees(id)
            ]);

            // Security Check
            const currentUserId = user?.id || user?._id;
            const organizerId = eventRes.data.data?.organizer?._id || eventRes.data.data?.organizer?.id;

            if (user && organizerId !== currentUserId && user.role !== 'admin') {
                navigate('/');
                return;
            }

            setEvent(eventRes.data.data);
            setAttendees(attendeeRes.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch event analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleStatusUpdate = async (status) => {
        if (!window.confirm(`Are you sure you want to transition this node to ${status.toUpperCase()}?`)) return;
        setActionLoading(true);
        try {
            await eventApi.updateEventStatus(id, status);
            fetchData();
        } catch (err) {
            alert('Status update protocol failed.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('CRITICAL: Purging this node will delete all telemetry and guest data. Proceed?')) return;
        try {
            await eventApi.deleteEvent(id);
            navigate('/organizer/dashboard');
        } catch (err) {
            alert('Purge sequence failed.');
        }
    };

    const handleTicketUpdate = async (e, tierIndex, field, value) => {
        const updatedTiers = [...event.ticketTypes];
        updatedTiers[tierIndex][field] = value;
        try {
            await eventApi.updateEvent(id, { ticketTypes: updatedTiers });
            setEvent({ ...event, ticketTypes: updatedTiers });
        } catch (err) {
            alert('Parameter synchronization failed.');
        }
    };

    const exportToCSV = () => {
        if (!attendees.length) return;
        const headers = ['Name', 'Email', 'Ticket Type', 'Quantity', 'Amount', 'Status'];
        const csvContent = [
            headers.join(','),
            ...attendees.map(a => [
                a.user.name,
                a.user.email,
                a.ticketType,
                a.quantity,
                a.totalAmount,
                a.checkedIn ? 'Validated' : 'Pending'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${event.title}_GUEST_LIST.csv`);
        link.click();
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <FaSatellite size={50} className="text-primary opacity-50" />
            </motion.div>
        </div>
    );

    if (error) return (
        <Container className="py-5 text-center">
            <Alert variant="danger" className="glass-panel border-danger/20 text-danger rounded-5 p-5">
                <FaExclamationTriangle size={50} className="mb-4" />
                <h3 className="fw-black uppercase tracking-widest">Protocol Failure</h3>
                <p>{error}</p>
            </Alert>
        </Container>
    );

    const totalSold = (event?.ticketTypes || []).reduce((acc, curr) => acc + (curr.sold || 0), 0);
    const totalCapacity = (event?.ticketTypes || []).reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const totalRevenue = (attendees || []).reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const progress = Math.round((totalSold / totalCapacity || 0) * 100);

    // Limited dashboard for unapproved events
    if (event.status !== 'approved' && event.status !== 'live' && event.status !== 'completed') {
        return (
            <div className="dashboard-content pb-5">
                <Container fluid className="px-md-5">
                    <div className="mb-5 d-flex flex-column pt-4">
                        <h1 className="fw-black m-0 tracking-tighter text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                            {event.title}
                        </h1>
                        <Badge bg={event.status === 'rejected' ? 'danger' : 'warning'} text={event.status === 'warning' ? 'dark' : 'white'} className="mt-3 align-self-start px-3 py-2 rounded-pill fw-black text-uppercase tracking-widest shadow-sm">
                            {event.status === 'rejected' ? 'Rejected' : 'Waiting for admin approval'}
                        </Badge>
                    </div>

                    <Card className="border-0 shadow-2xl rounded-5 overflow-hidden glass-panel border-white/10 p-5 text-center">
                        <div className="display-1 mb-4 opacity-50 text-warning">⏳</div>
                        <h3 className="fw-black text-white text-uppercase tracking-widest mb-3">Limited Dashboard</h3>
                        <p className="text-white-50 fs-5 mb-4">This event is currently {event.status}. Full analytics, attendee details, and management features will be unlocked once approved by an administrator.</p>
                        <div className="d-flex justify-content-center gap-3">
                            <Button as={Link} to={`/organizer/edit-event/${id}`} variant="outline-light" className="rounded-pill px-5 py-3 fw-black shadow-lg border-2">EDIT EVENT</Button>
                            <Button variant="outline-danger" className="rounded-pill px-5 py-3 fw-black shadow-lg border-2" onClick={handleDelete}>DELETE EVENT</Button>
                        </div>
                    </Card>
                </Container>
            </div>
        );
    }

    return (
        <div className="dashboard-content pb-5">
            <Container fluid className="px-md-5">
                {/* ─── Navigation & Header ─── */}
                <div className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 pt-4">
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 text-uppercase tracking-widest fw-black small shadow-2xl">
                                <FaSatellite className="me-2" /> Global Protocol: {id.slice(-6).toUpperCase()}
                            </Badge>
                            <Badge bg={event.status === 'live' ? 'success' : 'warning'} className="px-3 py-2 rounded-pill fw-black text-uppercase tracking-widest shadow-sm">
                                {event.status}
                            </Badge>
                        </div>
                        <h1 className="fw-black m-0 tracking-tighter text-white" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1 }}>
                            {event.title} <span className="gradient-text">Dashboard</span>
                        </h1>
                    </div>
                    <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
                        <Button
                            as={Link}
                            to={`/organizer/edit-event/${id}`}
                            variant="outline-light"
                            className="flex-grow-1 flex-md-grow-0 rounded-4 px-3 px-md-4 py-3 fw-black border-2 shadow-lg text-uppercase tracking-widest d-flex align-items-center justify-content-center gap-2 hover-bg-white hover-text-dark transition-all small"
                        >
                            <FaEdit size={12} /> <span className="d-none d-sm-inline">EDIT NODE</span><span className="d-sm-none">EDIT</span>
                        </Button>
                        {event.status === 'approved' && (
                            <Button
                                variant="primary"
                                className="flex-grow-1 flex-md-grow-0 rounded-4 px-3 px-md-5 py-3 fw-black shadow-2xl border-0 glow-hover text-uppercase tracking-widest d-flex align-items-center justify-content-center gap-2 small"
                                onClick={() => handleStatusUpdate('live')}
                                disabled={actionLoading}
                            >
                                <FaBolt /> <span className="d-none d-sm-inline">GO LIVE</span><span className="d-sm-none">LIVE</span>
                            </Button>
                        )}
                        {event.status === 'live' && (
                            <Button
                                variant="success"
                                className="flex-grow-1 flex-md-grow-0 rounded-4 px-3 px-md-5 py-3 fw-black shadow-2xl border-0 glow-hover text-uppercase tracking-widest d-flex align-items-center justify-content-center gap-2 small"
                                onClick={() => handleStatusUpdate('completed')}
                                disabled={actionLoading}
                            >
                                <FaCheck /> <span className="d-none d-sm-inline">MARK COMPLETED</span><span className="d-sm-none">FINISH</span>
                            </Button>
                        )}
                    </div>

                </div>

                {/* ─── Immersive Dashboard ─── */}
                <Card className="border-0 shadow-2xl rounded-5 overflow-hidden glass-panel border-white/10">
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="custom-dashboard-tabs border-0 bg-white/5 p-2 backdrop-blur-xl"
                    >
                        <Tab eventKey="overview" title="OVERVIEW" className="p-4 p-md-5">
                            <Row className="g-5 mb-5 align-items-center">
                                <Col lg={5}>
                                    <div className="position-relative rounded-5 overflow-hidden shadow-2xl border border-white/10 perspective-1000 mb-4 mb-lg-0" style={{ height: '300px' }}>
                                        <img src={event.bannerImage && event.bannerImage !== 'no-photo.jpg' ? event.bannerImage : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} className="w-100 h-100 object-fit-cover transition-all duration-700 hover-scale-110" />
                                        <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                                            <div className="small fw-black text-white-50 text-uppercase tracking-widest mb-1">Location</div>
                                            <div className="h5 fw-black text-white m-0 d-flex align-items-center gap-2"><FaSatellite className="text-primary" /> {event.venue}</div>
                                        </div>
                                    </div>

                                </Col>
                                <Col lg={7}>
                                    <Row className="g-4">
                                        <Col md={6}>
                                            <div className="p-4 rounded-5 glass-panel border-white/10 d-flex flex-column justify-content-center shadow-inner h-100">
                                                <div className="text-white-50 small fw-black tracking-widest uppercase mb-2">Aggregate Revenue</div>
                                                <div className="h1 fw-black text-primary m-0 gradient-text">₹{totalRevenue.toLocaleString()}</div>
                                                <div className="mt-3 d-flex align-items-center gap-2">
                                                    <Badge bg="success-subtle" text="success" className="rounded-pill px-2 py-1 small fw-black">+12%</Badge>
                                                    <span className="text-white-50 small fw-bold opacity-60">Node performance increase</span>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="p-4 rounded-5 glass-panel border-white/10 d-flex flex-column justify-content-center shadow-inner h-100">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <div className="text-white-50 small fw-black tracking-widest uppercase">Capacity Saturation</div>
                                                    <div className="text-primary-light fw-black">{progress}%</div>
                                                </div>
                                                <ProgressBar now={progress} variant={progress > 80 ? 'success' : 'primary'} className="rounded-pill bg-white/5 shadow-inner" style={{ height: '12px' }} />
                                                <div className="mt-3 text-white-50 small fw-black tracking-widest uppercase opacity-60">
                                                    {totalSold} / {totalCapacity} TICKETS DEPLOYED
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <div className="mt-5 p-4 rounded-5 bg-white/5 border border-white/5 shadow-2xl">
                                        <div className="d-flex align-items-center gap-4">
                                            <div className="bg-primary/20 p-3 rounded-circle text-primary shadow-lg"><FaUsers size={24} /></div>
                                            <div>
                                                <div className="text-white-50 small fw-black tracking-widest uppercase mb-1">Event Telemetry</div>
                                                <div className="text-white fw-medium">Scheduled for {event?.date ? new Date(event.date).toLocaleDateString() : 'TBD'} at {event?.time || 'TBD'}. Category: <span className="text-primary fw-black uppercase">{event?.category || 'Legacy'}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Tab>

                        <Tab eventKey="attendees" title="ATTENDEES" className="p-4 p-md-5">
                            <div className="mb-5 d-flex justify-content-between align-items-center flex-wrap gap-4">
                                <div>
                                    <h4 className="fw-black text-white uppercase tracking-widest m-0">Attendee Registry</h4>
                                    <p className="text-white-50 small mb-0 fw-medium opacity-60 uppercase tracking-tighter">Real-time Guest telemetry for this deployment node</p>
                                </div>
                                <Button variant="success" className="rounded-pill px-5 py-3 fw-black shadow-2xl border-0 glow-hover text-uppercase tracking-widest d-flex align-items-center gap-3" onClick={exportToCSV} disabled={attendees.length === 0}>
                                    <FaCloudDownloadAlt /> ARCHIVE CSV
                                </Button>
                            </div>
                            <AttendeeTable attendees={attendees} exportToCSV={exportToCSV} />
                        </Tab>

                        <Tab eventKey="tickets" title="TICKETS" className="p-4 p-md-5">
                            <div className="mb-5">
                                <h4 className="fw-black text-white uppercase tracking-widest mb-4">Pricing Configuration</h4>
                                <div className="table-responsive rounded-5 glass-panel border-white/5 overflow-hidden shadow-2xl">
                                    <Table hover variant="dark" className="m-0 align-middle bg-transparent">
                                        <thead className="bg-white/5 border-bottom border-white/10">
                                            <tr className="small text-uppercase fw-black text-white-50 tracking-widest">
                                                <th className="px-5 py-4">Tier Name</th>
                                                <th className="py-4">Unit Price (₹)</th>
                                                <th className="py-4">Max Capacity</th>
                                                <th className="py-4">Sold Count</th>
                                                <th className="text-end px-5 py-4">Protocol Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="border-0">
                                            {(event?.ticketTypes || []).map((tier, idx) => (
                                                <tr key={idx} className="border-bottom border-white/5 hover-bg-white/5 transition-all">
                                                    <td className="px-5 py-4 fw-black text-white fs-5">{tier.name}</td>
                                                    <td className="py-4">
                                                        <Form.Control
                                                            type="number"
                                                            className="bg-white/5 border-white/10 text-white fw-bold rounded-4 shadow-none w-auto py-2 px-3 focus-border-primary"
                                                            value={tier.price}
                                                            onChange={(e) => handleTicketUpdate(e, idx, 'price', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="py-4">
                                                        <Form.Control
                                                            type="number"
                                                            className="bg-white/5 border-white/10 text-white fw-bold rounded-4 shadow-none w-auto py-2 px-3 focus-border-primary"
                                                            value={tier.quantity}
                                                            onChange={(e) => handleTicketUpdate(e, idx, 'quantity', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="py-4 fw-black text-primary-light fs-5">{tier.sold}</td>
                                                    <td className="text-end px-5 py-4">
                                                        <Badge bg="primary-subtle" text="primary" className="fw-black text-uppercase px-3 py-2 border border-primary/20">SYNCED</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </Tab>

                        <Tab eventKey="analytics" title="ANALYTICS" className="p-4 p-md-5">
                            <Row className="g-5">
                                <Col lg={8}>
                                    <div className="glass-panel p-5 rounded-5 border-white/5 shadow-inner h-100">
                                        <div className="d-flex justify-content-between align-items-center mb-5">
                                            <h5 className="fw-black text-white uppercase tracking-widest m-0">Revenue Propagation</h5>
                                            <div className="d-flex gap-2">
                                                <Badge bg="primary" className="p-2 rounded-circle"></Badge>
                                                <span className="text-white-50 small fw-black tracking-widest uppercase">Live Telemetry</span>
                                            </div>
                                        </div>
                                        <RevenueChart data={[
                                            { name: 'Deploy', revenue: 0 },
                                            { name: 'Phase 1', revenue: totalRevenue * 0.35 },
                                            { name: 'Phase 2', revenue: totalRevenue * 0.75 },
                                            { name: 'Current', revenue: totalRevenue },
                                        ]} />
                                    </div>
                                </Col>
                                <Col lg={4}>
                                    <div className="glass-panel p-5 rounded-5 border-white/5 shadow-inner h-100">
                                        <TicketDistributionChart data={[
                                            { name: 'DEPLOYED', value: totalSold },
                                            { name: 'VACANT', value: totalCapacity - totalSold },
                                        ]} title="Saturation Balance" />
                                    </div>
                                </Col>
                            </Row>
                        </Tab>

                        <Tab eventKey="actions" title="GOVERNANCE" className="p-4 p-md-5">
                            <h4 className="fw-black text-white uppercase tracking-widest mb-5">Danger Sector</h4>
                            <Row className="g-4">
                                <Col md={6}>
                                    <div className="p-5 rounded-5 glass-panel border-danger/20 shadow-2xl h-100 d-flex flex-column gap-4 align-items-start hover-glow-red transition-all">
                                        <div className="bg-danger/20 p-4 rounded-circle text-danger shadow-lg"><FaTrash size={32} /></div>
                                        <div>
                                            <h4 className="fw-black text-white m-0">PURGE PROTOCOL</h4>
                                            <p className="text-white-50 mt-2 mb-0 fw-medium">Permanently delete this event. This action is irreversible and will wipe all guest data and analytics from the master node.</p>
                                        </div>
                                        <Button variant="outline-danger" className="rounded-pill px-5 py-3 fw-black mt-auto border-2 shadow-lg text-uppercase tracking-widest" onClick={handleDelete}>EXECUTE PURGE</Button>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-5 rounded-5 glass-panel border-white/5 shadow-2xl h-100 d-flex flex-column gap-4 align-items-start hover-glow-primary transition-all">
                                        <div className="bg-white/10 p-4 rounded-circle text-white shadow-lg"><FaCloudDownloadAlt size={32} /></div>
                                        <div>
                                            <h4 className="fw-black text-white m-0">DATA BACKUP</h4>
                                            <p className="text-white-50 mt-2 mb-0 fw-medium">Export a full guest manifest in portable CSV format for secure offline processing and external auditing.</p>
                                        </div>
                                        <Button variant="outline-light" className="rounded-pill px-5 py-3 fw-black mt-auto border-2 shadow-lg text-uppercase tracking-widest" onClick={exportToCSV}>EXPORT ARCHIVE</Button>
                                    </div>
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                </Card>
            </Container>
        </div>
    );
};

export default OrganizerEventDashboard;

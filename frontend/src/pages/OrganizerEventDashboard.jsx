import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as eventApi from '../api/eventApi';
import * as analyticsApi from '../api/analyticsApi';
import { Container, Row, Col, Button, Badge, Card, Spinner, Alert, Tabs, Tab, ProgressBar, Form, Table } from 'react-bootstrap';
import {
    FaArrowLeft, FaCheck, FaTrash, FaEdit, FaTicketAlt,
    FaUsers, FaWallet, FaSatellite, FaBolt, FaExclamationTriangle,
    FaCloudDownloadAlt, FaSyncAlt, FaGavel, FaCheckCircle, FaMapMarkerAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AttendeeTable from '../components/analytics/AttendeeTable';
import { RevenueChart, TicketDistributionChart } from '../components/analytics/DashboardCharts';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatUtils';

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
            <div className="dashboard-page">
                <Container fluid className="px-md-5">
                    <div className="dashboard-header mb-5">
                        <h1 className="dashboard-title-main">{event.title}</h1>
                        <div className="mt-3">
                            <span className={`status-badge ${event.status === 'rejected' ? 'bg-danger text-white' : 'badge-pink'}`}>
                                {event.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="dashboard-card p-5 text-center shadow-sm">
                        <div className="display-1 mb-4 opacity-10">⏳</div>
                        <h3 className="dashboard-title-main mb-3" style={{ fontSize: '1.5rem' }}>Limited Dashboard Access</h3>
                        <p className="dashboard-subtext fs-5 mb-4 px-lg-5">This event node is currently in <strong>{event.status}</strong> mode. Full analytics, attendee details, and management features will be unlocked once approved by an administrator.</p>
                        <div className="d-flex justify-content-center gap-3">
                            <Button as={Link} to={`/organizer/edit-event/${id}`} className="btn btn-pink px-4 py-2">EDIT EVENT</Button>
                            <Button className="btn btn-outline-pink rounded-pill px-4 py-2 fw-bold" onClick={handleDelete}>DELETE EVENT</Button>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <Container fluid className="px-md-5">
                {/* ─── Navigation & Header ─── */}
                <div className="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <span className="status-badge">NODE: {id.slice(-6).toUpperCase()}</span>
                            <span className={`status-badge ${event.status === 'live' ? 'badge-pink' : ''}`}>
                                {event.status.toUpperCase()}
                            </span>
                        </div>
                        <h1 className="dashboard-title-main">{event.title}</h1>
                        <p className="dashboard-subtext">Operational intelligence and guest telemetry dashboard.</p>
                    </div>
                    <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
                        <Button
                            as={Link}
                            to={`/organizer/edit-event/${id}`}
                            className="btn btn-outline-pink flex-grow-1 flex-md-grow-0 px-md-4 d-flex align-items-center justify-content-center gap-2"
                        >
                            <FaEdit size={12} /> EDIT NODE
                        </Button>
                        {event.status === 'approved' && (
                            <Button
                                className="btn btn-pink flex-grow-1 flex-md-grow-0 px-md-5 d-flex align-items-center justify-content-center gap-2 rounded-pill fw-bold"
                                onClick={() => handleStatusUpdate('live')}
                                disabled={actionLoading}
                            >
                                <FaBolt /> GO LIVE
                            </Button>
                        )}
                        {event.status === 'live' && (
                            <Button
                                className="flex-grow-1 flex-md-grow-0 px-md-5 d-flex align-items-center justify-content-center gap-2 rounded-pill fw-bold text-white"
                                style={{ background: '#10b981', border: 'none' }}
                                onClick={() => handleStatusUpdate('completed')}
                                disabled={actionLoading}
                            >
                                <FaCheck /> MARK COMPLETED
                            </Button>
                        )}
                    </div>
                </div>

                {/* ─── Immersive Dashboard ─── */}
                <div className="dashboard-card shadow-sm p-0 overflow-hidden">
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="custom-dashboard-tabs border-0 bg-light p-2"
                    >
                        <Tab eventKey="overview" title="OVERVIEW" className="p-4 p-md-5">
                            <Row className="g-5 mb-5 align-items-center">
                                <Col lg={5}>
                                    <div className="position-relative rounded-4 overflow-hidden shadow-sm border" style={{ height: '300px' }}>
                                        <img src={event.bannerImage && event.bannerImage !== 'no-photo.jpg' ? event.bannerImage : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} className="w-100 h-100 object-fit-cover" alt="Banner" />
                                        <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                            <div className="small fw-bold text-white-50 text-uppercase tracking-widest mb-1" style={{ fontSize: '0.65rem' }}>Location</div>
                                            <div className="h5 fw-bold text-white m-0 d-flex align-items-center gap-2"><FaMapMarkerAlt className="text-pink" /> {event.venue}</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col lg={7}>
                                    <div className="stats-grid-saas mb-4">
                                        <div className="dashboard-card shadow-sm border-slate-100 p-4 h-100">
                                            <span className="card-title-sm">Aggregate Revenue</span>
                                            <h3 className="card-value-lg text-pink">{formatCurrency(totalRevenue)}</h3>
                                            <div className="mt-2 text-success small fw-bold">+12.4% Performance</div>
                                        </div>
                                        <div className="dashboard-card shadow-sm border-slate-100 p-4 h-100">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="card-title-sm">Capacity</span>
                                                <span className="fw-bold text-pink">{progress}%</span>
                                            </div>
                                            <ProgressBar now={progress} variant="pink" className="rounded-pill bg-slate-100" style={{ height: '8px' }} />
                                            <div className="mt-3 text-slate small fw-bold opacity-60">
                                                {totalSold} / {totalCapacity} Units
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-4 bg-light border border-slate-200">
                                        <div className="d-flex align-items-center gap-4">
                                            <div className="bg-white p-3 rounded-circle shadow-sm text-pink"><FaBolt size={24} /></div>
                                            <div>
                                                <span className="card-title-sm" style={{ fontSize: '0.7rem' }}>Event Telemetry</span>
                                                <p className="dashboard-subtext m-0">Scheduled for <strong>{event?.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</strong>. Primary Sector: <strong>{event?.category || 'General'}</strong></p>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Tab>

                        <Tab eventKey="attendees" title="ATTENDEES" className="p-4 p-md-5">
                            <div className="mb-5 d-flex justify-content-between align-items-center flex-wrap gap-4">
                                <div>
                                    <h4 className="dashboard-title-main" style={{ fontSize: '1.5rem' }}>Attendee Registry</h4>
                                    <p className="dashboard-subtext">Real-time Guest telemetry for this deployment node</p>
                                </div>
                                <Button className="btn btn-outline-pink d-flex align-items-center gap-3 border-success text-success hover-bg-success hover-text-white transition-all shadow-none" onClick={exportToCSV} disabled={attendees.length === 0}>
                                    <FaCloudDownloadAlt /> ARCHIVE CSV
                                </Button>
                            </div>
                            <AttendeeTable attendees={attendees} exportToCSV={exportToCSV} />
                        </Tab>

                        <Tab eventKey="tickets" title="TICKETS" className="p-4 p-md-5">
                            <div className="mb-5">
                                <h4 className="dashboard-title-main mb-4" style={{ fontSize: '1.5rem' }}>Pricing Configuration</h4>
                                <div className="table-responsive rounded-4 border overflow-hidden shadow-sm">
                                    <Table hover className="m-0 align-middle">
                                        <thead className="bg-light">
                                            <tr className="small text-uppercase fw-bold text-slate tracking-widest">
                                                <th className="px-4 py-4">Tier Name</th>
                                                <th className="py-4">Unit Price (INR)</th>
                                                <th className="py-4">Max Capacity</th>
                                                <th className="py-4">Sold Count</th>
                                                <th className="text-end px-4 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(event?.ticketTypes || []).map((tier, idx) => (
                                                <tr key={idx} className="border-bottom border-slate-100">
                                                    <td className="px-4 py-4 fw-bold">{tier.name}</td>
                                                    <td className="py-4">
                                                        <Form.Control
                                                            type="number"
                                                            className="bg-light border-slate-200 fw-bold rounded-3 shadow-none w-auto py-2 px-3"
                                                            value={tier.price}
                                                            onChange={(e) => handleTicketUpdate(e, idx, 'price', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="py-4">
                                                        <Form.Control
                                                            type="number"
                                                            className="bg-light border-slate-200 fw-bold rounded-3 shadow-none w-auto py-2 px-3"
                                                            value={tier.quantity}
                                                            onChange={(e) => handleTicketUpdate(e, idx, 'quantity', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="py-4 fw-bold text-pink">{tier.sold}</td>
                                                    <td className="text-end px-4 py-4">
                                                        <span className="status-badge badge-pink">SYNCED</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </Tab>

                        <Tab eventKey="analytics" title="ANALYTICS" className="p-4 p-md-5">
                            <Row className="g-4">
                                <Col lg={8}>
                                    <div className="dashboard-card border-slate-100 p-4 h-100">
                                        <div className="d-flex justify-content-between align-items-center mb-5">
                                            <h5 className="dashboard-title-main" style={{ fontSize: '1.25rem' }}>Revenue Propagation</h5>
                                            <span className="status-badge badge-pink">Live Telemetry</span>
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
                                    <div className="dashboard-card border-slate-100 p-4 h-100">
                                        <TicketDistributionChart data={[
                                            { name: 'DEPLOYED', value: totalSold },
                                            { name: 'VACANT', value: totalCapacity - totalSold },
                                        ]} title="Saturation Balance" />
                                    </div>
                                </Col>
                            </Row>
                        </Tab>

                        <Tab eventKey="actions" title="GOVERNANCE" className="p-4 p-md-5">
                            <h4 className="dashboard-title-main mb-5" style={{ fontSize: '1.5rem' }}>Danger Sector</h4>
                            <Row className="g-4">
                                <Col md={6}>
                                    <div className="dashboard-card border-danger/20 p-5 h-100 d-flex flex-column gap-4 align-items-start shadow-sm">
                                        <div className="bg-danger/10 p-4 rounded-circle text-danger"><FaTrash size={32} /></div>
                                        <div>
                                            <h4 className="dashboard-title-main m-0" style={{ fontSize: '1.25rem' }}>PURGE PROTOCOL</h4>
                                            <p className="dashboard-subtext mt-2 mb-0">Permanently delete this event. This action is irreversible and will wipe all guest data and analytics from the master node.</p>
                                        </div>
                                        <Button className="btn btn-outline-pink rounded-pill mt-auto fw-bold px-4 py-2" onClick={handleDelete}>EXECUTE PURGE</Button>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="dashboard-card border-slate-100 p-5 h-100 d-flex flex-column gap-4 align-items-start shadow-sm">
                                        <div className="bg-slate-100 p-4 rounded-circle text-slate"><FaCloudDownloadAlt size={32} /></div>
                                        <div>
                                            <h4 className="dashboard-title-main m-0" style={{ fontSize: '1.25rem' }}>DATA BACKUP</h4>
                                            <p className="dashboard-subtext mt-2 mb-0">Export a full guest manifest in portable CSV format for secure offline processing and external auditing.</p>
                                        </div>
                                        <Button className="btn btn-pink rounded-pill mt-auto fw-bold px-4 py-2" onClick={exportToCSV}>EXPORT ARCHIVE</Button>
                                    </div>
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                </div>
            </Container>
        </div>
    );
};

export default OrganizerEventDashboard;

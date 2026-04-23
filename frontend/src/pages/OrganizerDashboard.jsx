import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import * as eventApi from '../api/eventApi';
import * as analyticsApi from '../api/analyticsApi';
import { RevenueChart, TicketDistributionChart } from '../components/analytics/DashboardCharts';
import DashboardSkeleton from '../components/analytics/DashboardSkeleton';
import {
    FaCalendarAlt, FaTicketAlt, FaWallet, FaBolt, FaEye, FaEdit, FaTrash
} from 'react-icons/fa';
import '../css/dashboard.css';
import '../css/global.css';

const OrganizerDashboard = () => {
    const [stats, setStats] = useState({ totalEvents: 0, approvedEvents: 0, totalTicketsSold: 0, totalRevenue: 0 });
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, eventsRes] = await Promise.all([
                analyticsApi.getOrganizerStats(),
                eventApi.getMyEvents()
            ]);
            
            setStats(statsRes.data?.data || { totalEvents: 0, approvedEvents: 0, totalTicketsSold: 0, totalRevenue: 0 });
            setEvents((eventsRes.data?.data || []).slice(0, 5)); // recent 5 events
        } catch (err) {
            console.error('Failed to load organizer dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event? This action is irreversible.")) return;
        try {
            await eventApi.deleteEvent(id);
            fetchData();
        } catch (err) {
            alert('Failed to delete event.');
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    const platformFee = (stats?.totalRevenue || 0) * 0.10; // 10% platform fee
    const netProfit = (stats?.totalRevenue || 0) - platformFee;

    return (
        <div className="dashboard-page" style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #f3e8ff 100%)' }}>
            <Container fluid className="px-md-5">
                {/* ─── Header ─── */}
                <div className="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
                    <div>
                        <h2 className="dashboard-title-main">Dashboard</h2>
                        <p className="dashboard-subtext">Manage your events, view analytics, and control your enterprise.</p>
                    </div>
                </div>

                {/* ─── Stats Grid ─── */}
                <div className="stats-grid-saas mb-5">
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Total Events</span>
                        <h3 className="card-value-lg">{stats?.totalEvents || 0}</h3>
                        <div className="mt-2 text-slate small fw-bold">All Time</div>
                    </div>
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Upcoming Events</span>
                        <h3 className="card-value-lg">{stats?.approvedEvents || 0}</h3>
                        <div className="mt-2 text-success small fw-bold">Live & Approved</div>
                    </div>
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Tickets Sold</span>
                        <h3 className="card-value-lg">{(stats?.totalTicketsSold || 0).toLocaleString()}</h3>
                        <div className="mt-2 text-slate small fw-bold">Total Sales</div>
                    </div>
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Total Revenue</span>
                        <h3 className="card-value-lg">₹{(stats?.totalRevenue || 0).toLocaleString()}</h3>
                        <div className="mt-2 text-slate small fw-bold">Gross Earnings</div>
                    </div>
                </div>

                {/* ─── Middle Section ─── */}
                <Row className="g-4 mb-5">
                    {/* Left: Earnings Summary */}
                    <Col lg={4}>
                        <div className="dashboard-card highlight-card d-flex flex-column justify-content-between h-100">
                            <div>
                                <span className="card-title-sm opacity-75">Net Profit</span>
                                <h2 className="card-value-lg my-2">
                                    ₹{netProfit.toLocaleString()}
                                </h2>
                                <p className="small opacity-75 m-0 mb-4">After Platform Fees</p>
                            </div>
                            <div className="pt-4 border-top border-white/20">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small opacity-80">Gross Revenue:</span>
                                    <span className="fw-bold">₹{(stats?.totalRevenue || 0).toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small opacity-80">Monthly Avg:</span>
                                    <span className="fw-bold">₹{Math.round((stats?.totalRevenue || 0) / 12).toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between text-danger">
                                    <span className="small opacity-80">Platform Fee (10%):</span>
                                    <span className="fw-bold">-₹{platformFee.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </Col>
                    
                    {/* Right: Event Activity */}
                    <Col lg={8}>
                        <div className="dashboard-card h-100">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="dashboard-title-main" style={{ fontSize: '1.25rem' }}>Recent Events Activity</h5>
                            </div>
                            <div className="data-list audit-feed-scroll overflow-auto" style={{ maxHeight: '250px', paddingRight: '5px' }}>
                                {events.length === 0 ? (
                                    <div className="text-center py-5 text-slate opacity-50 small">No recent activity detected.</div>
                                ) : (
                                    events.map(ev => (
                                        <div key={ev._id} className="data-item p-3 d-flex justify-content-between align-items-center">
                                            <div className="data-left">
                                                <h6 className="mb-1 text-truncate" style={{ maxWidth: '300px' }}>{ev.title}</h6>
                                                <p className="m-0 small opacity-75">{new Date(ev.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                <span className={`status-badge ${ev.status === 'live' ? 'badge-pink' : (ev.status === 'pending' ? 'bg-warning text-dark' : 'bg-secondary text-white')}`}>
                                                    {ev.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* ─── Bottom Section ─── */}
                <Row className="g-4 mb-5">
                    {/* Left: My Events List */}
                    <Col lg={7}>
                        <div className="dashboard-card h-100">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="dashboard-title-main" style={{ fontSize: '1.25rem' }}>My Events</h5>
                                <Button as={Link} to="/organizer/events" variant="link" className="text-decoration-none small fw-bold text-pink">View All</Button>
                            </div>
                            <div className="table-responsive rounded-4 border overflow-hidden shadow-sm">
                                <Table hover className="m-0 align-middle text-nowrap">
                                    <thead className="bg-light">
                                        <tr className="small text-uppercase fw-bold text-slate tracking-widest">
                                            <th className="px-4 py-3">Event Name</th>
                                            <th className="py-3">Status</th>
                                            <th className="text-end px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map((ev) => (
                                            <tr key={ev._id} className="border-bottom border-slate-100">
                                                <td className="px-4 py-3 fw-bold text-truncate" style={{ maxWidth: '200px' }}>{ev.title}</td>
                                                <td className="py-3">
                                                    <span className={`status-badge ${ev.status === 'live' ? 'badge-pink' : ''}`}>
                                                        {ev.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="text-end px-4 py-3">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <Button as={Link} to={`/organizer/event/${ev._id}`} className="btn btn-outline-pink shadow-none p-2">
                                                            <FaEye className="text-slate" />
                                                        </Button>
                                                        <Button as={Link} to={`/organizer/edit-event/${ev._id}`} className="btn btn-outline-pink shadow-none p-2">
                                                            <FaEdit />
                                                        </Button>
                                                        <Button className="btn btn-pink shadow-none p-2" onClick={() => handleDeleteEvent(ev._id)}>
                                                            <FaTrash />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {events.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-center py-4 text-muted small">No events found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </Col>
                    
                    {/* Right: Analytics Chart */}
                    <Col lg={5}>
                        <div className="dashboard-card h-100">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="dashboard-title-main" style={{ fontSize: '1.25rem' }}>Platform Analytics</h5>
                            </div>
                            <div className="h-100 pb-4">
                                <RevenueChart data={[
                                    { name: 'Last Qtr', revenue: (stats?.totalRevenue || 0) * 0.4 },
                                    { name: 'Prev Mth', revenue: (stats?.totalRevenue || 0) * 0.7 },
                                    { name: 'Current', revenue: (stats?.totalRevenue || 0) },
                                ]} />
                            </div>
                        </div>
                    </Col>
                </Row>

            </Container>
        </div>
    );
};

export default OrganizerDashboard;

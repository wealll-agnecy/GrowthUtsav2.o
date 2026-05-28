import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Badge, Modal, Form } from 'react-bootstrap';
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
import { formatCurrency } from '../utils/formatUtils';


const OrganizerDashboard = () => {
    const [stats, setStats] = useState({ totalEvents: 0, approvedEvents: 0, totalTicketsSold: 0, totalRevenue: 0 });
    const [revenueData, setRevenueData] = useState({ totalRevenue: 0, totalEvents: 0 });
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchData = async () => {
        try {
            const [statsRes, eventsRes, revenueRes] = await Promise.all([
                analyticsApi.getOrganizerStats(),
                eventApi.getMyEvents(),
                analyticsApi.getOrganizerRevenue()
            ]);

            setStats(statsRes.data?.data || { totalEvents: 0, approvedEvents: 0, totalTicketsSold: 0, totalRevenue: 0 });
            setRevenueData(revenueRes.data || { totalRevenue: 0, totalEvents: 0 });
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
            const toast = (await import('react-hot-toast')).default;
            toast.error('Failed to delete event.');
        }
    };



    if (loading) {
        return <DashboardSkeleton />;
    }

    const netProfit = revenueData?.totalRevenue || 0;

    const calculateDays = (start, end) => {
        if (!start || !end) return 1;
        const diff = new Date(end) - new Date(start);
        return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

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
                        <span className="card-title-sm">Completed Events</span>
                        <h3 className="card-value-lg">{revenueData?.totalEvents || 0}</h3>
                        <div className="mt-2 text-slate small fw-bold">Past Events History</div>
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
                                    {formatCurrency(netProfit)}
                                </h2>
                                <p className="small opacity-75 m-0 mb-4">Finalized Earnings</p>
                            </div>
                            <div className="pt-4 border-top border-white/20">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small opacity-80">Gross Revenue:</span>
                                    <span className="fw-bold">{formatCurrency(stats?.totalRevenue)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small opacity-80">Monthly Avg:</span>
                                    <span className="fw-bold">{formatCurrency(Math.round((stats?.totalRevenue || 0) / 12))}</span>
                                </div>
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
                                            <th className="text-end px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map((ev) => (
                                            <tr key={ev._id} className="border-bottom border-slate-100">
                                                <td className="px-4 py-3 fw-bold text-truncate" style={{ maxWidth: '200px' }}>{ev.title}</td>

                                                <td className="text-end px-4 py-3">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <Button as={Link} to={`/organizer/event/${ev._id}`} className="btn btn-outline-pink shadow-none p-2">
                                                            <FaEye className="text-slate" />
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

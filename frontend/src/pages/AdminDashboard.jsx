import { useState, useEffect } from 'react';
import * as adminApi from '../api/adminApi';
import { Container, Row, Col, Card, Button, Badge, Table, Spinner } from 'react-bootstrap';
import { 
    FaWallet, FaUsers, FaTicketAlt, FaShieldAlt, FaEye, FaCheck, FaTimes,
    FaCalendarCheck, FaShoppingBag, FaBolt, FaChevronRight, FaChartLine,
    FaEllipsisV, FaCheckCircle
} from 'react-icons/fa';
import StatsCard from '../components/analytics/StatsCard';
import DashboardSkeleton from '../components/analytics/DashboardSkeleton';
import { RevenueChart, CategoryPerformanceChart } from '../components/analytics/DashboardCharts';
import { Link } from 'react-router-dom';
import * as analyticsApi from '../api/analyticsApi';
import * as expenseApi from '../api/expenseApi';
import toast from 'react-hot-toast';
import { FaTrash, FaPlus, FaMoneyBillWave, FaChartPie } from 'react-icons/fa';
import '../css/dashboard.css';
import '../css/global.css';



const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [liveStats, setLiveStats] = useState({ 
        revenue: 0, 
        profit: 0, 
        netProfit: 0,
        totalOrganizers: 0, 
        totalStaff: 0, 
        totalEvents: 0, 
        ticketsSold: 0, 
        expenses: 0,
        activities: [] 
    });
    const [profitSummary, setProfitSummary] = useState({ totalRevenue: 0, totalExpenses: 0, netProfit: 0, margin: 0 });
    const [expenses, setExpenses] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expenseLoading, setExpenseLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({});
    
    // New Expense Form State
    const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Other' });


    const fetchDashboardData = async () => {
        try {
            // Fetch core intelligence data consolidated
            const [adminStatsRes, orgRequestsRes, summaryRes, expensesRes] = await Promise.all([
                adminApi.getAdminStats(),
                adminApi.getPendingOrganizers().catch(() => ({ data: { data: [] } })),
                expenseApi.getProfitSummary().catch(() => ({ data: { data: {} } })),
                expenseApi.getExpenses().catch(() => ({ data: { data: [] } }))
            ]);

            const adminData = adminStatsRes.data.data;
            const summary = summaryRes.data.data;

            setLiveStats({
                revenue: adminData.totalRevenue || 0,
                totalOrganizers: adminData.totalOrganizers || 0,
                totalStaff: adminData.totalStaff || 0,
                totalEvents: adminData.totalEvents || 0,
                ticketsSold: adminData.totalTicketsSold || 0,
                profit: adminData.totalProfit || 0,
                expenses: summary.totalExpenses || 0,
                activities: adminData.activities || []
            });
            setProfitSummary(summary);
            setExpenses(expensesRes.data.data);
            setPendingRequests(Array.isArray(orgRequestsRes.data.data) ? orgRequestsRes.data.data.slice(0, 5) : []);
        } catch (err) {
            console.error('Critical Console Sync Failure:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setExpenseLoading(true);
        try {
            await expenseApi.addExpense(newExpense);
            toast.success('Fiscal record added to ledger');
            setNewExpense({ title: '', amount: '', category: 'Other' });
            fetchDashboardData();
        } catch (err) {
            toast.error('Financial indexing failure');
        } finally {
            setExpenseLoading(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Authorize deletion of this fiscal record?')) return;
        try {
            await expenseApi.deleteExpense(id);
            toast.success('Record purged');
            fetchDashboardData();
        } catch (err) {
            toast.error('Deletion error');
        }
    };



    const handleOrgAction = async (id, status) => {
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            if (status === 'approve') {
                await adminApi.approveOrganizer(id);
                toast.success('Identity verified & Host approved');
            } else {
                await adminApi.rejectOrganizer(id, 'Moderation refusal');
                toast.error('Identity rejected');
            }
            setPendingRequests(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            toast.error('Protocol action failure');
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    const currentRevenue = Number(liveStats.revenue) || 0;

    return (
        <div className="dashboard-content-premium">
            <h4 className="fw-black m-0 mb-4 small uppercase tracking-widest text-primary">Platform Core / Console</h4>
            <Row className="g-4 mb-5">
                <Col lg={2} md={4} xs={6}>
                    <StatsCard 
                        title="Organizers" 
                        value={liveStats.totalOrganizers} 
                        growth="Active" 
                        icon={<FaUsers />} 
                        color="#8b5cf6" 
                    />
                </Col>
                <Col lg={2} md={4} xs={6}>
                    <StatsCard 
                        title="Staff Units" 
                        value={liveStats.totalStaff} 
                        growth="Verified" 
                        icon={<FaShieldAlt />} 
                        color="#c084fc" 
                    />
                </Col>
                <Col lg={2} md={4} xs={6}>
                    <StatsCard 
                        title="Event Nodes" 
                        value={liveStats.totalEvents} 
                        growth="Global" 
                        icon={<FaCalendarCheck />} 
                        color="#ec4899" 
                    />
                </Col>
                <Col lg={3} md={6} xs={6}>
                    <StatsCard 
                        title="Clearances (Tickets)" 
                        value={liveStats.ticketsSold} 
                        growth="Sold" 
                        icon={<FaTicketAlt />} 
                        color="#f59e0b" 
                    />
                </Col>
                <Col lg={3} md={6} xs={12}>
                    <StatsCard 
                        title="Economic Flow" 
                        value={`₹${(liveStats?.revenue || 0).toLocaleString()}`} 
                        growth={`₹${liveStats?.profit || 0} Net`} 
                        icon={<FaWallet />} 
                        color="#10b981" 
                    />
                </Col>
            </Row>

            {/* ─── Financial Intelligence & Profit Hub ─── */}
            <Row className="g-4 mb-5">
                <Col lg={4}>
                    <Card className="saas-card p-4 border-0 shadow-2xl h-100 bg-primary/5">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="bg-primary/20 p-3 rounded-4 text-primary shadow-glow"><FaMoneyBillWave size={22} /></div>
                            <div>
                                <h5 className="text-white fw-black m-0 mb-1">PROFIT NODE</h5>
                                <Badge className="bg-primary px-3 py-1 rounded-pill small tracking-widest fw-black">NET CLEARANCE</Badge>
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="text-white small fw-black tracking-widest uppercase mb-1" style={{ opacity: 0.9 }}>Estimated Net Profit</div>
                            <div className="h1 fw-black text-white m-0 tracking-tighter net-profit-val">
                                ₹{(liveStats?.profit || liveStats?.netProfit || 0).toLocaleString()}
                            </div>
                        </div>
                        <div className="mt-auto pt-4 border-top border-white/5">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-white small fw-bold" style={{ opacity: 0.9 }}>Gross Volume:</span>
                                <span className="text-bright fw-black">₹{(liveStats?.revenue || 0).toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-white small fw-bold" style={{ opacity: 0.9 }}>Operational Leak:</span>
                                <span className="text-danger fw-black">-₹{(liveStats?.expenses || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col lg={8}>
                    <Card className="saas-card p-4 border-0 shadow-2xl">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="text-white fw-black m-0 uppercase tracking-widest">Financial Ledger</h5>
                            <Badge className="bg-white/10 text-white px-3 py-2 border border-white/20 rounded-pill small">TRACKING {expenses.length} ENTRIES</Badge>
                        </div>
                        <div className="table-responsive-custom ledger-table-container">
                            <Table variant="dark" hover className="m-0 align-middle">
                                <thead className="bg-white/2 border-bottom border-white/5">
                                    <tr className="small text-white fw-bold uppercase tracking-widest">
                                        <th className="py-3 px-4">Entity</th>
                                        <th className="py-3">Tier</th>
                                        <th className="py-3 text-end">Volume</th>
                                        <th className="py-3 text-end px-4">Purge</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-5 text-muted">No fiscal data logged in master nodes.</td></tr>
                                    ) : (
                                        expenses.map(exp => (
                                            <tr key={exp._id} className="border-bottom border-white/5">
                                                <td className="py-3 px-4 fw-bold">{exp.title}</td>
                                                <td className="py-3"><Badge className="bg-white/5 border border-white/10 text-white-50 px-2 py-1">{exp.category || 'Utility'}</Badge></td>
                                                <td className="py-3 text-end text-danger fw-black">₹{(exp.amount || 0).toLocaleString()}</td>
                                                <td className="py-3 text-end px-4">
                                                    <button onClick={() => handleDeleteExpense(exp._id)} className="btn btn-link p-0 text-danger transition-all rounded-pill fw-bold px-4 py-2 hover-scale"><FaTrash size={12} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                        <div className="mt-4 pt-4 border-top border-white/5">
                            <form onSubmit={handleAddExpense} className="row g-3">
                                <div className="col-md-5">
                                    <input type="text" className="form-control bg-dark border-secondary text-white rounded-pill px-4" placeholder="Expense description..." required value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} />
                                </div>
                                <div className="col-md-3">
                                    <input type="number" className="form-control bg-dark border-secondary text-white rounded-pill px-4" placeholder="Amount..." required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                                </div>
                                <div className="col-md-3">
                                    <select className="form-select bg-dark border-secondary text-white rounded-pill px-4" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                                        <option value="Server">Server</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Staff">Staff</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-1">
                                    <button type="submit" className="btn-primary w-100 p-0 d-flex align-items-center justify-content-center btn rounded-pill fw-medium px-4 py-2" disabled={expenseLoading}>
                                        {expenseLoading ? <Spinner size="sm" /> : <FaPlus size={14} />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </Col>
            </Row>


            {/* ─── Analytics Visualization ─── */}
            <Row className="g-4 mb-5">
                <Col lg={8}>
                    <Card className="saas-card p-5 border-0 shadow-2xl h-100 overflow-hidden">
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <h5 className="text-bright-slate fw-black m-0 uppercase tracking-widest d-flex align-items-center gap-3">
                                <FaChartLine className="text-primary" /> Revenue Propagation
                            </h5>
                            <Badge className="bg-primary-subtle text-primary px-3 py-2 rounded-pill small fw-black tracking-widest">LIVE TELEMETRY</Badge>
                        </div>
                        <RevenueChart data={[
                            { name: 'Jan', revenue: 45000 },
                            { name: 'Feb', revenue: 52000 },
                            { name: 'Mar', revenue: 48000 },
                            { name: 'Apr', revenue: currentRevenue },
                        ]} />
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="saas-card p-5 border-0 shadow-2xl h-100">
                        <CategoryPerformanceChart data={[
                            { name: 'Tech', sales: 400 },
                            { name: 'Music', sales: 300 },
                            { name: 'Comedy', sales: 200 },
                            { name: 'Startup', sales: 100 },
                        ]} />
                    </Card>
                </Col>
            </Row>


            {/* ─── Operational Logs ─── */}
            <Row className="g-4">
                <Col lg={6}>
                    <Card className="saas-card h-100 p-0 border-0 overflow-hidden">
                        <div className="p-4 d-flex justify-content-between align-items-center bg-white/2">
                            <h5 className="text-bright-slate fw-black m-0">Incident & Audit Feed</h5>
                            <FaEllipsisV className="text-soft-purple ms-auto cursor-pointer" size={14} />
                        </div>
                        <Card.Body className="p-4 overflow-auto audit-feed-scroll">
                            <div className="activity-feed-premium">
                                {(liveStats?.activities || []).length > 0 ? (
                                    (liveStats?.activities || []).map((log, i) => (
                                        <div key={i} className="activity-item">
                                            <div className="activity-dot shadow-lg"></div>
                                            <div className="d-flex justify-content-between align-items-start mb-1">
                                                <h6 className="text-bright-slate fw-black m-0 small tracking-tight">{log.type.toUpperCase()}</h6>
                                                <span className="text-muted small audit-feed-timestamp">{new Date(log.time).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-soft-purple small m-0 opacity-80 d-flex align-items-center gap-2">
                                                <span className="text-primary opacity-60">
                                                    {log.type === 'booking' ? <FaShoppingBag /> : <FaBolt />}
                                                </span> 
                                                {log.message}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-5 text-muted small">No recent activity detected in master logs.</div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="saas-card h-100 p-0 border-0 overflow-hidden">
                         <div className="p-4 d-flex justify-content-between align-items-center bg-white/2">
                            <h5 className="text-bright-slate fw-black m-0">Identity Moderation</h5>
                            <Badge className="bg-danger-subtle px-3 py-2 rounded-pill small fw-black tracking-widest">{pendingRequests.length} ALERT</Badge>
                        </div>
                        <Card.Body className="p-4">
                            {pendingRequests.length === 0 ? (
                                <div className="text-center py-5">
                                    <div className="bg-success-subtle p-3 rounded-circle d-inline-flex mb-3">
                                        <FaCheckCircle size={30} />
                                    </div>
                                    <h6 className="text-bright-slate fw-bold m-0">Moderation Clear</h6>
                                    <p className="text-muted small">No pending identity requests</p>
                                </div>
                            ) : (
                                <Table borderless className="align-middle premium-table">
                                    <tbody>
                                        {pendingRequests.map((req) => (
                                            <tr key={req._id}>
                                                <td className="ps-0 pt-3 pb-3 border-bottom border-white/5">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="rounded-circle bg-purple-subtle d-flex align-items-center justify-content-center fw-black text-primary shadow-sm moderation-avatar-circle">
                                                            {req.name?.charAt(0) || 'H'}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <div className="text-bright-slate fw-black small truncate mb-1">{req.name || 'Identity Host'}</div>

                                                            <div className="text-soft-purple small truncate moderation-email-label">{req.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-end pe-0 pt-3 pb-3 border-bottom border-white/5">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline-info" 
                                                            className="p-2 shadow-none hover-bg-white/10 btn rounded-pill fw-medium px-4 py-2"
                                                            as={Link}
                                                            to="/admin/organizer-requests"
                                                            title="Deep Audit"
                                                        >
                                                            <FaEye className="text-info" />
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="success" 
                                                            className="p-2 glow-hover-sm btn rounded-pill fw-medium px-4 py-2"
                                                            onClick={() => handleOrgAction(req._id, 'approve')}
                                                            disabled={actionLoading[req._id]}
                                                            title="Authorize Host"
                                                        >
                                                            {actionLoading[req._id] ? <Spinner size="sm" animation="border" /> : <FaCheck />}
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline-danger" 
                                                            className="p-2 shadow-none hover-bg-danger/10 btn rounded-pill fw-medium px-4 py-2"
                                                            onClick={() => handleOrgAction(req._id, 'reject')}
                                                            disabled={actionLoading[req._id]}
                                                            title="Purge Identity"
                                                        >
                                                            <FaTimes />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                            <div className="mt-4 text-center">
                                <Button as={Link} to="/admin/organizer-requests" className="btn rounded-pill py-2 d-flex align-items-center gap-3 mx-auto fw-medium px-4">
                                    Full Moderation Protocol <FaChevronRight size={10} />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;

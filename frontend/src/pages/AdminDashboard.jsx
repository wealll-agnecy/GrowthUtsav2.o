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
        <div className="dashboard-page p-0">
            <Container fluid className="px-md-5 pt-0 pb-3">
                {/* ─── Header ─── */}
                <div className="dashboard-header overview-section mb-3">
                    <h2 className="dashboard-title-main mb-1">Overview</h2>
                    <p className="dashboard-subtext m-0">Analytics, finances and platform management nodes.</p>
                </div>

                {/* ─── Stats Grid ─── */}
                <div className="stats-grid-saas mt-2">
                    <div className="dashboard-card">
                        <span className="card-title-sm">Organizers</span>
                        <h3 className="card-value-lg">{liveStats.totalOrganizers}</h3>
                        <div className="mt-2 text-success small fw-bold">Active Hosts</div>
                    </div>
                    <div className="dashboard-card">
                        <span className="card-title-sm">Staff units</span>
                        <h3 className="card-value-lg">{liveStats.totalStaff}</h3>
                        <div className="mt-2 text-slate small fw-bold">Master Nodes</div>
                    </div>
                    <div className="dashboard-card">
                        <span className="card-title-sm">Live Events</span>
                        <h3 className="card-value-lg">{liveStats.totalEvents}</h3>
                        <div className="mt-2 text-slate small fw-bold">Global Catalog</div>
                    </div>
                    <div className="dashboard-card">
                        <span className="card-title-sm">Tickets</span>
                        <h3 className="card-value-lg">{liveStats.ticketsSold.toLocaleString()}</h3>
                        <div className="mt-2 text-slate small fw-bold">Total Sales</div>
                    </div>
                </div>

                {/* ─── Primary Intelligence ─── */}
                <Row className="g-4 mb-4">
                    <Col lg={4}>
                        <div className="dashboard-card highlight-card d-flex flex-column justify-content-between">
                            <div>
                                <span className="card-title-sm opacity-75">Net Profit</span>
                                <h2 className="card-value-lg my-2">
                                    ₹{(liveStats?.profit || liveStats?.netProfit || 0).toLocaleString()}
                                </h2>
                                <p className="small opacity-75 m-0 mb-4">Master Ledger Calculation</p>
                            </div>
                            <div className="pt-4 border-top border-white/20">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small opacity-80">Gross Volume:</span>
                                    <span className="fw-bold">₹{(liveStats?.revenue || 0).toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="small opacity-80">Operational Leak:</span>
                                    <span className="fw-bold">-₹{(liveStats?.expenses || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </Col>
                    
                    <Col lg={8}>
                        <div className="dashboard-card">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="dashboard-title-main" style={{ fontSize: '1.25rem' }}>Financial Ledger</h5>
                                <span className="status-badge">{expenses.length} Entries</span>
                            </div>
                            
                            <div className="data-list audit-feed-scroll overflow-auto mb-4" style={{ maxHeight: '280px', paddingRight: '5px' }}>
                                {expenses.length === 0 ? (
                                    <div className="text-center py-5 text-slate opacity-50 small">No transactions recorded.</div>
                                ) : (
                                    expenses.map(exp => (
                                        <div key={exp._id} className="data-item">
                                            <div className="data-left">
                                                <h6>{exp.title}</h6>
                                                <p>{exp.category || 'General'}</p>
                                            </div>
                                            <div className="d-flex align-items-center gap-4">
                                                <span className="fw-bold text-danger">₹{(exp.amount || 0).toLocaleString()}</span>
                                                <button onClick={() => handleDeleteExpense(exp._id)} className="btn btn-link p-0 text-slate hover-text-danger transition-all">
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleAddExpense} className="row g-2 pt-3 border-top">
                                <div className="col-md-5">
                                    <input type="text" className="form-control rounded-8 border-slate-200" placeholder="Description" required value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} />
                                </div>
                                <div className="col-md-2">
                                    <input type="number" className="form-control rounded-8 border-slate-200" placeholder="Amount" required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                                </div>
                                <div className="col-md-3">
                                    <select className="form-select rounded-8 border-slate-200" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                                        <option value="Server">Server</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Staff">Staff</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <button type="submit" className="btn btn-pink w-100 fw-bold py-2" disabled={expenseLoading}>
                                        {expenseLoading ? <Spinner size="sm" /> : 'Log Entry'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Col>
                </Row>

                {/* ─── Secondary Data Grid ─── */}
                <Row className="g-4 mb-4">
                    <Col lg={4}>
                        <div className="dashboard-card">
                            <h5 className="dashboard-title-main" style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Identity Moderation</h5>
                            <div className="data-list audit-feed-scroll overflow-auto" style={{ maxHeight: '350px', paddingRight: '5px' }}>
                                {pendingRequests.length === 0 ? (
                                    <div className="text-center py-5">
                                        <FaCheckCircle className="text-success opacity-20 mb-3" size={40} />
                                        <p className="text-slate opacity-50 small m-0">No pending requests</p>
                                    </div>
                                ) : (
                                    pendingRequests.map((req) => (
                                        <div key={req._id} className="data-item p-3">
                                            <div className="data-left">
                                                <h6>{req.name || 'User'}</h6>
                                                <p className="truncate m-0">{req.email}</p>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button className="btn btn-outline-pink border" as={Link} to="/admin/organizer-requests">
                                                    <FaEye className="text-slate" />
                                                </Button>
                                                <Button className="btn btn-pink p-2" onClick={() => handleOrgAction(req._id, 'approve')} disabled={actionLoading[req._id]}>
                                                    {actionLoading[req._id] ? <Spinner size="sm" /> : <FaCheck />}
                                                </Button>
                                                <Button className="btn btn-outline-pink p-2" onClick={() => handleOrgAction(req._id, 'reject')} disabled={actionLoading[req._id]}>
                                                    <FaTimes />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {pendingRequests.length > 0 && (
                                <div className="mt-4 text-center">
                                    <Link to="/admin/organizer-requests" className="btn btn-outline-pink w-100 text-decoration-none d-block text-center">
                                        View All Requests
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Col>

                    <Col lg={8}>
                        <div className="dashboard-card">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="dashboard-title-main" style={{ fontSize: '1.25rem' }}>Revenue Intelligence</h5>
                                <span className="status-badge badge-pink">Real-time</span>
                            </div>
                            <div style={{ height: '340px' }}>
                                <RevenueChart data={[
                                    { name: 'Jan', revenue: 45000 },
                                    { name: 'Feb', revenue: 52000 },
                                    { name: 'Mar', revenue: 48000 },
                                    { name: 'Apr', revenue: currentRevenue },
                                ]} />
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* ─── Audit Feed ─── */}
                <div className="dashboard-card mb-4">
                    <h5 className="dashboard-title-main" style={{ fontSize: '1.25rem', marginBottom: '25px' }}>Security & Audit Feed</h5>
                    <div className="data-list">
                        {(liveStats?.activities || []).length > 0 ? (
                            (liveStats?.activities || []).slice(0, 10).map((log, i) => (
                                <div key={i} className="data-item p-3 border-0 bg-transparent border-bottom rounded-0">
                                    <div className="data-left">
                                        <h6 style={{ fontSize: '0.875rem' }}>{log.message}</h6>
                                        <p style={{ fontSize: '0.75rem' }}>{new Date(log.time).toLocaleString()}</p>
                                    </div>
                                    <div className="text-slate uppercase small fw-bold tracking-wider" style={{ opacity: 0.6 }}>
                                        {log.type}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-5 text-slate opacity-40 small">Zero active logs.</div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default AdminDashboard;

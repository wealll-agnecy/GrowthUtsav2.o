import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../api/apiClient';
import { toast } from 'react-hot-toast';
import DashboardSkeleton from '../components/analytics/DashboardSkeleton';
import '../css/dashboard.css';
import '../css/global.css';
import { formatCurrency } from '../utils/formatUtils';

const EventDetails = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Expense Form State
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        amount: '',
        category: 'Other',
        description: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const categories = ['Venue', 'Makeup Products', 'Decoration', 'Marketing', 'Staff', 'Food', 'Travel', 'Other'];

    const fetchDetails = async () => {
        try {
            const res = await apiClient.get(`/api/v1/organizer/event/${id}/details`);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load event analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id || id === 'undefined') {
            console.error("[CLIENT]: Detected invalid 'undefined' event ID in URL");
            setLoading(false);
            return;
        }
        fetchDetails();
    }, [id]);

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEditing) {
                await apiClient.put(`/api/v1/expenses/${editId}`, expenseForm);
                toast.success('Expense updated successfully');
            } else {
                await apiClient.post('/api/v1/expenses', { ...expenseForm, eventId: id });
                toast.success('Expense added successfully');
            }
            setExpenseForm({
                title: '',
                amount: '',
                category: 'Other',
                description: '',
                date: new Date().toISOString().split('T')[0],
                status: 'Pending'
            });
            setIsEditing(false);
            setEditId(null);
            fetchDetails();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (exp) => {
        setExpenseForm({
            title: exp.title,
            amount: exp.amount,
            category: exp.category,
            description: exp.description || '',
            date: new Date(exp.date).toISOString().split('T')[0],
            status: exp.status || 'Pending'
        });
        setIsEditing(true);
        setEditId(exp._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (expId) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await apiClient.delete(`/api/v1/expenses/${expId}`);
            toast.success('Expense deleted');
            fetchDetails();
        } catch (err) {
            toast.error('Failed to delete expense');
        }
    };

    const toggleStatus = async (exp) => {
        try {
            const newStatus = exp.status === 'Paid' ? 'Pending' : 'Paid';
            await apiClient.put(`/api/v1/expenses/${exp._id}`, { status: newStatus });
            fetchDetails();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <DashboardSkeleton />;

    if (error) return (
        <Container className="py-5 text-center">
            <Alert variant="danger" className="dashboard-card border-danger/20 text-danger rounded-4 p-4 shadow-sm">
                <h4 className="fw-bold mb-2">Error Loading Analytics</h4>
                <p>{error}</p>
            </Alert>
        </Container>
    );

    if (!data || data.totalTickets === 0) {
        return (
            <Container className="py-5 text-center">
                <h5 className="dashboard-title-main">No Data Available for this Event</h5>
            </Container>
        );
    }

    const { eventName, totalTickets, totalRevenue, totalExpenses, profit, salesByDate, planSales, expenses } = data;

    return (
        <div className="dashboard-page">
            <Container fluid className="px-md-5">
                {/* Header */}
                <div className="dashboard-header mb-5">
                    <h2 className="dashboard-title-main">Event Analytics: {eventName}</h2>
                    <p className="dashboard-subtext">Comprehensive breakdown of sales and expenditure data.</p>
                </div>

                {/* Expense Entry Section */}
                <div className="dashboard-card shadow-sm mb-5">
                    <h5 className="dashboard-title-main mb-4" style={{ fontSize: '1.25rem' }}>
                        {isEditing ? '📝 Edit Expense' : '➕ Add New Expense'}
                    </h5>
                    <form onSubmit={handleExpenseSubmit} className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Expense Title</label>
                            <input 
                                type="text" 
                                className="form-control rounded-3" 
                                placeholder="e.g. Venue Advance"
                                value={expenseForm.title}
                                onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                                required
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Amount (INR)</label>
                            <input 
                                type="number" 
                                className="form-control rounded-3" 
                                placeholder="0.00"
                                value={expenseForm.amount}
                                onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Category</label>
                            <select 
                                className="form-select rounded-3"
                                value={expenseForm.category}
                                onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Date</label>
                            <input 
                                type="date" 
                                className="form-control rounded-3"
                                value={expenseForm.date}
                                onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                                required
                            />
                        </div>
                        <div className="col-md-9">
                            <label className="form-label small fw-bold">Notes / Description</label>
                            <input 
                                type="text" 
                                className="form-control rounded-3" 
                                placeholder="Add additional details..."
                                value={expenseForm.description}
                                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                            />
                        </div>
                        <div className="col-md-3 d-flex align-items-end gap-2">
                            <button type="submit" className="btn btn-primary-custom w-100 py-2" disabled={submitting}>
                                {submitting ? 'Processing...' : (isEditing ? 'Update' : 'Add Expense')}
                            </button>
                            {isEditing && (
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary rounded-pill px-3"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditId(null);
                                        setExpenseForm({
                                            title: '', amount: '', category: 'Other', description: '', 
                                            date: new Date().toISOString().split('T')[0], status: 'Pending'
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* 1. Summary Cards */}
                <div className="stats-grid-saas mb-5">
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Total Tickets Sold</span>
                        <h3 className="card-value-lg">{totalTickets.toLocaleString()}</h3>
                    </div>
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Total Revenue</span>
                        <h3 className="card-value-lg text-success">{formatCurrency(totalRevenue)}</h3>
                    </div>
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Total Expenses</span>
                        <h3 className="card-value-lg text-danger">{formatCurrency(totalExpenses)}</h3>
                    </div>
                    <div className={`dashboard-card shadow-sm ${profit > 0 ? '' : (profit < 0 ? 'highlight-card' : '')}`}>
                        <span className="card-title-sm">{profit < 0 ? 'Net Loss' : 'Net Profit'}</span>
                        <h3 className={`card-value-lg ${profit > 0 ? 'text-success' : (profit < 0 ? 'text-danger' : '')}`}>
                            {formatCurrency(Math.abs(profit))}
                        </h3>
                    </div>
                </div>

                <Row className="g-4 mb-5">
                    {/* 2. Date-wise Sales Table */}
                    <Col lg={6}>
                        <div className="dashboard-card shadow-sm h-100">
                            <h5 className="dashboard-title-main mb-4" style={{ fontSize: '1.25rem' }}>Date-wise Ticket Sales</h5>
                            <div className="table-responsive rounded-4 border overflow-hidden shadow-sm">
                                <Table hover className="m-0 align-middle text-nowrap">
                                    <thead className="bg-light">
                                        <tr className="small text-uppercase fw-bold text-slate tracking-widest">
                                            <th className="px-4 py-3">Date</th>
                                            <th className="py-3 text-end">Tickets Sold</th>
                                            <th className="px-4 py-3 text-end">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesByDate?.length > 0 ? salesByDate.map((sales, idx) => (
                                            <tr key={idx} className="border-bottom border-slate-100">
                                                <td className="px-4 py-3 fw-bold">{sales.date}</td>
                                                <td className="py-3 text-end">{sales.ticketsSold.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-end fw-bold text-success">{formatCurrency(sales.revenue)}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={3} className="text-center py-4 text-muted small">No tickets sold yet.</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </Col>

                    {/* 3. Plan-wise Sales Table */}
                    <Col lg={6}>
                        <div className="dashboard-card shadow-sm h-100">
                            <h5 className="dashboard-title-main mb-4" style={{ fontSize: '1.25rem' }}>Plan-wise Sales</h5>
                            <div className="table-responsive rounded-4 border overflow-hidden shadow-sm">
                                <Table hover className="m-0 align-middle text-nowrap">
                                    <thead className="bg-light">
                                        <tr className="small text-uppercase fw-bold text-slate tracking-widest">
                                            <th className="px-4 py-3">Plan Name</th>
                                            <th className="py-3 text-end">Tickets Sold</th>
                                            <th className="px-4 py-3 text-end">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {planSales?.length > 0 ? planSales.map((plan, idx) => (
                                            <tr key={idx} className="border-bottom border-slate-100">
                                                <td className="px-4 py-3 fw-bold">
                                                    <span className="status-badge badge-pink">{plan.planName.toUpperCase()}</span>
                                                </td>
                                                <td className="py-3 text-end">{plan.ticketsSold.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-end fw-bold text-success">{formatCurrency(plan.revenue)}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={3} className="text-center py-4 text-muted small">No plans matched.</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* 4. Expenses Breakdown Table */}
                <div className="dashboard-card shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="dashboard-title-main m-0" style={{ fontSize: '1.25rem' }}>Expense History</h5>
                        <div className="text-end">
                            <span className="small text-muted d-block">Total Event Expenses</span>
                            <span className="fw-bold text-danger h5 m-0">{formatCurrency(totalExpenses)}</span>
                        </div>
                    </div>
                    <div className="table-responsive rounded-4 border overflow-hidden shadow-sm">
                        <Table hover className="m-0 align-middle text-nowrap">
                            <thead className="bg-light">
                                <tr className="small text-uppercase fw-bold text-slate tracking-widest">
                                    <th className="px-4 py-3">Expense Details</th>
                                    <th className="py-3">Category</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3">Date</th>
                                    <th className="px-4 py-3 text-end">Amount</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses?.length > 0 ? expenses.map((exp, idx) => (
                                    <tr key={idx} className="border-bottom border-slate-100">
                                        <td className="px-4 py-3">
                                            <div className="fw-bold">{exp.title}</div>
                                            <div className="small text-muted">{exp.description || 'No notes'}</div>
                                        </td>
                                        <td className="py-3">
                                            <span className="status-badge badge-slate">{exp.category}</span>
                                        </td>
                                        <td className="py-3">
                                            <span 
                                                className={`status-badge cursor-pointer ${exp.status === 'Paid' ? 'badge-green' : 'badge-pink'}`}
                                                onClick={() => toggleStatus(exp)}
                                                title="Click to toggle status"
                                            >
                                                {exp.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-muted">{new Date(exp.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-end fw-bold text-danger">{formatCurrency(exp.amount)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button 
                                                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                    onClick={() => handleEdit(exp)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                    onClick={() => handleDelete(exp._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="text-center py-4 text-muted small">No expenses recorded for this event.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>

            </Container>
        </div>
    );
};

export default EventDetails;

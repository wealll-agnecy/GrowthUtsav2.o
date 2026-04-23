import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import DashboardSkeleton from '../components/analytics/DashboardSkeleton';
import '../css/dashboard.css';
import '../css/global.css';

const EventDetails = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get(`/api/v1/organizer/event/${id}/details`, {
                    withCredentials: true
                });
                console.log(res.data);
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load event analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

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

                {/* 1. Summary Cards */}
                <div className="stats-grid-saas mb-5">
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Total Tickets Sold</span>
                        <h3 className="card-value-lg">{totalTickets.toLocaleString()}</h3>
                    </div>
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Total Revenue</span>
                        <h3 className="card-value-lg text-success">₹{(totalRevenue || 0).toLocaleString()}</h3>
                    </div>
                    <div className="dashboard-card shadow-sm">
                        <span className="card-title-sm">Total Expenses</span>
                        <h3 className="card-value-lg text-danger">₹{(totalExpenses || 0).toLocaleString()}</h3>
                    </div>
                    <div className={`dashboard-card shadow-sm ${profit > 0 ? '' : (profit < 0 ? 'highlight-card' : '')}`}>
                        <span className="card-title-sm">{profit < 0 ? 'Net Loss' : 'Net Profit'}</span>
                        <h3 className={`card-value-lg ${profit > 0 ? 'text-success' : (profit < 0 ? 'text-danger' : '')}`}>
                            ₹{Math.abs(profit).toLocaleString()}
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
                                                <td className="px-4 py-3 text-end fw-bold text-success">₹{(sales.revenue || 0).toLocaleString()}</td>
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
                                                <td className="px-4 py-3 text-end fw-bold text-success">₹{(plan.revenue || 0).toLocaleString()}</td>
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
                    <h5 className="dashboard-title-main mb-4" style={{ fontSize: '1.25rem' }}>Expenses Breakdown</h5>
                    <div className="table-responsive rounded-4 border overflow-hidden shadow-sm">
                        <Table hover className="m-0 align-middle text-nowrap">
                            <thead className="bg-light">
                                <tr className="small text-uppercase fw-bold text-slate tracking-widest">
                                    <th className="px-4 py-3">Expense Title / Category</th>
                                    <th className="py-3">Date Recorded</th>
                                    <th className="px-4 py-3 text-end">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses?.length > 0 ? expenses.map((exp, idx) => (
                                            <tr key={idx} className="border-bottom border-slate-100">
                                                <td className="px-4 py-3 fw-bold">{exp.title}</td>
                                                <td className="py-3 text-muted">{new Date(exp.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-end fw-bold text-danger">₹{(exp.amount || 0).toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                    <tr><td colSpan={3} className="text-center py-4 text-muted small">No expenses recorded for this event.</td></tr>
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

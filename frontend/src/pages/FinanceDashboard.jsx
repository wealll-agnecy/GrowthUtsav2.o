import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { 
    FaWallet, FaMoneyBillWave, FaChartLine, FaPlus, FaTrash, 
    FaCalendarAlt, FaFileInvoiceDollar, FaCheckCircle, FaExclamationTriangle,
    FaArrowLeft, FaFilter, FaDownload
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as expenseApi from '../api/expenseApi';
import * as eventApi from '../api/eventApi';
import StatsCard from '../components/analytics/StatsCard';
import { RevenueChart } from '../components/analytics/DashboardCharts';
import toast from 'react-hot-toast';

const FinanceDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [financialData, setFinancialData] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [events, setEvents] = useState([]);
    
    // Expense Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        title: '',
        amount: '',
        category: 'Other',
        eventId: '',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        try {
            const [profitRes, expenseRes, eventRes] = await Promise.all([
                expenseApi.getDetailedProfit(),
                expenseApi.getExpenses(),
                eventApi.getEvents()
            ]);
            setFinancialData(profitRes.data.data);
            setExpenses(expenseRes.data.data);
            setEvents(eventRes.data.data || []);
        } catch (err) {
            toast.error('Failed to sync financial node telemetry');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await expenseApi.addExpense(newExpense);
            toast.success('Fiscal record indexed successfully');
            setShowAddModal(false);
            setNewExpense({ title: '', amount: '', category: 'Other', eventId: '', date: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (err) {
            toast.error('Financial entry protocol failure');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('CRITICAL: Purge this fiscal record from master ledger?')) return;
        try {
            await expenseApi.deleteExpense(id);
            toast.success('Record purged');
            fetchData();
        } catch (err) {
            toast.error('Deletion failure');
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-transparent">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <FaWallet size={50} className="text-primary opacity-50" />
            </motion.div>
        </div>
    );

    const overall = financialData?.overall || { totalRevenue: 0, totalExpenses: 0, totalProfit: 0, margin: 0 };

    return (
        <div className="dashboard-content-premium">
            {/* ─── Header ─── */}
            <div className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-4 pt-4">
                <div className="flex-grow-1">
                    <Badge className="bg-primary-subtle text-primary border border-primary-light px-3 py-2 mb-3 text-uppercase tracking-widest fw-black small shadow-2xl">
                        <FaFileInvoiceDollar className="me-2" /> Global Fiscal Control
                    </Badge>
                    <h1 className="fw-black m-0 tracking-tighter text-white" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1 }}>
                        Finance <span className="gradient-text">Command</span>
                    </h1>
                </div>
                <div className="d-flex gap-3">
                    <Button
                        variant="outline-light"
                        className="rounded-4 px-4 py-3 fw-black border-2 text-uppercase tracking-widest small shadow-lg d-flex align-items-center gap-3"
                        onClick={() => window.print()}
                    >
                        <FaDownload /> EXPORT AUDIT
                    </Button>
                    <Button
                        className="neon-btn btn-primary rounded-4 px-5 py-3 fw-black uppercase tracking-widest small shadow-2xl d-flex align-items-center gap-3 transition-all border-0"
                        onClick={() => setShowAddModal(true)}
                    >
                        <FaPlus /> INDEX EXPENSE
                    </Button>
                </div>
            </div>

            {/* ─── Mission Critical Stats ─── */}
            <Row className="g-4 mb-5">
                <Col lg={4}>
                    <StatsCard 
                        title="Aggregated Revenue" 
                        value={`₹${overall.totalRevenue.toLocaleString()}`} 
                        icon={<FaChartLine />} 
                        color="#8b5cf6" 
                        delay={0.1}
                    />
                </Col>
                <Col lg={4}>
                    <StatsCard 
                        title="Operational Leak" 
                        value={`₹${overall.totalExpenses.toLocaleString()}`} 
                        icon={<FaMoneyBillWave />} 
                        color="#ec4899" 
                        delay={0.2}
                    />
                </Col>
                <Col lg={4}>
                    <StatsCard 
                        title="Net Clearance (Profit)" 
                        value={`₹${overall.totalProfit.toLocaleString()}`} 
                        growth={`${overall.margin}% MARGIN`}
                        icon={<FaWallet />} 
                        color="#06b6d4" 
                        delay={0.3}
                    />
                </Col>
            </Row>

            <Row className="g-4 mb-5">
                {/* ─── Revenue Visualization ─── */}
                <Col lg={8}>
                    <Card className="saas-card p-5 border-0 shadow-2xl h-100 overflow-hidden">
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <h5 className="text-white fw-black m-0 uppercase tracking-widest d-flex align-items-center gap-3">
                                <FaChartLine className="text-primary" /> Revenue Propagation
                            </h5>
                        </div>
                        <RevenueChart data={[
                            { name: 'Launch', revenue: 0 },
                            { name: 'Phase 1', revenue: overall.totalRevenue * 0.4 },
                            { name: 'Phase 2', revenue: overall.totalRevenue * 0.8 },
                            { name: 'Current', revenue: overall.totalRevenue },
                        ]} />
                    </Card>
                </Col>
                
                {/* ─── Top Profitable Nodes ─── */}
                <Col lg={4}>
                    <Card className="saas-card p-5 border-0 shadow-2xl h-100">
                        <h5 className="text-white fw-black m-0 mb-5 uppercase tracking-widest">Node Performance</h5>
                        <div className="d-flex flex-column gap-4">
                            {(financialData?.eventWise || []).slice(0, 5).sort((a,b) => b.profit - a.profit).map((node, i) => (
                                <div key={i} className="p-3 rounded-4 bg-white/5 border border-white/5 shadow-inner">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="text-bright fw-black small truncate pe-3">{node.title}</div>
                                        <Badge bg={node.profit >= 0 ? 'success-subtle' : 'danger-subtle'} text={node.profit >= 0 ? 'success' : 'danger'} className="fw-black px-2 py-1 small">
                                            ₹{Math.abs(node.profit).toLocaleString()}
                                        </Badge>
                                    </div>
                                    <div className="small text-white-50 opacity-60">Rev: ₹{node.revenue.toLocaleString()} | Exp: ₹{node.expenses.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* ─── Financial Ledger ─── */}
            <Card className="saas-card border-0 rounded-5 overflow-hidden shadow-2xl mb-5">
                <Card.Header className="bg-white/2 border-bottom border-white/5 p-4 d-flex justify-content-between align-items-center">
                    <h5 className="text-white fw-black m-0 uppercase tracking-widest">Master Expenditure Ledger</h5>
                    <Badge className="bg-white/5 border border-white/10 px-3 py-2 rounded-pill small fw-black tracking-widest text-white-50">
                        {expenses.length} FISCAL ENTRIES
                    </Badge>
                </Card.Header>
                <div className="table-responsive">
                    <Table variant="dark" hover className="m-0 align-middle">
                        <thead className="bg-white/2 border-bottom border-white/5">
                            <tr className="small text-white-50 fw-black uppercase tracking-widest">
                                <th className="py-4 px-5">Entry Title</th>
                                <th className="py-4">Sector</th>
                                <th className="py-4">Association (Node)</th>
                                <th className="py-4">Timestamp</th>
                                <th className="py-4 text-end">Volume (₹)</th>
                                <th className="py-4 text-end px-5">Protocol</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted h5 fw-black opacity-30">NO FISCAL ENTRIES INDEXED</td></tr>
                            ) : (
                                expenses.map((exp, idx) => (
                                    <tr key={exp._id} className="border-bottom border-white/5">
                                        <td className="py-4 px-5 fw-black text-white">{exp.title}</td>
                                        <td className="py-4">
                                            <Badge className="bg-white/5 border border-white/10 text-white-50 px-3 py-2 rounded-pill">
                                                {exp.category}
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-white-50">
                                            {exp.eventId?.title || 'Global Platform'}
                                        </td>
                                        <td className="py-4 text-white-50 small font-monospace">
                                            {new Date(exp.date).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 text-end text-danger fw-black fs-5">
                                            -₹{exp.amount.toLocaleString()}
                                        </td>
                                        <td className="py-4 text-end px-5">
                                            <Button 
                                                variant="outline-danger" 
                                                className="rounded-circle p-2 border-0 shadow-none hover-bg-danger/10"
                                                onClick={() => handleDeleteExpense(exp._id)}
                                            >
                                                <FaTrash size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* ─── Add Expense Modal ─── */}
            <Modal 
                show={showAddModal} 
                onHide={() => setShowAddModal(false)} 
                centered 
                className="premium-modal"
                contentClassName="glass-panel border-white/10 rounded-5 shadow-2xl overflow-hidden"
            >
                <div className="p-5">
                    <h3 className="fw-black text-white uppercase tracking-widest mb-4">Index Fiscal Entry</h3>
                    <Form onSubmit={handleAddExpense}>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-black text-white-50 tracking-widest uppercase">Entry Title</Form.Label>
                            <Form.Control 
                                type="text" 
                                className="bg-white/5 border-white/10 text-white rounded-4 p-3 shadow-none focus-border-primary"
                                placeholder="e.g., Social Media Marketing Node"
                                required
                                value={newExpense.title}
                                onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                            />
                        </Form.Group>
                        <Row className="g-4 mb-4">
                            <Col md={6}>
                                <Form.Label className="small fw-black text-white-50 tracking-widest uppercase">Amount (₹)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    className="bg-white/5 border-white/10 text-white rounded-4 p-3 shadow-none focus-border-primary"
                                    placeholder="0.00"
                                    required
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="small fw-black text-white-50 tracking-widest uppercase">Sector</Form.Label>
                                <Form.Select 
                                    className="bg-white/5 border-white/10 text-white rounded-4 p-3 shadow-none focus-border-primary"
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                                >
                                    <option value="Server">Server Node</option>
                                    <option value="Marketing">Growth Marketing</option>
                                    <option value="Staff">Operations Staff</option>
                                    <option value="Infrastructure">Infrastructure</option>
                                    <option value="Legal">Legal/Compliance</option>
                                    <option value="Other">Other Protocol</option>
                                </Form.Select>
                            </Col>
                        </Row>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-black text-white-50 tracking-widest uppercase">Node Association (Optional)</Form.Label>
                            <Form.Select 
                                className="bg-white/5 border-white/10 text-white rounded-4 p-3 shadow-none focus-border-primary"
                                value={newExpense.eventId}
                                onChange={(e) => setNewExpense({...newExpense, eventId: e.target.value})}
                            >
                                <option value="">Global Platform Overhead</option>
                                {events.map(event => (
                                    <option key={event._id} value={event._id}>{event.title}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-5">
                            <Form.Label className="small fw-black text-white-50 tracking-widest uppercase">Timestamp</Form.Label>
                            <Form.Control 
                                type="date" 
                                className="bg-white/5 border-white/10 text-white rounded-4 p-3 shadow-none focus-border-primary"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                            />
                        </Form.Group>
                        <div className="d-flex gap-3">
                            <Button 
                                variant="outline-light" 
                                className="rounded-pill flex-grow-1 py-3 fw-black border-2 text-uppercase tracking-widest"
                                onClick={() => setShowAddModal(false)}
                            >
                                ABORT
                            </Button>
                            <Button 
                                type="submit" 
                                className="btn-primary rounded-pill flex-grow-1 py-3 fw-black border-0 shadow-glow text-uppercase tracking-widest"
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Spinner size="sm" /> : 'EXECUTE INDEX'}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default FinanceDashboard;

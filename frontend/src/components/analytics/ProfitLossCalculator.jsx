import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, InputGroup, ProgressBar } from 'react-bootstrap';
import { FaPlus, FaTrash, FaCalculator, FaChartPie, FaDollarSign } from 'react-icons/fa';

export const ProfitLossCalculator = () => {
    // Basic simulator inputs
    const [ticketPrice, setTicketPrice] = useState(0);
    const [estimatedAttendees, setEstimatedAttendees] = useState(0);
    const [venueCost, setVenueCost] = useState(0);
    const [marketingCost, setMarketingCost] = useState(0);
    const [perAttendeeCost, setPerAttendeeCost] = useState(0); // food, welcome kits, etc.

    // Dynamic custom expenses
    const [customExpenses, setCustomExpenses] = useState([]);
    const [newItemLabel, setNewItemLabel] = useState('');
    const [newItemAmount, setNewItemAmount] = useState('');

    // Simulated Metrics
    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        breakEvenTickets: 0,
        isProfit: true
    });

    useEffect(() => {
        const customExpenseSum = customExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const fixedCosts = Number(venueCost) + Number(marketingCost) + customExpenseSum;
        const variableCosts = Number(estimatedAttendees) * Number(perAttendeeCost);
        
        const totalRevenue = Number(ticketPrice) * Number(estimatedAttendees);
        const totalExpenses = fixedCosts + variableCosts;
        const netProfit = totalRevenue - totalExpenses;
        
        // Margin
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        
        // Break-even Tickets = Fixed Costs / (Ticket Price - Variable Cost per attendee)
        const contributionMargin = Number(ticketPrice) - Number(perAttendeeCost);
        const breakEvenTickets = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;

        setMetrics({
            totalRevenue,
            totalExpenses,
            netProfit,
            profitMargin,
            breakEvenTickets,
            isProfit: netProfit >= 0
        });
    }, [ticketPrice, estimatedAttendees, venueCost, marketingCost, perAttendeeCost, customExpenses]);

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!newItemLabel.trim() || !newItemAmount || Number(newItemAmount) <= 0) return;
        setCustomExpenses([
            ...customExpenses,
            { id: Date.now(), label: newItemLabel.trim(), amount: Number(newItemAmount) }
        ]);
        setNewItemLabel('');
        setNewItemAmount('');
    };

    const handleRemoveExpense = (id) => {
        setCustomExpenses(customExpenses.filter(item => item.id !== id));
    };

    const formatINR = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden" style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)'
        }}>
            {/* Header */}
            <div className="p-4 text-white d-flex align-items-center justify-content-between" style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
            }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-3">
                        <FaCalculator size={22} />
                    </div>
                    <div>
                        <h4 className="m-0 fw-bold" style={{ fontSize: '1.2rem', letterSpacing: '-0.3px' }}>Profit & Loss Simulator</h4>
                        <p className="m-0 small opacity-80">Plan, budget, and project event returns in real-time</p>
                    </div>
                </div>
                <div className="small bg-white/20 px-3 py-1 rounded-pill fw-semibold">
                    Interactive Sandbox
                </div>
            </div>

            <div className="p-4">
                <Row className="g-4">
                    {/* Left: Input parameters */}
                    <Col lg={7}>
                        <h5 className="fw-bold mb-3 text-slate d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                            <span style={{ width: '4px', height: '16px', background: '#a855f7', display: 'inline-block', borderRadius: '2px' }}></span>
                            Simulation Parameters
                        </h5>

                        <Row className="g-3 mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-slate mb-1">Ticket Selling Price</Form.Label>
                                    <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                                        <InputGroup.Text className="bg-white border-end-0 text-slate">₹</InputGroup.Text>
                                        <Form.Control 
                                            type="number" 
                                            value={ticketPrice || ''} 
                                            onChange={(e) => setTicketPrice(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                                            className="border-start-0 ps-1"
                                            style={{ outline: 'none', boxShadow: 'none' }}
                                        />
                                    </InputGroup>
                                    <Form.Range 
                                        min={0} 
                                        max={5000} 
                                        step={50}
                                        value={ticketPrice}
                                        onChange={(e) => setTicketPrice(Number(e.target.value))}
                                        className="mt-2 accent-pink"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-slate mb-1">Estimated Attendance</Form.Label>
                                    <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                                        <InputGroup.Text className="bg-white border-end-0 text-slate">👥</InputGroup.Text>
                                        <Form.Control 
                                            type="number" 
                                            value={estimatedAttendees || ''} 
                                            onChange={(e) => setEstimatedAttendees(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                                            className="border-start-0 ps-1"
                                            style={{ outline: 'none', boxShadow: 'none' }}
                                        />
                                    </InputGroup>
                                    <Form.Range 
                                        min={0} 
                                        max={2000} 
                                        step={10}
                                        value={estimatedAttendees}
                                        onChange={(e) => setEstimatedAttendees(Number(e.target.value))}
                                        className="mt-2"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-slate mb-1">Venue Booking</Form.Label>
                                    <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                                        <Form.Control 
                                            type="number" 
                                            value={venueCost || ''} 
                                            onChange={(e) => setVenueCost(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                                            style={{ outline: 'none', boxShadow: 'none' }}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-slate mb-1">Marketing Cost</Form.Label>
                                    <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                                        <Form.Control 
                                            type="number" 
                                            value={marketingCost || ''} 
                                            onChange={(e) => setMarketingCost(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                                            style={{ outline: 'none', boxShadow: 'none' }}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-slate mb-1">Variable Per-Attendee Cost</Form.Label>
                                    <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                                        <Form.Control 
                                            type="number" 
                                            value={perAttendeeCost || ''} 
                                            onChange={(e) => setPerAttendeeCost(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                                            style={{ outline: 'none', boxShadow: 'none' }}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Custom Itemized Expenses */}
                        <div className="p-3 rounded-4 border mb-3 bg-light/50">
                            <h6 className="fw-bold text-slate small mb-2 d-flex justify-content-between align-items-center">
                                <span>Itemized Custom Expenses</span>
                                <span className="badge bg-purple px-2 py-1 rounded-pill">{customExpenses.length} Items</span>
                            </h6>
                            
                            <div className="overflow-auto pe-1 mb-3" style={{ maxHeight: '110px' }}>
                                {customExpenses.map((expense) => (
                                    <div key={expense.id} className="d-flex justify-content-between align-items-center py-2 px-3 mb-2 bg-white rounded-3 shadow-sm border border-light transition-all hover-translate">
                                        <span className="small text-slate fw-semibold">{expense.label}</span>
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="small fw-bold text-slate">{formatINR(expense.amount)}</span>
                                            <Button 
                                                variant="link" 
                                                className="text-danger p-0" 
                                                onClick={() => handleRemoveExpense(expense.id)}
                                            >
                                                <FaTrash size={12} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {customExpenses.length === 0 && (
                                    <div className="text-center text-muted small py-3 opacity-60">No custom expenses listed yet.</div>
                                )}
                            </div>

                            {/* Add Custom Expense Inline Form */}
                            <Form onSubmit={handleAddExpense} className="d-flex gap-2">
                                <Form.Control 
                                    type="text" 
                                    placeholder="e.g. Catering, DJ, Decoration" 
                                    value={newItemLabel}
                                    onChange={(e) => setNewItemLabel(e.target.value)}
                                    size="sm"
                                    className="rounded-3 border-light shadow-sm"
                                />
                                <Form.Control 
                                    type="number" 
                                    placeholder="Amount (₹)" 
                                    value={newItemAmount}
                                    onChange={(e) => setNewItemAmount(e.target.value)}
                                    size="sm"
                                    style={{ maxWidth: '110px' }}
                                    className="rounded-3 border-light shadow-sm"
                                />
                                <Button 
                                    type="submit" 
                                    size="sm" 
                                    className="rounded-3 px-3 d-flex align-items-center justify-content-center bg-purple border-0"
                                >
                                    <FaPlus />
                                </Button>
                            </Form>
                        </div>
                    </Col>

                    {/* Right: Metrics & Output Panel */}
                    <Col lg={5}>
                        <div className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between transition-all" style={{
                            background: metrics.isProfit 
                                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.15) 100%)'
                                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.15) 100%)',
                            border: metrics.isProfit 
                                ? '1px solid rgba(16, 185, 129, 0.25)' 
                                : '1px solid rgba(239, 68, 68, 0.25)'
                        }}>
                            <div>
                                <h5 className="fw-bold mb-3 text-slate d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                                    <span style={{ 
                                        width: '4px', 
                                        height: '16px', 
                                        background: metrics.isProfit ? '#10b981' : '#ef4444', 
                                        display: 'inline-block', 
                                        borderRadius: '2px' 
                                    }}></span>
                                    Projection Summary
                                </h5>

                                <div className="text-center py-3 mb-4 rounded-4 bg-white/50 border border-white shadow-sm">
                                    <span className="small text-slate fw-semibold opacity-75">Simulated Net Return</span>
                                    <h2 className={`fw-black mt-2 mb-1 ${metrics.isProfit ? 'text-emerald' : 'text-danger'}`} style={{
                                        fontSize: '2.2rem',
                                        letterSpacing: '-1px'
                                    }}>
                                        {formatINR(metrics.netProfit)}
                                    </h2>
                                    <div className="d-inline-flex align-items-center gap-2 mt-1">
                                        <span className={`badge px-3 py-1 rounded-pill fw-bold ${metrics.isProfit ? 'bg-emerald text-white' : 'bg-danger text-white'}`}>
                                            {metrics.isProfit ? 'PROFITABLE' : 'NET LOSS'}
                                        </span>
                                        <span className="small fw-bold text-slate">
                                            {metrics.profitMargin.toFixed(1)}% Margin
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-black/5">
                                        <span className="small text-slate fw-semibold opacity-85">Simulated Revenue</span>
                                        <span className="fw-bold text-slate">{formatINR(metrics.totalRevenue)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-black/5">
                                        <span className="small text-slate fw-semibold opacity-85">Simulated Expenses</span>
                                        <span className="fw-bold text-slate text-danger">{formatINR(metrics.totalExpenses)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Break-Even Progress */}
                            <div>
                                <div className="d-flex justify-content-between align-items-end mb-2">
                                    <div>
                                        <span className="small text-slate fw-bold d-block">Break-Even Point</span>
                                        <span className="small text-muted opacity-80">Requires selling {metrics.breakEvenTickets} tickets</span>
                                    </div>
                                    <div className="text-end">
                                        <span className="fw-bold text-slate">
                                            {estimatedAttendees} / {metrics.breakEvenTickets}
                                        </span>
                                    </div>
                                </div>
                                <ProgressBar 
                                    now={Math.min(100, (estimatedAttendees / (metrics.breakEvenTickets || 1)) * 100)} 
                                    variant={metrics.isProfit ? 'success' : 'warning'} 
                                    className="rounded-pill shadow-sm"
                                    style={{ height: '8px' }}
                                />
                                {ticketPrice === 0 && estimatedAttendees === 0 && venueCost === 0 && marketingCost === 0 && perAttendeeCost === 0 ? (
                                    <p className="small text-muted fw-semibold mt-2 mb-0">
                                        💡 Enter your event parameters above to start real-time projections!
                                    </p>
                                ) : metrics.isProfit ? (
                                    <p className="small text-emerald fw-semibold mt-2 mb-0">
                                        🎉 Break-even goal achieved! Profit per extra ticket sold is {formatINR(ticketPrice - perAttendeeCost)}.
                                    </p>
                                ) : (
                                    <p className="small text-danger fw-semibold mt-2 mb-0">
                                        ⚠️ Need {Math.max(0, metrics.breakEvenTickets - estimatedAttendees)} more attendees to prevent event deficit.
                                    </p>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </Card>
    );
};

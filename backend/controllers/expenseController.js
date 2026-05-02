const Expense = require('../models/Expense');
const Revenue = require('../models/Revenue');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Add a new platform expense
// @route   POST /api/v1/expenses
// @access  Private (Admin)
exports.addExpense = async (req, res) => {
    try {
        req.body.recordedBy = req.user.id || req.user._id;
        const expense = await Expense.create(req.body);
        res.status(201).json({ success: true, data: expense });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// @desc    Get all platform expenses
// @route   GET /api/v1/expenses
// @access  Private (Admin)
exports.getExpenses = async (req, res) => {
    try {
        const query = {};
        if (req.query.eventId) {
            query.eventId = req.query.eventId;
        }
        const expenses = await Expense.find(query).sort('-date').populate('recordedBy', 'name email');
        res.status(200).json({ success: true, count: expenses.length, data: expenses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete platform expense
// @route   DELETE /api/v1/expenses/:id
// @access  Private (Admin)
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        await expense.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update platform expense
// @route   PUT /api/v1/expenses/:id
// @access  Private (Admin/Organizer)
exports.updateExpense = async (req, res) => {
    try {
        let expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        
        expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({ success: true, data: expense });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Profit Summary (Revenue - Expenses)
// @route   GET /api/v1/expenses/summary
// @access  Private (Admin)
exports.getProfitSummary = async (req, res) => {
    try {
        const revenueAgg = await Booking.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        const expenseAgg = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = expenseAgg.length > 0 ? expenseAgg[0].total : 0;

        const netProfit = totalRevenue - totalExpenses;

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalExpenses,
                netProfit,
                margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Detailed Profit (Overall and Event-wise)
// @route   GET /api/v1/expenses/profit
// @access  Private (Admin)
exports.getProfit = async (req, res) => {
    try {
        // Overall Summary
        const revAgg = await Revenue.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
        const expAgg = await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);

        const totalRevenue = revAgg.length > 0 ? revAgg[0].total : 0;
        const totalExpenses = expAgg.length > 0 ? expAgg[0].total : 0;
        const totalProfit = totalRevenue - totalExpenses;

        // Event-wise Profit
        const events = await Event.find({}, 'title _id');
        const eventStats = await Promise.all(events.map(async (event) => {
            const eRev = await Revenue.aggregate([
                { $match: { eventId: event._id } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const eExp = await Expense.aggregate([
                { $match: { eventId: event._id } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const rev = eRev.length > 0 ? eRev[0].total : 0;
            const exp = eExp.length > 0 ? eExp[0].total : 0;

            return {
                eventId: event._id,
                title: event.title,
                revenue: rev,
                expenses: exp,
                profit: rev - exp
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                overall: {
                    totalRevenue,
                    totalExpenses,
                    totalProfit,
                    margin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0
                },
                eventWise: eventStats
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


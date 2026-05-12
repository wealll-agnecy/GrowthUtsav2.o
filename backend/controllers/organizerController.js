const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Expense = require('../models/Expense');
const { notificationQueue } = require('../queue/notificationQueue');

// @desc    Get all pending organizer requests
// @route   GET /api/v1/admin/organizers/pending
// @access  Private (Admin)
exports.getPendingOrganizers = async (req, res) => {
    try {
        const pending = await User.find({
            role: 'organizer',
            status: 'pending',
            isRejected: { $ne: true }
        }).select('-password').sort({ createdAt: -1 }).lean();

        res.status(200).json({ success: true, count: pending.length, data: pending });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all approved organizers
// @route   GET /api/v1/admin/organizers/approved
// @access  Private (Admin)
exports.getApprovedOrganizers = async (req, res) => {
    try {
        const approved = await User.find({
            role: 'organizer',
            status: 'verified'
        }).select('-password').sort({ createdAt: -1 }).lean();

        res.status(200).json({ success: true, count: approved.length, data: approved });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all rejected organizers
// @route   GET /api/v1/admin/organizers/rejected
// @access  Private (Admin)
exports.getRejectedOrganizers = async (req, res) => {
    try {
        const rejected = await User.find({
            role: 'organizer',
            isRejected: true
        }).select('-password').sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: rejected.length, data: rejected });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Approve organizer
// @route   PATCH /api/v1/admin/organizers/:id/approve
// @access  Private (Admin)
exports.approveOrganizer = async (req, res) => {
    try {
        req.body = req.body || {};
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                isApproved: true, 
                status: 'verified', 
                isRejected: false, 
                rejectionReason: null 
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        // Send Notification
        await notificationQueue.add('alert', {
            userId: user._id,
            title: 'Account Verified! 🎉',
            message: 'Your organizer account has been approved. You can now create and manage events.',
            type: 'system'
        });

        res.status(200).json({ success: true, message: 'Organizer approved successfully', data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Reject organizer
// @route   PATCH /api/v1/admin/organizers/:id/reject
// @access  Private (Admin)
exports.rejectOrganizer = async (req, res) => {
    try {
        req.body = req.body || {};
        const { reason } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                isApproved: false, 
                status: 'pending', 
                isRejected: true, 
                rejectionReason: reason || 'Application rejected by admin.' 
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        // Send Notification
        await notificationQueue.add('alert', {
            userId: user._id,
            title: 'Account Update ⚠️',
            message: `Your organizer application was not approved. Reason: ${reason || 'Incomplete profile'}`,
            type: 'system'
        });

        res.status(200).json({ success: true, message: 'Organizer rejected', data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all users (admin only)
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get comprehensive event details for organizer dashboard
// @route   GET /api/v1/organizer/event/:id/details
// @access  Private (Organizer)
exports.getOrganizerEventDetails = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Verify ownership or admin
        if (event.organizer.toString() !== (req.user.id || req.user._id).toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized an event owner' });
        }

        // 1. Fetch Bookings and Expenses
        const bookings = await Booking.find({ event: eventId, paymentStatus: 'completed' });
        const expenses = await Expense.find({ eventId });

        // Calculate Totals
        const totalTickets = bookings.reduce((acc, b) => acc + (b.quantity || 0), 0);
        const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
        const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
        
        const profit = totalRevenue > totalExpenses ? totalRevenue - totalExpenses : 0;
        const loss = totalExpenses > totalRevenue ? totalExpenses - totalRevenue : 0;

        // 2. Date-wise Ticket Sales
        const dateSalesMap = {};
        bookings.forEach(b => {
            const bDates = b.selectedDays && b.selectedDays.length > 0 
                ? b.selectedDays.map(d => new Date(d).toISOString().split('T')[0]) 
                : [new Date(b.selectedDate || event.date).toISOString().split('T')[0]];
            
            bDates.forEach(dateStr => {
                if (!dateSalesMap[dateStr]) {
                    dateSalesMap[dateStr] = { tickets: 0, revenue: 0 };
                }
                const sliceRev = b.totalAmount / bDates.length;
                const sliceTix = b.quantity / bDates.length;
                dateSalesMap[dateStr].tickets += sliceTix;
                dateSalesMap[dateStr].revenue += sliceRev;
            });
        });
        
        const dateWiseSales = Object.keys(dateSalesMap).map(date => ({
            date,
            ticketsSold: Math.ceil(dateSalesMap[date].tickets),
            revenue: dateSalesMap[date].revenue
        }));

        // 3. Plan-wise Sales
        const planSalesMap = {};
        bookings.forEach(b => {
            const plan = b.ticketType || 'General';
            if (!planSalesMap[plan]) planSalesMap[plan] = { tickets: 0, revenue: 0 };
            planSalesMap[plan].tickets += (b.quantity || 0);
            planSalesMap[plan].revenue += (b.totalAmount || 0);
        });
        
        const planWiseSales = Object.keys(planSalesMap).map(plan => ({
            planName: plan,
            ticketsSold: planSalesMap[plan].tickets,
            revenue: planSalesMap[plan].revenue
        }));

        // 4. Expenses Breakdown
        const expensesBreakdown = expenses.map(e => ({
            title: e.title || e.category,
            amount: e.amount,
            date: e.date
        }));

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    eventName: event.title,
                    totalTickets,
                    totalRevenue,
                    totalExpenses,
                    profit,
                    loss
                },
                dateWiseSales,
                planWiseSales,
                expensesBreakdown
            }
        });
    } catch (error) {
        console.error("Event details analytics error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const Expense = require('../models/Expense');

// @desc    Unified Dashboard Stats (Organizers, Staff, Events, Tickets, Revenue)
exports.getAdminStats = async (req, res) => {
    try {
        const [
            totalOrganizers,
            totalStaff,
            totalEvents,
            bookingStats
        ] = await Promise.all([
            User.countDocuments({ role: 'organizer' }),
            User.countDocuments({ role: 'staff' }),
            Event.countDocuments({}),
            Booking.aggregate([
                { $match: { paymentStatus: 'completed' } },
                { 
                    $group: { 
                        _id: null, 
                        revenue: { $sum: '$totalAmount' },
                        tickets: { $sum: '$quantity' }
                    } 
                }
            ])
        ]);

        // Real Expense aggregation
        const expenseStats = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalExpenses = expenseStats.length > 0 ? expenseStats[0].total : 0;
        const revenue = bookingStats.length > 0 ? bookingStats[0].revenue : 0;
        const profit = revenue - totalExpenses;
        const ticketsSold = bookingStats.length > 0 ? bookingStats[0].tickets : 0;

        // Fetch recent activities for the timeline
        const recentBookings = await Booking.find({ paymentStatus: 'completed' })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('user', 'name')
            .populate('event', 'title');

        const recentEvents = await Event.find({})
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('organizer', 'name');

        const activities = [
            ...recentBookings.map(b => ({
                message: `${b.user?.name || 'Guest'} booked ticket for ${b.event?.title || 'Unknown Event'}`,
                time: b.createdAt,
                type: 'booking'
            })),
            ...recentEvents.map(e => ({
                message: `New event "${e.title}" created by ${e.organizer?.name || 'Organizer'}`,
                time: e.createdAt,
                type: 'event'
            }))
        ].sort((a, b) => b.time - a.time).slice(0, 5);

        res.status(200).json({
            success: true,
            data: {
                totalOrganizers,
                totalStaff,
                totalEvents,
                totalTicketsSold: ticketsSold,
                totalRevenue: revenue,
                totalProfit: profit,
                activities
            }
        });
    } catch (err) {
        console.error('getAdminStats Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Legacy / Individual Stat Methods
exports.getTotalRevenue = async (req, res) => {
    try {
        const stats = await Booking.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        res.status(200).json({ success: true, data: stats[0]?.total || 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getNetProfit = async (req, res) => {
    try {
        const stats = await Booking.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const revenue = stats[0]?.total || 0;
        res.status(200).json({ success: true, data: Math.round(revenue * 0.20) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getActiveEvents = async (req, res) => {
    try {
        const count = await Event.countDocuments({ status: 'approved', date: { $gte: new Date() } });
        res.status(200).json({ success: true, data: count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTotalUsers = async (req, res) => {
    try {
        const count = await User.countDocuments({});
        res.status(200).json({ success: true, data: count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTotalEvents = async (req, res) => {
    try {
        const count = await Event.countDocuments({});
        res.status(200).json({ success: true, data: count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTicketsSold = async (req, res) => {
    try {
        const stats = await Booking.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        res.status(200).json({ success: true, data: stats[0]?.total || 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const pEvents = await Event.countDocuments({ status: 'pending' });
        const pOrgs = await User.countDocuments({ role: 'organizer', status: 'pending' });
        res.status(200).json({ success: true, data: pEvents + pOrgs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

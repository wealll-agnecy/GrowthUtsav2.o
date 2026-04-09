const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get total revenue from all completed bookings
exports.getTotalRevenue = async (req, res) => {
    try {
        const bookingStats = await Booking.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = bookingStats.length > 0 ? bookingStats[0].totalRevenue : 0;
        res.status(200).json({ success: true, data: totalRevenue });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: 0 });
    }
};

// @desc    Get platform net profit (e.g., 20% commission on revenue)
exports.getNetProfit = async (req, res) => {
    try {
        const bookingStats = await Booking.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = bookingStats.length > 0 ? bookingStats[0].totalRevenue : 0;
        // Logic: Net Profit = 20% commission
        const netProfit = Math.round(totalRevenue * 0.20);
        res.status(200).json({ success: true, data: netProfit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: 0 });
    }
};

// @desc    Get total number of approved/active events
exports.getActiveEvents = async (req, res) => {
    try {
        const now = new Date();
        const activeCount = await Event.countDocuments({
            status: 'approved',
            date: { $gte: now }
        });
        res.status(200).json({ success: true, data: activeCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: 0 });
    }
};

// @desc    Get count of all users in the system
exports.getTotalUsers = async (req, res) => {
    try {
        const count = await User.countDocuments({});
        res.status(200).json({ success: true, data: count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: 0 });
    }
};

// @desc    Get total number of events (regardless of status)
exports.getTotalEvents = async (req, res) => {
    try {
        const count = await Event.countDocuments({});
        res.status(200).json({ success: true, data: count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: 0 });
    }
};

// @desc    Get total quantity of tickets sold via completed bookings
exports.getTicketsSold = async (req, res) => {
    try {
        const ticketStats = await Booking.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, totalTickets: { $sum: '$quantity' } } }
        ]);
        const totalTickets = ticketStats.length > 0 ? ticketStats[0].totalTickets : 0;
        res.status(200).json({ success: true, data: totalTickets });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: 0 });
    }
};

// @desc    Get aggregate count of pending items (Events + Organizer Requests)
exports.getPendingRequests = async (req, res) => {
    try {
        const pendingEvents = await Event.countDocuments({ status: 'pending' });
        const pendingOrganizers = await User.countDocuments({ 
            role: 'organizer', 
            status: 'pending'
        });
        res.status(200).json({ success: true, data: pendingEvents + pendingOrganizers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: 0 });
    }
};

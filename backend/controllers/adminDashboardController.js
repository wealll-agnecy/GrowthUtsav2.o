const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Enquiry = require('../models/Enquiry');

// @desc    Unified Dashboard Stats (Organizers, Staff, Events, Tickets, Revenue, Enquiries)
exports.getAdminStats = async (req, res) => {
    try {
        const [
            totalOrganizers,
            totalStaff,
            totalEvents,
            bookingStats,
            expenseStats,
            totalEnquiries
        ] = await Promise.all([
            User.countDocuments({ role: 'organizer' }),
            User.countDocuments({ role: 'staff' }),
            Event.countDocuments({}),
            Booking.aggregate([
                { $match: { paymentStatus: 'completed' } },
                { $group: { _id: null, revenue: { $sum: '$totalAmount' }, tickets: { $sum: '$quantity' } } }
            ]),
            Expense.aggregate([
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Enquiry.countDocuments({})
        ]);

        const totalExpenses = expenseStats.length > 0 ? expenseStats[0].total : 0;
        const revenue = bookingStats.length > 0 ? bookingStats[0].revenue : 0;
        const profit = revenue - totalExpenses;
        const ticketsSold = bookingStats.length > 0 ? bookingStats[0].tickets : 0;

        // Fetch recent activity in parallel
        const [recentBookings, recentEvents] = await Promise.all([
            Booking.find({ paymentStatus: 'completed' })
                .sort({ createdAt: -1 })
                .limit(3)
                .select('user event createdAt')
                .populate('user', 'name')
                .populate('event', 'title')
                .lean(),
            Event.find({})
                .sort({ createdAt: -1 })
                .limit(3)
                .select('title organizer createdAt')
                .populate('organizer', 'name')
                .lean()
        ]);

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
                totalEnquiries,
                activities
            }
        });
    } catch (err) {
        console.error('getAdminStats Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


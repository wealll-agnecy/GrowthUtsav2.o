const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const ScanLog = require('../models/ScanLog');


// @desc    Get per-event attendee list (for organizer event dashboard)
// @route   GET /api/v1/analytics/event/:eventId/attendees
// @access  Private (Organizer / Admin)
exports.getEventAttendees = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Verify event exists and belongs to the requesting organizer (or admin)
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        const isOrganizer = event.organizer.toString() === (req.user.id || req.user._id);
        const isAdmin = req.user.role === 'admin';

        if (!isOrganizer && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to view these analytics' });
        }

        const bookings = await Booking.find({
            event: eventId,
            paymentStatus: 'completed'
        }).populate('user', 'name email phone').sort({ createdAt: -1 });

        // Optimize: Fetch all tickets for these bookings in ONE query
        const bookingIds = bookings.map(b => b._id);
        const tickets = await Ticket.find({ booking: { $in: bookingIds } });
        const ticketMap = tickets.reduce((acc, t) => {
            acc[t.booking.toString()] = t;
            return acc;
        }, {});

        const enriched = bookings.map((booking) => {
            const ticket = ticketMap[booking._id.toString()];
            return {
                ...booking.toObject(),
                checkedIn: ticket ? ticket.scannedStatus : false,
                scannedAt: ticket ? ticket.scannedAt : null,
                ticketId: ticket ? ticket._id : null
            };
        });

        res.status(200).json({
            success: true,
            count: enriched.length,
            data: enriched
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get organizer analytics (all their events combined)
// @route   GET /api/v1/analytics/organizer
// @access  Private (Organizer)
exports.getOrganizerStats = async (req, res) => {
    try {
        const organizerId = req.user.id || req.user._id;

        const events = await Event.find({ organizer: organizerId });
        const eventIds = events.map(e => e._id);

        const bookings = await Booking.find({
            event: { $in: eventIds },
            paymentStatus: 'completed'
        });

        const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
        const totalTicketsSold = bookings.reduce((acc, b) => acc + (b.quantity || 0), 0);
        const totalCapacity = events.reduce((acc, e) => {
            return acc + (e.ticketTypes || []).reduce((a, t) => a + (t.quantity || 0), 0);
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                totalEvents: events.length,
                totalRevenue,
                totalTicketsSold,
                totalCapacity,
                pendingEvents: events.filter(e => e.status === 'pending').length,
                approvedEvents: events.filter(e => e.status === 'approved' || e.status === 'live').length,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get platform-wide admin analytics
// @route   GET /api/v1/analytics/admin
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalEvents, totalBookings] = await Promise.all([
            User.countDocuments({}),
            Event.countDocuments({}),
            Booking.countDocuments({ paymentStatus: 'completed' })
        ]);

        const revenueAgg = await Booking.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalEvents,
                totalBookings,
                totalRevenue
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getStaffStats = async (req, res) => {
    try {
        const staffId = req.user.id || req.user._id;

        // Total lifetime scans
        const scans = await ScanLog.countDocuments({
            staffId: staffId,
            status: 'success'
        });

        // Today's scans
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayScans = await ScanLog.countDocuments({
            staffId: staffId,
            status: 'success',
            scannedAt: { $gte: startOfToday }
        });

        // Recent Scans (last 10) with limited attendee details
        const recentScans = await ScanLog.find({
            staffId: staffId,
            status: 'success'
        })
        .sort({ scannedAt: -1 })
        .limit(10)
        .populate({
            path: 'ticketId',
            select: 'name ticketCode ticketType status'
        });

        const user = await User.findById(staffId).populate('assignedEvents');
        const activeEventsCount = (user?.assignedEvents || []).filter(e => e.status === 'live').length;

        res.status(200).json({
            success: true,
            data: {
                totalScans: scans,
                todayScans: todayScans,
                recentScans: recentScans.map(log => ({
                    attendee: log.ticketId?.name || 'Guest',
                    code: log.ticketId?.ticketCode || 'N/A',
                    type: log.ticketId?.ticketType || 'General',
                    time: log.scannedAt
                })),
                activeEventsCount: activeEventsCount || 0,
                staffRole: user?.staffRole || 'Operations'
            }
        });
    } catch (err) {
        console.error("Staff Stats Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


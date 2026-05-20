const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc    Get all organizers with booking stats
// @route   GET /api/v1/admin/bookings/organizers
// @access  Private/Admin
exports.getOrganizersWithStats = async (req, res) => {
    try {
        // Single aggregation pipeline — O(1) DB calls instead of O(n)
        const stats = await User.aggregate([
            { $match: { role: 'organizer' } },
            { $project: { name: 1, email: 1, phone: 1 } },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: 'organizer',
                    as: 'events',
                    pipeline: [{ $project: { _id: 1 } }]
                }
            },
            {
                $lookup: {
                    from: 'bookings',
                    let: { eventIds: '$events._id' },
                    pipeline: [
                        { $match: { $expr: { $and: [
                            { $in: ['$event', '$$eventIds'] },
                            { $eq: ['$paymentStatus', 'completed'] }
                        ]}}},
                        { $count: 'total' }
                    ],
                    as: 'bookingStats'
                }
            },
            {
                $project: {
                    name: 1, email: 1, phone: 1,
                    totalEvents: { $size: '$events' },
                    totalBookings: { $ifNull: [{ $arrayElemAt: ['$bookingStats.total', 0] }, 0] }
                }
            }
        ]);

        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        console.error('Error fetching organizer stats:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get detailed bookings for a specific organizer
// @route   GET /api/v1/admin/bookings/:organizerId
// @access  Private/Admin
exports.getOrganizerBookings = async (req, res) => {
    try {
        const { organizerId } = req.params;

        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(organizerId)) {
            return res.status(400).json({ success: false, message: 'Invalid Organizer ID' });
        }

        // Run event fetch and booking fetch in parallel for speed
        const events = await Event.find({ organizer: organizerId })
            .select('title date category status')
            .lean();
        const eventIds = events.map(e => e._id);

        const bookings = await Booking.find({ event: { $in: eventIds } })
            .populate('user', 'name email')
            .populate('event', 'title date category')
            .sort({ createdAt: -1 })
            .lean();

        // Group bookings by event in memory (faster than multiple DB calls)
        const bookingsByEvent = bookings.reduce((acc, b) => {
            const key = b.event?._id?.toString();
            if (key) {
                if (!acc[key]) acc[key] = [];
                acc[key].push(b);
            }
            return acc;
        }, {});

        const groupedBookings = events.map(event => ({
            event: { _id: event._id, title: event.title, date: event.date, category: event.category },
            bookings: bookingsByEvent[event._id.toString()] || []
        }));

        res.status(200).json({ success: true, data: groupedBookings });
    } catch (err) {
        console.error('Error fetching organizer bookings:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

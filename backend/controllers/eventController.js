const Event = require('../models/Event');

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private (Organizer, Admin)
exports.createEvent = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.organizer = req.user.id;

        // Force status to pending for new events by organizers
        if (!req.user || req.user.role !== 'admin') {
            req.body.status = 'pending';
        }

        const event = await Event.create(req.body);

        // Notify ALL users about the new event via BullMQ
        const { notifyAllUsers } = require('./notificationController');
        await notifyAllUsers('New Event Launched 🚀', `"${event.title}" is now open for booking! Check it out before tickets sell out.`, event._id);

        res.status(201).json({
            success: true,
            data: event
        });

    } catch (err) {
        console.error("FINAL ERROR in createEvent:", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get all events (Public: approved, Admin: all, Filters & Search)
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // If admin, they can see all, otherwise only approved/live/completed
        if (!req.user || req.user.role !== 'admin') {
            reqQuery.status = { $in: ['approved', 'live', 'completed'] };
        } else if (reqQuery.hasOwnProperty('status') && reqQuery.status === 'pending') {
            // Admin explicitly asking for pending is allowed
        }

        // Handle Search
        if (req.query.search) {
            reqQuery.title = { $regex: req.query.search, $options: 'i' };
        }

        query = Event.find(reqQuery).populate('organizer', 'name email');

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const events = await query;

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        console.error("FINAL ERROR in getEvents:", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email _id');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: `No event with the id of ${req.params.id}`
            });
        }

        // If not approved/live/completed and not organizer/admin, don't show
        const isPublicStatus = ['approved', 'live', 'completed'].includes(event.status);
        if (!isPublicStatus) {
            const isOrganizer = req.user && event.organizer._id.toString() === req.user.id;
            const isAdmin = req.user && req.user.role === 'admin';

            if (!isOrganizer && !isAdmin) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized to view this event'
                });
            }
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (err) {
        console.error("FINAL ERROR in getEvent:", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get events for current organizer
// @route   GET /api/v1/events/myevents
// @access  Private (Organizer)
exports.getMyEvents = async (req, res, next) => {
    try {
        const events = await Event.find({ organizer: req.user.id });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        console.error("FINAL ERROR in getMyEvents:", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private (Organizer, Admin)
exports.updateEvent = async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: `No event with the id of ${req.params.id}`
            });
        }

        // Make sure user is event organizer
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this event`
            });
        }

        // If status is being updated to pending by organizer, that's fine.
        // If they edit an approved event, we set status back to pending.
        if (req.user.role !== 'admin' && req.body.status !== 'draft') {
            req.body.status = 'pending';
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (err) {
        console.error("FINAL ERROR in updateEvent:", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private (Organizer, Admin)
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: `No event with the id of ${req.params.id}`
            });
        }

        // Make sure user is event organizer
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this event`
            });
        }

        await event.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error("FINAL ERROR in deleteEvent:", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Approve or Reject event
// @route   PUT /api/v1/events/:id/status
// @access  Private (Admin)
exports.updateEventStatus = async (req, res, next) => {
    try {
        req.body = req.body || {};
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Please provide a status' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: `No event with the id of ${req.params.id}` });
        }

        // Governance Logic
        if (req.user.role === 'admin') {
            // Admin can set any status except draft/pending
            if (!['approved', 'rejected', 'live', 'completed'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status for admin action' });
            }
        } else if (req.user.role === 'organizer' && event.organizer.toString() === req.user.id) {
            // Organizer can only set live/completed
            if (!['live', 'completed'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Organizers can only transition events to Live or Completed' });
            }
            // Cannot go live if not approved
            if (status === 'live' && event.status !== 'approved') {
                return res.status(400).json({ success: false, message: 'Event must be approved by admin before going Live' });
            }
        } else {
            return res.status(401).json({ success: false, message: 'Not authorized to update this event status' });
        }

        event.status = status;
        await event.save();

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (err) {
        console.error("FINAL ERROR in updateEventStatus:", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

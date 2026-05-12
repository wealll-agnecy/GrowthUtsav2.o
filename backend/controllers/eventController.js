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

        // Handle JSON-in-FormData parsing
        if (typeof req.body.ticketTypes === 'string') {
            try { req.body.ticketTypes = JSON.parse(req.body.ticketTypes); } catch (e) {}
        }
        if (typeof req.body.multiDayPlan === 'string') {
            try { req.body.multiDayPlan = JSON.parse(req.body.multiDayPlan); } catch (e) {}
        }
        if (typeof req.body.isMultiDay === 'string') {
            req.body.isMultiDay = req.body.isMultiDay === 'true';
        }

        // Handle uploaded file
        if (req.file) {
            req.body.eventImage = `/uploads/events/${req.file.filename}`;
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

        // If admin, they can see all, otherwise only approved/live/completed OR isLive: true
        if (!req.user || req.user.role !== 'admin') {
            reqQuery.$or = [
                { status: { $in: ['approved', 'live', 'completed'] } },
                { isLive: true }
            ];
        } else if (reqQuery.hasOwnProperty('status') && reqQuery.status === 'pending') {
            // Admin explicitly asking for pending is allowed
        }

        // Handle Search
        if (req.query.search) {
            reqQuery.title = { $regex: req.query.search, $options: 'i' };
        }

        console.log('🔍 [GET EVENTS]: Querying with:', reqQuery);
        query = Event.find(reqQuery).populate('organizer', 'name email').lean();

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100; // Default to 100 for safety
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Event.countDocuments(reqQuery);

        query = query.skip(startIndex).limit(limit);

        const events = await query;

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        console.log(`✅ [GET EVENTS]: Found ${events.length} events matching query.`);

        res.status(200).json({
            success: true,
            count: events.length,
            total,
            pagination,
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
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email _id avatar phone address organizationDetails')
            .lean();

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
        const events = await Event.find({ organizer: req.user.id }).lean();

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

        // Governance: Organizers can only set status to 'live' if already approved
        if (req.user.role !== 'admin') {
            if (req.body.status === 'live') {
                if (event.status !== 'approved' && event.status !== 'live') {
                    return res.status(400).json({ success: false, message: 'Event must be approved by admin before going Live' });
                }
            } else if (req.body.status !== 'draft' && req.body.status !== 'completed' && req.body.status !== 'approved') {
                // For any other edit, reset to pending for re-approval
                req.body.status = 'pending';
            }
        }

        // Handle JSON-in-FormData parsing
        if (typeof req.body.ticketTypes === 'string') {
            try { req.body.ticketTypes = JSON.parse(req.body.ticketTypes); } catch (e) {}
        }
        if (typeof req.body.multiDayPlan === 'string') {
            try { req.body.multiDayPlan = JSON.parse(req.body.multiDayPlan); } catch (e) {}
        }
        if (typeof req.body.isMultiDay === 'string') {
            req.body.isMultiDay = req.body.isMultiDay === 'true';
        }

        // Handle uploaded file
        if (req.file) {
            req.body.eventImage = `/uploads/events/${req.file.filename}`;
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

// @desc    Toggle event live status
// @route   PUT /api/v1/events/toggle-live/:id
// @access  Private (Organizer, Admin)
exports.toggleLive = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: `No event with the id of ${req.params.id}`
            });
        }

        // Toggle
        event.isLive = !event.isLive;
        
        // Sync status for legacy compatibility
        if (event.isLive) {
            event.status = 'live';
        } else {
            event.status = 'approved';
        }

        await event.save();

        res.status(200).json({
            success: true,
            isLive: event.isLive,
            data: event
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};
// @desc    Update live status explicitly
// @route   PUT /api/v1/events/:id/live
// @access  Private (Organizer, Admin)
exports.updateLiveStatus = async (req, res, next) => {
    try {
        const { isLive } = req.body;
        console.log(`🚀 [LIVE TOGGLE]: Event ID: ${req.params.id}, Target isLive: ${isLive}`);
        const status = isLive ? 'live' : 'approved';

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { isLive, status },
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: `No event with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (err) {
        console.error("Error in updateLiveStatus:", err.message);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

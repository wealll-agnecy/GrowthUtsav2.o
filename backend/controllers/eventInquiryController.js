const EventInquiry = require('../models/EventInquiry');
const Event = require('../models/Event');

// @desc    Create new event inquiry
// @route   POST /api/inquiries/create
// @access  Private (Attendee)
exports.createInquiry = async (req, res) => {
    try {
        const { attendeeId, eventId, organizerId, name, email, phone, message } = req.body;

        // Handle guest inquiries (where attendeeId might be 'guest' string)
        const finalAttendeeId = attendeeId === 'guest' ? null : attendeeId;

        // Debug Step as requested
        console.log({
            organizerId: organizerId,
            eventId: eventId
        });

        const inquiry = await EventInquiry.create({
            attendeeId: finalAttendeeId,
            eventId,
            organizerId,
            name,
            email,
            phone,
            message
        });

        res.status(201).json({
            success: true,
            data: inquiry
        });
    } catch (err) {
        console.error('Error creating inquiry:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get inquiries for an organizer
// @route   GET /api/inquiries/organizer
// @access  Private (Organizer)
exports.getOrganizerInquiries = async (req, res) => {
    try {
        // Filter by logged in organizer's ID
        const inquiries = await EventInquiry.find({ organizerId: req.user.id })
            .populate('eventId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: inquiries.length,
            data: inquiries
        });
    } catch (err) {
        console.error('Error fetching inquiries:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private (Organizer)
exports.updateInquiryStatus = async (req, res) => {
    try {
        let inquiry = await EventInquiry.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        // Make sure organizer owns the inquiry
        if (inquiry.organizerId.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this inquiry'
            });
        }

        inquiry = await EventInquiry.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (err) {
        console.error('Error updating inquiry:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (Organizer)
exports.deleteInquiry = async (req, res) => {
    try {
        const inquiry = await EventInquiry.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        // Make sure organizer owns the inquiry
        if (inquiry.organizerId.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this inquiry'
            });
        }

        await inquiry.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error('Error deleting inquiry:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

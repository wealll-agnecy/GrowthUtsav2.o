const User = require('../models/User');
const Event = require('../models/Event');
const bcrypt = require('bcryptjs');

// @desc    Get all staff members
// @route   GET /api/v1/admin/staff OR GET /api/v1/organizer/staff
// @access  Private (Admin / Organizer)
exports.getStaff = async (req, res, next) => {
    try {
        let query = { role: 'staff' };

        // If organizer, only show staff they created
        if (req.user.role === 'organizer') {
            query.createdBy = req.user.id;
        }

        const staff = await User.find(query).populate('assignedEvents', 'title date');
        res.status(200).json({ success: true, data: staff });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create a new staff member
// @route   POST /api/v1/admin/staff OR POST /api/v1/organizer/staff
// @access  Private (Admin / Organizer)
exports.createStaff = async (req, res, next) => {
    try {
        const { name, email, password, staffRole } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const staff = await User.create({
            name,
            email,
            password,
            role: 'staff',
            staffRole: staffRole || 'gate staff',
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: staff });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Assign events to staff
// @route   PUT /api/v1/admin/staff/:id/assign OR PUT /api/v1/organizer/staff/:id/assign
// @access  Private (Admin / Organizer)
exports.assignStaffToEvents = async (req, res, next) => {
    try {
        const { assignedEvents } = req.body; // Array of event IDs

        let staff = await User.findById(req.params.id);
        if (!staff || staff.role !== 'staff') {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        // If organizer, ensure they created this staff member
        if (req.user.role === 'organizer' && staff.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to manage this staff member' });
        }

        // If organizer, ensure all assigned events belong to them
        if (req.user.role === 'organizer') {
            const events = await Event.find({ _id: { $in: assignedEvents }, organizer: req.user.id });
            if (events.length !== assignedEvents.length) {
                return res.status(400).json({ success: false, message: 'Some events do not belong to you' });
            }
        }

        staff.assignedEvents = assignedEvents;
        await staff.save();

        // Populate so frontend can display
        staff = await User.findById(req.params.id).populate('assignedEvents', 'title date');

        res.status(200).json({ success: true, data: staff });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a staff member
// @route   DELETE /api/v1/admin/staff/:id
// @access  Private (Admin / Organizer)
exports.deleteStaff = async (req, res, next) => {
    try {
        let staff = await User.findById(req.params.id);
        if (!staff || staff.role !== 'staff') {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        // Authorization check
        if (req.user.role !== 'admin' && staff.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this staff member' });
        }

        await staff.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

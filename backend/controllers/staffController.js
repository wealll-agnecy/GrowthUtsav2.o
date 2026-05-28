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

        const staff = await User.find(query);
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
        const { name, email, password, staffRole, phone, staffCheckRole, customAddonItemNames } = req.body;


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        if (phone) {
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                return res.status(400).json({ success: false, message: 'Phone number already registered' });
            }
        }

        const staff = await User.create({
            name,
            email,
            password,
            phone: phone || undefined,
            role: 'staff',
            staffRole: staffRole || 'gate staff',

            // Role-based scanner category
            staffCheckRole: staffCheckRole || 'ENTRY',
            customAddonItemNames: Array.isArray(customAddonItemNames) ? customAddonItemNames : (customAddonItemNames ? [customAddonItemNames] : []),

            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: staff });
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

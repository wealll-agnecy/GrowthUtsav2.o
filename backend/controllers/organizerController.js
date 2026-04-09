const User = require('../models/User');

// @desc    Get all pending organizer requests
// @route   GET /api/v1/admin/organizers/pending
// @access  Private (Admin)
exports.getPendingOrganizers = async (req, res) => {
    try {
        const pending = await User.find({
            role: 'organizer',
            status: 'pending',
            isRejected: { $ne: true }
        }).select('-password').sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: pending.length, data: pending });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all approved organizers
// @route   GET /api/v1/admin/organizers/approved
// @access  Private (Admin)
exports.getApprovedOrganizers = async (req, res) => {
    try {
        const approved = await User.find({
            role: 'organizer',
            status: 'verified'
        }).select('-password').sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: approved.length, data: approved });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all rejected organizers
// @route   GET /api/v1/admin/organizers/rejected
// @access  Private (Admin)
exports.getRejectedOrganizers = async (req, res) => {
    try {
        const rejected = await User.find({
            role: 'organizer',
            isRejected: true
        }).select('-password').sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: rejected.length, data: rejected });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Approve organizer
// @route   PATCH /api/v1/admin/organizers/:id/approve
// @access  Private (Admin)
exports.approveOrganizer = async (req, res) => {
    try {
        req.body = req.body || {};
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                isApproved: true, 
                status: 'verified', 
                isRejected: false, 
                rejectionReason: null 
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        res.status(200).json({ success: true, message: 'Organizer approved successfully', data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Reject organizer
// @route   PATCH /api/v1/admin/organizers/:id/reject
// @access  Private (Admin)
exports.rejectOrganizer = async (req, res) => {
    try {
        req.body = req.body || {};
        const { reason } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                isApproved: false, 
                status: 'pending', 
                isRejected: true, 
                rejectionReason: reason || 'Application rejected by admin.' 
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        res.status(200).json({ success: true, message: 'Organizer rejected', data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all users (admin only)
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all notifications for logged in user
// @route   GET /api/v1/auth/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
        console.log("🔔 Notifications Fetched:", notifications.length);
        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (err) {
        console.error('FINAL ERROR in getNotifications:', err);
        res.status(200).json({ success: true, count: 0, data: [] }); // Safe fallback
    }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/auth/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        if (notification.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        notification.isRead = true;
        await notification.save();
        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        console.error("FINAL ERROR in markAsRead:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Internal utility to create notifications
exports.createInternalNotification = async (userId, message, type = 'system', relatedId = null) => {
    try {
        await Notification.create({
            user: userId,
            message,
            type,
            relatedId
        });
    } catch (err) {
        console.error('Failed to create in-app notification:', err.message);
    }
};

// Internal utility to notify ALL users
exports.notifyAllUsers = async (message, type = 'event_created', relatedId = null) => {
    try {
        const users = await User.find({ status: 'verified' }); // Only notify verified users
        const notifications = users.map(user => ({
            user: user._id,
            message,
            type,
            relatedId
        }));
        await Notification.insertMany(notifications);
    } catch (err) {
        console.error('Failed to notify all users:', err.message);
    }
};

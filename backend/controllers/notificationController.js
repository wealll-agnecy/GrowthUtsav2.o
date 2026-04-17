const Notification = require('../models/Notification');
const User = require('../models/User');
const { notificationQueue } = require('../queue/notificationQueue');

// @desc    Get all notifications for logged in user
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (err) {
        console.error('getNotifications Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        let notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        
        if (notification.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Clear all notifications
// @route   DELETE /api/v1/notifications/clear
// @access  Private
exports.clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user.id });
        res.status(200).json({ success: true, message: 'Notifications cleared' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Internal utility to notify ALL users via BullMQ
exports.notifyAllUsers = async (title, message, eventId) => {
    try {
        await notificationQueue.add('broadcast', {
            title,
            message,
            eventId,
            type: 'new_event'
        }, {
            removeOnComplete: true,
            jobId: `new-event-${eventId}` // Prevent duplicate broadcasts for same event
        });
        console.log(`📡 [CONTROLLER]: Queued broadcast for event ${eventId}`);
    } catch (err) {
        console.error('Failed to queue broadcast:', err.message);
    }
};

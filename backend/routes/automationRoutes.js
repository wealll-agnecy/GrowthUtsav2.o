const express = require('express');
const { sendTicketMail } = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Trigger Manual Test Email
// @route   POST /api/v1/automation/test-email
// @access  Private (Admin)
router.post('/test-email', protect, authorize('admin'), async (req, res) => {
    try {
        await sendTicketMail({
            to: req.user.email,
            subject: 'Growth Utsav - Test Email',
            html: '<h1>Test Email</h1><p>Automation system is operational.</p>'
        });
        res.status(200).json({ success: true, message: 'Test email sent' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Trigger Manual Event Reminders
// @route   POST /api/v1/automation/remind/:eventId
// @access  Private (Organizer/Admin)
router.post('/remind/:eventId', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        const bookings = await Booking.find({ event: req.params.eventId, paymentStatus: 'completed' }).populate('user');

        for (const booking of bookings) {
            const user = booking.user;
            await sendTicketMail({
                to: user.email,
                subject: `Reminder: ${event.title}`,
                html: `Hi ${user.name}, this is a reminder for ${event.title}.`
            });
        }

        res.status(200).json({ success: true, message: `Reminders sent to ${bookings.length} attendees` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

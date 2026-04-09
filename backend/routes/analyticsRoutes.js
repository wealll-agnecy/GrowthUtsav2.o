const express = require('express');
const {
    getEventAttendees,
    getOrganizerStats,
    getAdminStats,
    getStaffStats
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// Staff-specific stats
router.get('/staff', authorize('staff', 'admin'), getStaffStats);

// Organizer-specific stats
router.get('/organizer', authorize('organizer', 'admin'), getOrganizerStats);

// Admin-wide stats
router.get('/admin', authorize('admin'), getAdminStats);

// Per-event attendees (for organizer event dashboard)
router.get('/event/:eventId/attendees', authorize('organizer', 'admin'), getEventAttendees);

module.exports = router;

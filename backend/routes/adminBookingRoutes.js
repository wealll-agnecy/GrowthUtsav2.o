const express = require('express');
const { 
    getOrganizersWithStats, 
    getOrganizerBookings 
} = require('../controllers/adminBookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/organizers', getOrganizersWithStats);
router.get('/:organizerId', getOrganizerBookings);

module.exports = router;

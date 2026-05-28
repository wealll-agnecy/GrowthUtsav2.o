const express = require('express');
const { getEvents } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const { getAllUsers } = require('../controllers/organizerController');
const {
    getStaff,
    createStaff,
    deleteStaff
} = require('../controllers/staffController');
const { 
    getAdminStats
} = require('../controllers/adminDashboardController');

const { 
    getOrganizersWithStats, 
    getOrganizerBookings 
} = require('../controllers/adminBookingController');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize('admin'));

// ── Admin Booking Management ──────────────────────────
router.get('/bookings/organizers', getOrganizersWithStats);
router.get('/bookings/:organizerId', getOrganizerBookings);

// â”€â”€ Dashboard Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/stats', getAdminStats);


// ── User Management ───────────────────────────────────────
router.get('/users', getAllUsers);

// ── Staff Management ──────────────────────────────────────
router.route('/staff')
    .get(getStaff)
    .post(createStaff);

router.route('/staff/:id')
    .delete(deleteStaff);

module.exports = router;


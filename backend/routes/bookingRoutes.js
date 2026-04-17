const express = require('express');
const {
    checkout,
    verifyPayment,
    getMyBookings,
    demoBooking   // ✅ correct import
} = require('../controllers/bookingController');

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// ✅ ROUTES
router.post('/demo-book', protect, authorize('attendee', 'admin'), demoBooking);
router.post('/demobook', protect, authorize('attendee', 'admin'), demoBooking);
router.post('/demo-checkout', protect, authorize('attendee', 'admin'), demoBooking);
router.post('/checkout', protect, authorize('attendee', 'admin'), checkout);
router.post('/create-order', protect, authorize('attendee', 'admin'), checkout);
router.post('/verify', protect, authorize('attendee', 'admin'), verifyPayment);
router.get('/mybookings', protect, getMyBookings);

module.exports = router;
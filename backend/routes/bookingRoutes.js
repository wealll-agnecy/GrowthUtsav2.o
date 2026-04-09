const express = require('express');
const {
    checkout,
    verifyPayment,
    getMyBookings,
    demoBooking   // ✅ correct import
} = require('../controllers/bookingController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');


// ✅ ROUTES
router.post('/demo-book', protect, demoBooking);
router.post('/demobook', protect, demoBooking);
router.post('/demo-checkout', protect, demoBooking);
router.post('/checkout', protect, checkout);
router.post('/create-order', protect, checkout);
router.post('/verify', protect, verifyPayment);
router.get('/mybookings', protect, getMyBookings);

module.exports = router;
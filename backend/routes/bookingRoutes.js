const express = require('express');
const {
    checkout,
    verifyPayment,
    getMyBookings,
    demoBooking,
    resendTicketEmail
} = require('../controllers/bookingController');

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// ✅ ROUTES
router.post('/resend-ticket/:id', protect, authorize('attendee', 'admin', 'organizer', 'staff'), resendTicketEmail);
router.post('/demo-book', demoBooking);
router.post('/demobook', demoBooking);
router.post('/demo-checkout', demoBooking);
router.post('/checkout', checkout);
router.post('/create-order', checkout);
router.post('/verify', verifyPayment);
router.post('/:id/installment', protect, authorize('attendee', 'admin', 'organizer', 'staff'), require('../controllers/bookingController').initiateInstallment);
router.post('/verify-installment', protect, authorize('attendee', 'admin', 'organizer', 'staff'), require('../controllers/bookingController').verifyInstallment);
router.get('/mybookings', protect, getMyBookings);

module.exports = router;
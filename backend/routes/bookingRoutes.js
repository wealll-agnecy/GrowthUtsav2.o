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
router.post('/demo-book', protect, authorize('attendee', 'admin', 'organizer', 'staff'), demoBooking);
router.post('/demobook', protect, authorize('attendee', 'admin', 'organizer', 'staff'), demoBooking);
router.post('/demo-checkout', protect, authorize('attendee', 'admin', 'organizer', 'staff'), demoBooking);
router.post('/checkout', protect, authorize('attendee', 'admin', 'organizer', 'staff'), checkout);
router.post('/create-order', protect, authorize('attendee', 'admin', 'organizer', 'staff'), checkout);
router.post('/verify', protect, authorize('attendee', 'admin', 'organizer', 'staff'), verifyPayment);
router.post('/:id/installment', protect, authorize('attendee', 'admin', 'organizer', 'staff'), require('../controllers/bookingController').initiateInstallment);
router.post('/verify-installment', protect, authorize('attendee', 'admin', 'organizer', 'staff'), require('../controllers/bookingController').verifyInstallment);
router.get('/mybookings', protect, getMyBookings);

module.exports = router;
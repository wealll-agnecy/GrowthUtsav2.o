const express = require('express');
const {
    getTicket,
    downloadTicket,
    verifyTicket,
    verifyManualTicket,
    getTodayEvents,
    verifyTicketForStaff
} = require('../controllers/ticketController');



const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

// ⚠️ IMPORTANT: Specific named routes MUST come before parameterized /:id routes
router.get('/today', protect, authorize('staff', 'admin'), getTodayEvents);
router.post('/verify', protect, authorize('staff', 'admin'), verifyTicket);
router.post('/verify-manual', protect, authorize('staff', 'admin'), verifyManualTicket);
router.post('/create', protect, authorize('admin'), require('../controllers/ticketController').createTicket);
router.get('/verify/:id', protect, authorize('staff', 'admin'), verifyTicketForStaff);



router.get('/:id', protect, getTicket);
router.get('/:id/download', protect, downloadTicket);


module.exports = router;

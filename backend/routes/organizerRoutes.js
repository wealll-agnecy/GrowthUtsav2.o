const express = require('express');
const {
    getStaff,
    createStaff,
    assignStaffToEvents,
    deleteStaff
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All organizer routes require auth + organizer role
router.use(protect);
router.use(authorize('organizer'));

// Staff Management for Organizers
router.route('/staff')
    .get(getStaff)
    .post(createStaff);

router.route('/staff/:id')
    .delete(deleteStaff);

router.put('/staff/:id/assign', assignStaffToEvents);

module.exports = router;

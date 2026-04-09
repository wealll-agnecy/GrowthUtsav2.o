const express = require('express');
const { getEvents, updateEventStatus } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const {
    getPendingOrganizers,
    getApprovedOrganizers,
    getRejectedOrganizers,
    approveOrganizer,
    rejectOrganizer,
    getAllUsers
} = require('../controllers/organizerController');
const {
    getStaff,
    createStaff,
    assignStaffToEvents,
    deleteStaff
} = require('../controllers/staffController');

const {
    getTotalRevenue,
    getNetProfit,
    getActiveEvents,
    getPendingRequests
} = require('../controllers/adminDashboardController');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize('admin'));

// ── Dashboard Stats ───────────────────────────────────────
router.get('/total-revenue', getTotalRevenue);
router.get('/net-profit', getNetProfit);
router.get('/active-events', getActiveEvents);
router.get('/total-users', require('../controllers/adminDashboardController').getTotalUsers);
router.get('/total-events', require('../controllers/adminDashboardController').getTotalEvents);
router.get('/tickets-sold', require('../controllers/adminDashboardController').getTicketsSold);
router.get('/pending-requests', getPendingRequests);

// ── Organizer Request Management ──────────────────────────
router.get('/organizers/pending', getPendingOrganizers);
router.get('/organizers/approved', getApprovedOrganizers);
router.get('/organizers/rejected', getRejectedOrganizers);
router.patch('/organizers/:id/approve', approveOrganizer);
router.patch('/organizers/:id/reject', rejectOrganizer);

// ── User Management ───────────────────────────────────────
router.get('/users', getAllUsers);

// ── Staff Management ──────────────────────────────────────
router.route('/staff')
    .get(getStaff)
    .post(createStaff);

router.route('/staff/:id')
    .delete(deleteStaff);

router.put('/staff/:id/assign', assignStaffToEvents);

// ── Event Moderation ──────────────────────────────────────
router.get('/events/pending', async (req, res) => {
    try {
        const events = await Event.find({ status: 'pending' }).populate('organizer', 'name email');
        res.status(200).json({ success: true, data: events });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/events/:id/approve', async (req, res, next) => {
    try {
        req.body = req.body || {};
        req.body.status = 'approved';
        await updateEventStatus(req, res, next);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/events/:id/reject', async (req, res, next) => {
    try {
        req.body = req.body || {};
        req.body.status = 'rejected';
        await updateEventStatus(req, res, next);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;


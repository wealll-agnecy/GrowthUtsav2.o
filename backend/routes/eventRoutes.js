const express = require('express');
const {
    createEvent,
    getEvents,
    getEvent,
    getMyEvents,
    updateEvent,
    deleteEvent,
    updateEventStatus
} = require('../controllers/eventController');

const router = express.Router();

const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');

router
    .route('/')
    .post(protect, authorize('organizer', 'admin'), createEvent)
    .get(optionalProtect, getEvents);

router
    .route('/myevents')
    .get(protect, authorize('organizer'), getMyEvents);

router
    .route('/:id')
    .get(optionalProtect, getEvent)
    .put(protect, authorize('organizer', 'admin'), updateEvent)
    .delete(protect, authorize('organizer', 'admin'), deleteEvent);

router
    .route('/:id/status')
    .put(protect, authorize('organizer', 'admin'), updateEventStatus);

module.exports = router;

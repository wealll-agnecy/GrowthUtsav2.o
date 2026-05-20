const express = require('express');
const {
    createEvent,
    getEvents,
    getEvent,
    getMyEvents,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    toggleLive,
    updateLiveStatus
} = require('../controllers/eventController');

const router = express.Router();

const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.put('/toggle-live/:id', protect, authorize('organizer', 'admin'), toggleLive);
router.put('/set-live/:id', protect, authorize('organizer', 'admin'), updateLiveStatus);
router.put('/:id/status', protect, authorize('organizer', 'admin'), updateEventStatus);

router
    .route('/')
    .post(protect, authorize('organizer', 'admin'), upload.single('eventImage'), createEvent)
    .get(optionalProtect, getEvents);

router
    .route('/myevents')
    .get(protect, authorize('organizer'), getMyEvents);

router
    .route('/:id')
    .get(optionalProtect, getEvent)
    .put(protect, authorize('organizer', 'admin'), upload.single('eventImage'), updateEvent)
    .delete(protect, authorize('organizer', 'admin'), deleteEvent);

// Status update handled by generic put route or specific status route above

module.exports = router;

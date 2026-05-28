const express = require('express');
const {
    getEvents,
    getEvent,
    getMyEvents
} = require('../controllers/eventController');

const router = express.Router();
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router
    .route('/')
    .get(optionalProtect, getEvents);

router
    .route('/myevents')
    .get(protect, getMyEvents);

router
    .route('/:id')
    .get(optionalProtect, getEvent);

module.exports = router;

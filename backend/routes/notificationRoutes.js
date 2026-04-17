const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getNotifications,
    markAsRead
} = require('../controllers/notificationController');

// All notification routes are protected
router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/clear', require('../controllers/notificationController').clearNotifications);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    createInquiry,
    getOrganizerInquiries,
    updateInquiryStatus,
    deleteInquiry
} = require('../controllers/eventInquiryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create', createInquiry);
router.get('/organizer', protect, authorize('organizer'), getOrganizerInquiries);
router.put('/:id', protect, authorize('organizer'), updateInquiryStatus);
router.delete('/:id', protect, authorize('organizer'), deleteInquiry);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    createEnquiry,
    getEnquiries,
    getEnquiryById,
    updateStatus,
    deleteEnquiry
} = require('../controllers/enquiryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to submit enquiry (matched to user logic)
router.post('/', createEnquiry);

// Admin / Dashboard routes (Protected)
router.get('/', protect, authorize('admin'), getEnquiries);
router.get('/:id', protect, authorize('admin'), getEnquiryById);
router.put('/:id', protect, authorize('admin'), updateStatus);
router.delete('/:id', protect, authorize('admin'), deleteEnquiry);

module.exports = router;

const express = require('express');
const {
    getPlans,
    selectPlan
} = require('../controllers/servicePlanController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getPlans);
router.put('/select/:planId', protect, authorize('organizer', 'admin'), selectPlan);

module.exports = router;

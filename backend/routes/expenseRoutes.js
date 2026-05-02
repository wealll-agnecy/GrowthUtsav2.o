const express = require('express');
const {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    getProfitSummary,
    getProfit
} = require('../controllers/expenseController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'organizer'));

// Expense routes
router.get('/', getExpenses);
router.post('/', addExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

// Profit summary route
router.get('/summary', getProfitSummary);
router.get('/profit', getProfit);


module.exports = router;

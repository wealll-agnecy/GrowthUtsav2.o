const express = require('express');
const {
    getStaff,
    createStaff,
    assignStaffToEvents,
    deleteStaff
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/authMiddleware');

const Ticket = require('../models/Ticket');
const Expense = require('../models/Expense');
const Event = require('../models/Event');

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
router.get("/event/:id/details", async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    const eventName = event ? event.title : 'Unknown Event';

    const tickets = await Ticket.find({ event: eventId });
    const expenses = await Expense.find({ eventId: eventId }); // Note: updated to eventId field

    const totalRevenue = tickets.reduce((sum, t) => sum + (t.price || 0), 0);
    const totalTickets = tickets.length;
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const profit = totalRevenue - totalExpenses;

    const salesByDateMap = {};
    const planSalesMap = {};
    
    tickets.forEach(t => {
      const dateStr = new Date(t.createdAt).toISOString().split('T')[0];
      if (!salesByDateMap[dateStr]) salesByDateMap[dateStr] = { date: dateStr, ticketsSold: 0, revenue: 0 };
      salesByDateMap[dateStr].ticketsSold += 1;
      salesByDateMap[dateStr].revenue += (t.price || 0);
      
      const plan = t.ticketType || 'General';
      if (!planSalesMap[plan]) planSalesMap[plan] = { planName: plan, ticketsSold: 0, revenue: 0 };
      planSalesMap[plan].ticketsSold += 1;
      planSalesMap[plan].revenue += (t.price || 0);
    });

    const salesByDate = Object.values(salesByDateMap);
    const planSales = Object.values(planSalesMap);

    res.json({
      eventName,
      totalTickets,
      totalRevenue,
      totalExpenses,
      profit,
      salesByDate,
      planSales,
      expenses
    });

    } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/bookings', async (req, res) => {
    try {
        const Booking = require('../models/Booking');
        const Event = require('../models/Event');
        
        // Find events owned by this organizer
        const myEvents = await Event.find({ organizer: req.user.id }).select('_id');
        const eventIds = myEvents.map(e => e._id);
        
        const bookings = await Booking.find({ event: { $in: eventIds } })
            .populate('user', 'name email phone')
            .populate('event', 'title venue date')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/revenue', async (req, res) => {
    try {
        const Booking = require('../models/Booking');
        const Event = require('../models/Event');
        const now = new Date();

        // 1. Find all COMPLETED events owned by this organizer
        const completedEvents = await Event.find({
            organizer: req.user.id,
            endDate: { $lt: now }
        });

        const eventIds = completedEvents.map(e => e._id);

        // 2. Sum the amountPaid from all bookings for these events
        const bookings = await Booking.find({ 
            event: { $in: eventIds },
            paymentStatus: { $in: ['partial', 'completed'] } // Only count actual payments
        });

        const totalRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

        res.status(200).json({ 
            success: true, 
            totalRevenue, 
            totalEvents: completedEvents.length 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

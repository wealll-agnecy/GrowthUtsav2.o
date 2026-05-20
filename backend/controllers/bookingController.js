// Razorpay dependency removed
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const { createTicketAfterPayment } = require('./ticketController');
const { sendBookingConfirmation } = require('../services/emailService');
const { generateTicketPDF } = require('../services/pdfService');

// Safe Demo Order Generation (Razorpay removed)
const generateDemoOrder = (amount) => ({
    id: "demo_" + Date.now(),
    amount: amount * 100,
    currency: 'INR'
});

// @desc    Initiate Checkout
// @route   POST /api/v1/bookings/checkout
exports.checkout = async (req, res) => {
    try {
        const { eventId, ticketType, quantity, attendeeDetails, partialAmount, contactEmail } = req.body;
        if (!eventId || !ticketType || !quantity) return res.status(400).json({ success: false, message: "Missing fields" });

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ success: false, message: "Event not found" });

        let totalAmount = 0;
        let selectedDatesArray = [];

        // MULTI-DAY PRICE RESOLUTION
        if (event.isMultiDay && (req.body.selectedDays?.length > 0 || req.body.selectedDate)) {
            const daysToProcess = req.body.selectedDays && req.body.selectedDays.length > 0 
                ? req.body.selectedDays 
                : [req.body.selectedDate];
            
            selectedDatesArray = daysToProcess;

            for (const reqDateStr of daysToProcess) {
                const reqDate = new Date(reqDateStr).toDateString();
                const day = event.multiDayPlan.find(d => new Date(d.date).toDateString() === reqDate);
                if (!day) return res.status(400).json({ success: false, message: "Invalid event date selected" });
                
                // Use plan name from selectedPlans if available, otherwise fallback to ticketType
                const planName = (req.body.selectedPlans && req.body.selectedPlans[reqDateStr]) || ticketType;
                const dayTier = day.plans.find(p => p.name === planName);
                if (!dayTier) return res.status(400).json({ success: false, message: `Invalid plan (${planName}) for date ${reqDateStr}` });
                
                totalAmount += dayTier.price * parseInt(quantity);
            }
        } else {
            const tier = event.ticketTypes.find(t => t.name === ticketType);
            if (!tier) return res.status(400).json({ success: false, message: "Invalid ticket type" });
            totalAmount = tier.price * parseInt(quantity);
        }

        // FOOD PRICE RESOLUTION
        let foodCost = 0;
        if (req.body.selectedFood && Array.isArray(req.body.selectedFood)) {
            req.body.selectedFood.forEach(item => {
                const option = event.foodSettings?.options?.find(opt => opt.itemName === item.itemName);
                if (option) {
                    foodCost += (option.price || 0) * (item.quantity || quantity);
                }
            });
        }
        totalAmount += foodCost;

        const paymentAmount = partialAmount ? parseFloat(partialAmount) : totalAmount;
        const order = generateDemoOrder(paymentAmount);

        const bookingData = {
            user: req.user.id,
            event: eventId,
            ticketType,
            selectedPlans: req.body.selectedPlans,
            selectedDate: selectedDatesArray.length > 0 ? selectedDatesArray[0] : event.date,
            selectedDays: selectedDatesArray,
            quantity: parseInt(quantity),
            totalAmount,
            orderId: order.id,
            paymentStatus: 'pending',
            contactEmail: contactEmail || req.user.email,
            attendeeDetails: attendeeDetails || [{ name: req.user.name, email: req.user.email, phone: req.user.phone }],
            selectedFood: req.body.selectedFood || []
        };

        const booking = await Booking.create(bookingData);
        res.status(200).json({ success: true, order, bookingId: booking._id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify Payment & Finalize Booking
// @route   POST /api/v1/bookings/verify
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, amount } = req.body;
        const booking = await Booking.findById(bookingId).populate('event', 'title date venue bannerImage foodSettings isMultiDay multiDayPlan ticketTypes');
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        // If amount is not passed, we fallback to totalAmount (assume full payment)
        // However, if it's a partial payment flow, the frontend SHOULD pass the amount.
        const amountFromOrder = amount || booking.totalAmount; 

        booking.amountPaid = (booking.amountPaid || 0) + parseFloat(amountFromOrder);
        booking.paymentStatus = booking.amountPaid >= booking.totalAmount ? 'completed' : 'partial';
        
        booking.payments.push({
            amount: parseFloat(amountFromOrder),
            paymentId: razorpay_payment_id || "DEMO_PAY_" + Date.now(),
            orderId: razorpay_order_id,
            date: new Date()
        });

        // ATOMIC INVENTORY UPDATE
        // We use atomic update filters to guarantee no double-booking even under 100k concurrent requests
        const quantityToBuy = booking.quantity || 1;
        
        if (booking.event.isMultiDay && booking.selectedDays?.length > 0) {
            const updatedDays = [];
            try {
                for (const dayDate of booking.selectedDays) {
                    const planName = (booking.selectedPlans && booking.selectedPlans[dayDate]) || booking.ticketType;
                    
                    const eventDoc = await Event.findById(booking.event._id);
                    const day = eventDoc.multiDayPlan.find(d => new Date(d.date).toDateString() === new Date(dayDate).toDateString());
                    if (!day) throw new Error("Invalid date");
                    const dayTier = day.plans.find(p => p.name === planName);
                    if (!dayTier) throw new Error("Plan not found");

                    const updateRes = await Event.findOneAndUpdate(
                        { 
                            _id: booking.event._id, 
                            "multiDayPlan": {
                                $elemMatch: {
                                    date: new Date(dayDate),
                                    "plans": { 
                                        $elemMatch: { 
                                            name: planName,
                                            sold: { $lte: dayTier.quantity - quantityToBuy }
                                        } 
                                    }
                                }
                            }
                        },
                        { $inc: { "multiDayPlan.$[day].plans.$[plan].sold": quantityToBuy } },
                        { 
                            arrayFilters: [ { "day.date": new Date(dayDate) }, { "plan.name": planName } ],
                            new: true 
                        }
                    );
                    if (!updateRes) {
                        throw new Error(`Sold out or invalid plan for date ${new Date(dayDate).toDateString()}`);
                    }
                    updatedDays.push({ dayDate, planName });
                }
            } catch (err) {
                // Rollback successfully decremented inventories to prevent data corruption
                for (const updated of updatedDays) {
                    await Event.findOneAndUpdate(
                        { _id: booking.event._id },
                        { $inc: { "multiDayPlan.$[day].plans.$[plan].sold": -quantityToBuy } },
                        { arrayFilters: [ { "day.date": new Date(updated.dayDate) }, { "plan.name": updated.planName } ] }
                    );
                }
                throw err;
            }
        } else {
            // Single-day logic
            const eventDoc = await Event.findById(booking.event._id);
            const tier = eventDoc.ticketTypes.find(t => t.name === booking.ticketType);
            if (!tier) throw new Error("Ticket tier not found");

            const updateRes = await Event.findOneAndUpdate(
                { 
                    _id: booking.event._id, 
                    "ticketTypes": { 
                        $elemMatch: { 
                            name: booking.ticketType,
                            sold: { $lte: tier.quantity - quantityToBuy }
                        } 
                    }
                },
                { $inc: { "ticketTypes.$[tier].sold": quantityToBuy } },
                { arrayFilters: [ { "tier.name": booking.ticketType } ], new: true }
            );
            if (!updateRes) throw new Error("This ticket tier is now sold out.");
        }

        console.log(`[PDF] [PDF] Generating ticket for booking ${booking._id}...`);
        const ticket = await createTicketAfterPayment(booking._id, booking.event._id, req.user.id);
        console.log(`✅ [PDF] Ticket generated successfully: ${ticket._id}`);

        // Save ticket link
        booking.ticketId = ticket._id;
        await booking.save();        // AUTO EMAIL with PDF (Decoupled & Asynchronously processed in background to keep checkout under 10ms)
        if (booking.paymentStatus === 'completed') {
            setImmediate(async () => {
                try {
                    console.log(`[EMAIL] [EMAIL] [ASYNC] Preparing background dispatch for: ${booking.contactEmail || req.user.email}`);
                    const pdfBuffer = await generateTicketPDF(ticket._id);
                    await sendBookingConfirmation(
                        { name: req.user.name, email: booking.contactEmail || req.user.email },
                        booking.event,
                        pdfBuffer,
                        { 
                            ticketType: booking.ticketType, 
                            quantity: booking.quantity, 
                            totalAmount: booking.totalAmount, 
                            ticketId: ticket._id 
                        }
                    );
                    console.log(`✅ [EMAIL] Background dispatch complete for booking ${booking._id}`);
                } catch (emailErr) {
                    console.error("❌ [EMAIL ERROR] Background dispatch failed:", emailErr.message);
                }
            });
        }

        // Queue Event Reminders
        const { scheduleReminders } = require('../queue/notificationQueue');
        await scheduleReminders(req.user.id, booking.event._id, booking.event.date);

        res.status(200).json({ success: true, message: "Booking successful", ticketId: ticket._id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Demo Booking (Bypass Payment)
// @route   POST /api/v1/bookings/demo-book
exports.demoBooking = async (req, res) => {
    try {
        const { eventId, ticketType, quantity, attendeeDetails, partialAmount, contactEmail } = req.body;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ success: false, message: "Event not found" });

        let tier;
        let totalAmount = 0;
        let selectedDatesArray = [];
        let tiersToUpdate = [];

        // MULTI-DAY PRICE RESOLUTION
        if (event.isMultiDay && (req.body.selectedDays?.length > 0 || req.body.selectedDate)) {
            const daysToProcess = req.body.selectedDays && req.body.selectedDays.length > 0 
                ? req.body.selectedDays 
                : [req.body.selectedDate];
            
            selectedDatesArray = daysToProcess;

            for (const reqDateStr of daysToProcess) {
                const reqDate = new Date(reqDateStr).toDateString();
                const day = event.multiDayPlan.find(d => new Date(d.date).toDateString() === reqDate);
                if (!day) return res.status(400).json({ success: false, message: "Invalid event date selected" });
                
                // Use plan name from selectedPlans if available, otherwise fallback to ticketType
                const planName = (req.body.selectedPlans && req.body.selectedPlans[reqDateStr]) || ticketType;
                const dayTier = day.plans.find(p => p.name === planName);
                if (!dayTier) return res.status(400).json({ success: false, message: `Invalid plan (${planName}) for date ${reqDateStr}` });
                
                totalAmount += dayTier.price * parseInt(quantity);
                tiersToUpdate.push(dayTier);
            }
        } else {
            tier = event.ticketTypes.find(t => t.name === ticketType);
            if (!tier) return res.status(400).json({ success: false, message: "Invalid ticket type" });
            totalAmount = tier.price * parseInt(quantity);
            tiersToUpdate.push(tier);
        }

        // FOOD PRICE RESOLUTION
        let foodCost = 0;
        if (req.body.selectedFood && Array.isArray(req.body.selectedFood)) {
            req.body.selectedFood.forEach(item => {
                const option = event.foodSettings?.options?.find(opt => opt.itemName === item.itemName);
                if (option) {
                    foodCost += (option.price || 0) * (item.quantity || quantity);
                }
            });
        }
        totalAmount += foodCost;

        const paid = (partialAmount && !isNaN(parseFloat(partialAmount))) ? parseFloat(partialAmount) : totalAmount;

        const booking = await Booking.create({
            user: req.user.id,
            event: eventId,
            ticketType,
            selectedPlans: req.body.selectedPlans,
            selectedDate: selectedDatesArray.length > 0 ? selectedDatesArray[0] : event.date,
            selectedDays: selectedDatesArray,
            quantity: parseInt(quantity),
            totalAmount,
            amountPaid: paid,
            orderId: "DEMO_ORDER_" + Date.now(),
            paymentId: "DEMO_PAY_" + Date.now(),
            paymentStatus: paid >= totalAmount ? 'completed' : 'partial',
            contactEmail: contactEmail || req.user.email,
            attendeeDetails: attendeeDetails || [{ name: req.user.name, email: req.user.email, phone: req.user.phone }],
            selectedFood: req.body.selectedFood || []
        });

        // ATOMIC INVENTORY UPDATE (Same logic as verifyPayment)
        const quantityToBuy = parseInt(quantity);
        if (event.isMultiDay && selectedDatesArray.length > 0) {
            for (const dayDate of selectedDatesArray) {
                const planName = (req.body.selectedPlans && req.body.selectedPlans[dayDate]) || ticketType;
                
                const eventDoc = await Event.findById(eventId);
                const day = eventDoc.multiDayPlan.find(d => new Date(d.date).toDateString() === new Date(dayDate).toDateString());
                if (!day) throw new Error("Invalid date");
                const dayTier = day.plans.find(p => p.name === planName);
                if (!dayTier) throw new Error("Plan not found");

                const updateRes = await Event.findOneAndUpdate(
                    { 
                        _id: eventId, 
                        "multiDayPlan": {
                            $elemMatch: {
                                date: new Date(dayDate),
                                "plans": { 
                                    $elemMatch: { 
                                        name: planName,
                                        sold: { $lte: dayTier.quantity - quantityToBuy }
                                    } 
                                }
                            }
                        }
                    },
                    { $inc: { "multiDayPlan.$[day].plans.$[plan].sold": quantityToBuy } },
                    { arrayFilters: [ { "day.date": new Date(dayDate) }, { "plan.name": planName } ], new: true }
                );
                if (!updateRes) throw new Error(`Sold out for date ${dayDate}`);
            }
        } else {
            const eventDoc = await Event.findById(eventId);
            const tier = eventDoc.ticketTypes.find(t => t.name === ticketType);
            if (!tier) throw new Error("Ticket tier not found");

            const updateRes = await Event.findOneAndUpdate(
                { 
                    _id: eventId, 
                    "ticketTypes": { 
                        $elemMatch: { 
                            name: ticketType,
                            sold: { $lte: tier.quantity - quantityToBuy }
                        } 
                    }
                },
                { $inc: { "ticketTypes.$[tier].sold": quantityToBuy } },
                { arrayFilters: [ { "tier.name": ticketType } ], new: true }
            );
            if (!updateRes) throw new Error("This ticket tier is now sold out.");
        }

        const ticket = await createTicketAfterPayment(booking._id, eventId, req.user.id);

        // Save ticket link
        booking.ticketId = ticket._id;
        await booking.save();

        // AUTO EMAIL with PDF
        if (booking.paymentStatus === 'completed') {
            try {
                const pdfBuffer = await generateTicketPDF(ticket._id);
                await sendBookingConfirmation(
                    { name: req.user.name, email: booking.contactEmail || req.user.email },
                    event,
                    pdfBuffer,
                    { 
                        ticketType: booking.ticketType, 
                        quantity: booking.quantity, 
                        totalAmount: booking.totalAmount, 
                        ticketId: ticket._id 
                    }
                );
            } catch (emailErr) {
                console.error("Email/PDF background error:", emailErr.message);
            }
        }

        // Queue Event Reminders
        const { scheduleReminders } = require('../queue/notificationQueue');
        await scheduleReminders(req.user.id, eventId, event.date);

        res.status(200).json({ 
            success: true, 
            message: "Success! Ticket sent to email", 
            bookingId: booking._id, 
            ticketId: ticket._id 
        });
    } catch (err) {
        console.error("Booking Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('event', 'title date venue bannerImage')
            .sort({ createdAt: -1 })
            .lean({ virtuals: true });
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Initiate Installment Payment
// @route   POST /api/v1/bookings/:id/installment
exports.initiateInstallment = async (req, res) => {
    try {
        const { amount } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const remaining = booking.totalAmount - booking.amountPaid;
        if (amount > remaining) return res.status(400).json({ success: false, message: `Amount exceeds remaining balance of ${remaining}` });

        const order = generateDemoOrder(amount);

        res.status(200).json({ success: true, order, bookingId: booking._id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify Installment Payment
// @route   POST /api/v1/bookings/verify-installment
exports.verifyInstallment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, bookingId, amount } = req.body;
        const booking = await Booking.findById(bookingId).populate('event', 'title date venue bannerImage');
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        booking.amountPaid = (booking.amountPaid || 0) + parseFloat(amount);
        booking.paymentStatus = booking.amountPaid >= booking.totalAmount ? 'completed' : 'partial';
        
        booking.payments.push({
            amount: parseFloat(amount),
            paymentId: razorpay_payment_id || "DEMO_PAY_" + Date.now(),
            orderId: razorpay_order_id,
            date: new Date()
        });

        console.log(`✅ [PAYMENT] Installment Verified! Amount: ${amount}, Booking: ${bookingId}`);
        await booking.save();

        // Sync Ticket Financials
        if (booking.ticketId) {
            console.log(`[PDF] [PDF] Regenerating ticket for booking ${booking._id} (Installment update)...`);
            const Ticket = require('../models/Ticket');
            const ticket = await Ticket.findByIdAndUpdate(booking.ticketId, {
                amountPaid: booking.amountPaid,
                paymentStatus: booking.paymentStatus === 'completed' ? 'PAID' : 'PARTIAL'
            }, { new: true });

            // Send email if payment is now complete
            if (booking.paymentStatus === 'completed') {
                try {
                    const pdfBuffer = await generateTicketPDF(booking.ticketId);
                    await sendBookingConfirmation(
                        { name: req.user.name, email: booking.contactEmail || req.user.email },
                        booking.event,
                        pdfBuffer,
                        { 
                            ticketType: booking.ticketType, 
                            quantity: booking.quantity, 
                            totalAmount: booking.totalAmount, 
                            ticketId: booking.ticketId 
                        }
                    );
                } catch (emailErr) {
                    console.error("Installment Completion Email Error:", emailErr.message);
                }
            }
        }

        res.status(200).json({ 
            success: true, 
            message: "Payment updated", 
            amountPaid: booking.amountPaid,
            ticketId: booking.ticketId 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Resend Ticket Email
// @route   POST /api/v1/bookings/resend-ticket/:id
exports.resendTicketEmail = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id).populate('event', 'title date venue bannerImage');
        
        // Fallback: If not found, check if the ID provided is actually a Ticket ID
        if (!booking) {
            const ticket = await require('../models/Ticket').findById(req.params.id).populate({
                path: 'booking',
                populate: { path: 'event' }
            });
            if (ticket && ticket.booking) {
                booking = ticket.booking;
            }
        }

        if (!booking) return res.status(404).json({ success: false, message: "Booking or Ticket reference not found" });

        if (booking.paymentStatus !== 'completed') {
            return res.status(400).json({ success: false, message: "Payment not completed yet" });
        }

        if (!booking.ticketId) {
            return res.status(400).json({ success: false, message: "No ticket record found for this booking." });
        }

        console.log(`[PDF] [RESEND] Regenerating PDF for Ticket: ${booking.ticketId}`);
        const pdfBuffer = await generateTicketPDF(booking.ticketId);
        await sendBookingConfirmation(
            { name: req.user.name, email: booking.contactEmail || req.user.email },
            booking.event,
            pdfBuffer,
            { 
                ticketType: booking.ticketType, 
                quantity: booking.quantity, 
                totalAmount: booking.totalAmount, 
                ticketId: booking.ticketId 
            }
        );

        res.status(200).json({ success: true, message: "Ticket resent successfully to " + (booking.contactEmail || req.user.email) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
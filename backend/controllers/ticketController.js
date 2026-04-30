const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const ScanLog = require('../models/ScanLog');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { generateTicketPDF } = require('../services/pdfService');

// @desc    Get Ticket Details (including QR URL for frontend display)
// @route   GET /api/v1/tickets/:id
// @access  Private
exports.getTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('event', 'title date time venue bannerImage')
            .populate('booking', 'ticketType quantity totalAmount selectedDate selectedDays amountPaid paymentStatus');

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Only owner or admin can view
        if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const QRCode = require('qrcode');
        const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
        const verificationUrl = `${baseUrl}/ticket/${ticket.uuid}`;
        const qrCodeUrl = await QRCode.toDataURL(verificationUrl);

        res.status(200).json({
            success: true,
            data: ticket,
            qrCodeUrl: qrCodeUrl
        });
    } catch (err) {
        console.error("Error in getTicket:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Manual Ticket Creation (Admin-only)
// @route   POST /api/v1/tickets/create
// @access  Private (Admin)
exports.createTicket = async (req, res, next) => {
    try {
        const { name, email, eventId, ticketType, ticketPrice, mobileNumber } = req.body;
        
        const { getNextSequenceValue } = require('../utils/sequenceGenerator');
        const uuid = uuidv4();
        const ticketCode = await getNextSequenceValue('ticket_id', 'GUTC');

        const ticket = await Ticket.create({
            uuid,
            ticketCode: ticketCode,
            name,
            email,
            mobileNumber: mobileNumber || '0000000000',
            eventName: 'Manual Entry', // Fallback for manual
            eventId,
            ticketType: ticketType || 'General',
            ticketPrice: ticketPrice || 0,
            user: req.user.id,
            status: 'unused',
            bookedAt: new Date()
        });

        res.status(201).json({
            success: true,
            data: ticket
        });
    } catch (err) {
        console.error("Manual Ticket Creation Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Download Ticket PDF
// @route   GET /api/v1/tickets/:id/download
// @access  Private
exports.downloadTicket = async (req, res, next) => {
    try {
        const ticketId = req.params.id;
        
        // Security Check
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        
        if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const buffer = await generateTicketPDF(ticketId);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ticket-${ticketId.substring(0,8)}.pdf`);
        res.send(buffer);
    } catch (err) {
        console.error("PDF Download Error:", err.message);
        res.status(500).json({ success: false, message: "Could not generate PDF" });
    }
};

// @desc    Verify Ticket for Scanner (Public URL version)
// @route   GET /api/ticket/verify/:id
// @access  Public (Verification page will display info)
exports.verifyTicketForScanner = async (req, res) => {
    try {
        const ticketId = req.params.id; // This is the uuid
        
        const ticket = await Ticket.findOne({ uuid: ticketId })
            .populate('event', 'title date time venue')
            .populate('user', 'name email');

        if (!ticket) {
            return res.status(200).json({ 
                success: true, 
                status: 'ACCESS DENIED — Invalid ticket',
                message: 'Ticket ID not found in database.' 
            });
        }

        // --- VALIDATION LOGIC ---
        const booking = await Booking.findById(ticket.booking);
        const event = ticket.event || (booking ? booking.event : null);
        
        // Source of Truth
        const currentAmountPaid = booking ? (booking.amountPaid || 0) : (ticket.amountPaid || 0);
        const currentTotalAmount = booking ? booking.totalAmount : (ticket.totalAmount || 0);
        const currentRemaining = Math.max(0, currentTotalAmount - currentAmountPaid);
        const currentPaymentStatus = booking ? (booking.paymentStatus || 'PENDING').toUpperCase() : (ticket.paymentStatus || 'UNKNOWN');

        // Multi-day logic
        const durationDays = (event && event.isMultiDay) ? (event.multiDayPlan?.length || 1) : 1;
        const validityText = `Valid for ${durationDays} Day${durationDays > 1 ? 's' : ''}`;

        const details = {
            ticketId: ticket._id,
            ticketCode: ticket.ticketCode,
            name: ticket.name,
            email: ticket.email,
            phone: ticket.mobileNumber,
            eventName: ticket.eventName || (event ? event.title : 'Event'),
            status: ticket.status.toUpperCase(),
            paymentStatus: currentPaymentStatus,
            ticketTier: ticket.ticketType,
            ticketPrice: currentTotalAmount,
            amountPaid: currentAmountPaid,
            remainingAmount: currentRemaining,
            validity: validityText,
            selectedDate: ticket.selectedDate,
            selectedDays: ticket.selectedDays,
            bookedAt: ticket.bookedAt,
            seat: ticket.seatNumber || 'General'
        };

        // 1. Cancelled Ticket
        if (ticket.status === 'cancelled') {
            return res.status(200).json({
                success: true,
                status: 'DENIED',
                isDuplicate: true,
                message: 'Ticket Cancelled',
                data: details,
                ticket: details
            });
        }

        // 2. Payment Pending Check
        const isPaid = (
            currentPaymentStatus === 'COMPLETED' || 
            currentPaymentStatus === 'PAID' || 
            currentRemaining <= 0
        );
        
        if (!isPaid) {
            return res.status(200).json({
                success: true,
                status: 'DENIED',
                isDuplicate: false,
                message: `Payment Pending: ₹${currentRemaining}`,
                data: details,
                ticket: details
            });
        }

        // 3. DAILY SCAN LIMIT
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        if (ticket.lastScanDate && ticket.lastScanDate >= startOfToday) {
            return res.status(200).json({
                success: true,
                status: 'DENIED',
                isDuplicate: true,
                message: 'Already Used Today',
                data: details,
                ticket: details
            });
        }

        // 4. ATOMIC ENTRY MARKING
        const updatedTicket = await Ticket.findOneAndUpdate(
            { 
                _id: ticket._id, 
                $or: [
                    { lastScanDate: { $exists: false } },
                    { lastScanDate: { $lt: startOfToday } }
                ],
                status: { $ne: 'cancelled' }
            },
            { 
                $set: { 
                    status: 'used', 
                    isScanned: true, 
                    scannedAt: new Date(),
                    lastScanDate: new Date()
                } 
            },
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(200).json({
                success: true,
                status: 'DENIED',
                isDuplicate: true,
                message: 'Already Used',
                data: details,
                ticket: details
            });
        }

        return res.status(200).json({
            success: true,
            status: 'GRANTED',
            isDuplicate: false,
            message: 'Clear for Entry',
            data: details,
            ticket: details
        });

    } catch (err) {
        console.error("Scanner Verification Error:", err.message);
        res.status(500).json({ success: false, message: 'Internal Server Error during verification' });
    }
};

// @desc    Verify Ticket for Staff Scanner (Access Control)
// @route   GET /api/v1/tickets/verify/:id
// @access  Private (Staff/Admin)
exports.verifyTicketForStaff = async (req, res) => {
    try {
        const ticketId = req.params.id; // Could be uuid
        
        const ticket = await Ticket.findOne({ 
            $or: [
                { uuid: ticketId },
                { ticketCode: ticketId }
            ]
        }).populate('event', 'title date venue');

        if (!ticket) {
            return res.status(200).json({ 
                success: true,
                status: 'INVALID',
                message: 'Ticket not found in system node.'
            });
        }

        const details = {
            name: ticket.name,
            email: ticket.email,
            eventName: ticket.eventName || ticket.event?.title || 'Unknown Event',
            ticketCode: ticket.ticketCode,
            ticketType: ticket.ticketType,
            isScanned: ticket.isScanned,
            status: ticket.status,
            selectedDate: ticket.selectedDate || ticket.event?.date,
            selectedDays: ticket.selectedDays
        };

        // ACCESS CONTROL LOGIC
        const booking = await Booking.findById(ticket.booking);
        if (!booking || booking.amountPaid < booking.totalAmount) {
            return res.status(200).json({
                success: true,
                status: 'DENIED',
                message: 'ACCESS DENIED: Full amount not paid ⚠️',
                ticket: details
            });
        }

        if (ticket.isScanned || ticket.status === 'used') {
            return res.status(200).json({
                success: true,
                status: 'USED',
                message: 'ACCESS DENIED: Ticket Already Used',
                ticket: details
            });
        }

        // VALID ENTRY -> Update Status
        ticket.isScanned = true;
        ticket.status = 'used';
        ticket.scannedAt = Date.now();
        await ticket.save();

        return res.status(200).json({
            success: true,
            status: 'VALID',
            message: 'ACCESS GRANTED: Clear for Entry',
            ticket: details
        });

    } catch (err) {
        console.error("Staff Verification Error:", err.message);
        res.status(500).json({ success: false, message: 'Encryption breach in verification node.' });
    }
};

// Internal function to create ticket after payment
// This is used by booking control flow
exports.createTicketAfterPayment = async (bookingId, eventId, userId) => {
    try {
        console.log("🎫 STEP: Initiating createTicketAfterPayment");
        
        // STRICT OBJECTID ENFORCEMENT: Remove manual virtual-admin string bypasses.
        const userDoc = await User.findById(userId);
        
        const booking = await Booking.findById(bookingId);
        const event = await Event.findById(eventId);
        
        if (!userDoc || !booking || !event) {
            throw new Error(`Integrity Error: Missing dependencies for Ticket creation`);
        }

        const { getNextSequenceValue } = require('../utils/sequenceGenerator');
        const uniqueId = uuidv4();
        const sequentialId = await getNextSequenceValue('ticket_id', 'GUTC');

        const ticketPrice = booking.quantity > 0 ? booking.totalAmount / booking.quantity : booking.totalAmount;

        const primaryAttendee = booking.attendeeDetails && booking.attendeeDetails.length > 0 
            ? booking.attendeeDetails[0] 
            : { name: userDoc.name, email: userDoc.email };

        const ticketData = {
            uuid: uniqueId,
            ticketCode: sequentialId, 
            name: primaryAttendee.name || userDoc.name || "Attendee",
            mobileNumber: primaryAttendee.phone || userDoc.phone || '0000000000',
            email: booking.contactEmail || primaryAttendee.email || userDoc.email || 'guest@growthu.com',
            eventName: event.title,
            eventId: eventId,
            ticketType: booking.ticketType || "General",
            ticketPrice: ticketPrice,
            bookedAt: booking.createdAt || new Date(),
            status: 'unused',
            booking: bookingId,
            event: eventId,
            user: userDoc._id,
            selectedDate: booking.selectedDate,
            selectedDays: booking.selectedDays,
            amountPaid: booking.amountPaid || 0,
            totalAmount: booking.totalAmount,
            paymentStatus: booking.paymentStatus === 'completed' ? 'PAID' : 'PARTIAL'
        };

        const ticket = await Ticket.create(ticketData);
        return ticket;
    } catch (err) {
        console.error("createTicketAfterPayment Error:", err);
        throw err;
    }
};

// @desc    Verify Scanned Ticket
// @route   POST /api/v1/tickets/verify
// @access  Private (Staff/Admin)
exports.verifyTicket = async (req, res, next) => {
    try {
        const { uuid, eventId } = req.body;
        const actualUuid = uuid || req.body.ticketCode;

        if (!actualUuid) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }

        const ticket = await Ticket.findOne({ uuid: actualUuid }).populate('event', 'title date time');

        if (!ticket) {
            return res.json({ 
                success: true, 
                status: "ACCESS DENIED — Invalid ticket", 
                message: "This identifier does not match any registered ticket." 
            });
        }

        if (eventId && ticket.eventId.toString() !== eventId) {
            return res.status(400).json({ success: false, message: 'Ticket belongs to a different event' });
        }

        if (ticket.status === 'used') {
            return res.status(400).json({ 
                success: false, 
                message: 'Already Used',
                data: ticket
            });
        }

        ticket.status = 'used';
        ticket.scannedAt = Date.now();
        await ticket.save();

        await ScanLog.create({ ticketId: ticket._id, staffId: req.user.id, eventId: ticket.eventId, status: 'success' });

        res.status(200).json({
            success: true,
            message: 'Entry Allowed',
            data: ticket
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Today's Events for Scanning
// @route   GET /api/v1/tickets/today
// @access  Private (Staff/Admin)
exports.getTodayEvents = async (req, res, next) => {
    try {
        const start = new Date(); start.setHours(0,0,0,0);
        const end = new Date(); end.setHours(23,59,59,999);

        const events = await Event.find({
            $or: [ { date: { $gte: start, $lte: end } }, { status: 'live' } ]
        }).select('title date time venue status').lean();

        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify Ticket by Manual Code Entry
// @route   POST /api/v1/tickets/verify-manual
// @access  Private (Staff/Admin)
exports.verifyManualTicket = async (req, res, next) => {
    try {
        const { ticketCode, eventId } = req.body;
        const ticket = await Ticket.findOne({ uuid: ticketCode }).populate('event');

        if (!ticket) return res.status(404).json({ success: false, message: 'Invalid Ticket' });

        if (ticket.status === 'used') return res.status(400).json({ success: false, message: 'Already Used' });

        ticket.status = 'used';
        ticket.scannedAt = Date.now();
        await ticket.save();

        res.status(200).json({ success: true, message: 'Entry Allowed', data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Verify Ticket Scan (Staff Access Control)
// @route   POST /api/v1/tickets/verify-scan
// @access  Private (Staff/Admin)
exports.verifyTicketScan = async (req, res) => {
    try {
        const { ticketId } = req.body;

        const ticket = await Ticket.findOne({
            $or: [
                { uuid: ticketId },
                { ticketCode: ticketId }
            ]
        }).populate('user', 'name email').populate('event', 'title date venue');

        if (!ticket) {
            return res.json({ 
                success: true, 
                status: "ACCESS DENIED — Invalid ticket", 
                message: "This identifier does not match any registered ticket." 
            });
        }

        // --- VALIDATION LOGIC ---
        const booking = await Booking.findById(ticket.booking);
        const event = ticket.event || (booking ? booking.event : null);
        
        // Source of Truth
        const currentAmountPaid = booking ? (booking.amountPaid || 0) : (ticket.amountPaid || 0);
        const currentTotalAmount = booking ? booking.totalAmount : (ticket.totalAmount || 0);
        const currentRemaining = Math.max(0, currentTotalAmount - currentAmountPaid);
        const currentPaymentStatus = booking ? (booking.paymentStatus || 'PENDING').toUpperCase() : (ticket.paymentStatus || 'UNKNOWN');

        // Multi-day logic
        const durationDays = (event && event.isMultiDay) ? (event.multiDayPlan?.length || 1) : 1;
        const validityText = `Valid for ${durationDays} Day${durationDays > 1 ? 's' : ''}`;

        // 2. Payment Condition
        const isPaid = (
            currentPaymentStatus === 'COMPLETED' || 
            currentPaymentStatus === 'PAID' || 
            currentRemaining <= 0
        );

        const details = {
            ticketId: ticket._id,
            name: ticket.name,
            email: ticket.email,
            phone: ticket.mobileNumber,
            eventName: ticket.eventName || (event ? event.title : 'Event'),
            ticketCode: ticket.ticketCode,
            ticketTier: ticket.ticketType,
            ticketPrice: currentTotalAmount,
            paymentStatus: currentPaymentStatus,
            paidAmount: currentAmountPaid,
            remainingAmount: currentRemaining,
            validityText: validityText,
            accessStatus: isPaid ? 'GREEN' : 'RED',
            seat: ticket.seatNumber || 'General'
        };

        // 1. Cancelled
        if (ticket.status === 'cancelled') {
            return res.json({
                success: true,
                status: "DENIED",
                message: "Ticket Cancelled",
                ticket: details,
                data: details
            });
        }

        // 2. Payment Pending
        if (!isPaid) {
            console.log(`⚠️ [SCAN DENIED] Staff verification failed. Payment Incomplete for ${ticket.ticketCode}. Remaining: ${currentRemaining}`);
            return res.json({
                success: true,
                status: "DENIED",
                message: `Payment Incomplete: ₹${currentRemaining}`,
                ticket: details,
                data: details
            });
        }

        // 3. DAILY SCAN LIMIT
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        if (ticket.lastScanDate && ticket.lastScanDate >= startOfToday) {
            return res.json({
                success: true,
                status: "DENIED",
                message: "Already Used Today",
                ticket: details,
                data: details
            });
        }

        // 4. ATOMIC ENTRY MARKING
        const updatedTicket = await Ticket.findOneAndUpdate(
            { 
                _id: ticket._id, 
                $or: [
                    { lastScanDate: { $exists: false } },
                    { lastScanDate: { $lt: startOfToday } }
                ],
                status: { $ne: 'cancelled' }
            },
            { 
                $set: { 
                    status: 'used', 
                    isScanned: true, 
                    scannedAt: new Date(),
                    lastScanDate: new Date()
                } 
            },
            { new: true }
        );

        if (!updatedTicket) {
            return res.json({
                success: true,
                status: "DENIED",
                message: "Already Used",
                ticket: details,
                data: details
            });
        }

        // Log Scan Success (Wrapped in try-catch to prevent scan failure on log error)
        try {
            await ScanLog.create({ 
                ticketId: ticket._id, 
                staffId: req.user.id, 
                eventId: ticket.eventId || (event ? event._id || event : null), 
                status: 'success' 
            });
        } catch (logErr) {
            console.error("Scan Log Creation Failed:", logErr.message);
        }

        return res.json({
            success: true,
            status: "GRANTED",
            message: "Clear for Entry",
            ticket: details,
            data: details
        });

    } catch (err) {
        console.error("Scan Verification Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

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
            .populate('booking', 'ticketType quantity totalAmount');

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
            return res.status(404).json({ 
                success: false, 
                message: 'Invalid Ticket: ID not found in system' 
            });
        }

        const details = {
            ticketCode: ticket.ticketCode,
            name: ticket.name,
            email: ticket.email,
            phone: ticket.mobileNumber,
            eventName: ticket.eventName || ticket.event?.title || 'Event',
            bookedAt: ticket.bookedAt,
            seat: ticket.seatNumber || 'General',
            status: ticket.status === 'used' ? 'USED' : 'VALID',
            isScanned: ticket.status === 'used'
        };

        // AUTO ENTRY MARKING
        if (ticket.status === 'unused') {
            ticket.status = 'used';
            ticket.scannedAt = Date.now();
            await ticket.save();
            
            return res.status(200).json({
                success: true,
                message: 'Clearance Granted',
                data: details
            });
        }

        return res.status(200).json({
            success: true,
            isDuplicate: true,
            message: 'ALREADY USED ❌',
            data: details
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
            status: ticket.status
        };

        // ACCESS CONTROL LOGIC
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

        const ticketData = {
            uuid: uniqueId,
            ticketCode: sequentialId, 
            name: userDoc.name || "Attendee",
            mobileNumber: userDoc.phone || '0000000000',
            email: userDoc.email || 'guest@growthu.com',
            eventName: event.title,
            eventId: eventId,
            ticketType: booking.ticketType || "General",
            ticketPrice: ticketPrice,
            bookedAt: booking.createdAt || new Date(),
            status: 'unused',
            booking: bookingId,
            event: eventId,
            user: userDoc._id
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
            return res.status(404).json({ success: false, message: 'Invalid Ticket' });
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

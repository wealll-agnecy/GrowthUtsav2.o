const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    ticketCode: { // High-Fidelity Sequential ID (e.g., GUTC000001)
        type: String,
        required: [true, 'Ticket Code is mandatory'],
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    eventName: { 
        type: String,
        required: true
    },
    eventId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    ticketType: {
        type: String,
        required: true
    },
    selectedDate: {
        type: Date
    },
    selectedDays: [{
        type: Date
    }],
    ticketPrice: {
        type: Number,
        required: true
    },
    bookedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['unused', 'used', 'cancelled'],
        default: 'unused'
    },
    isScanned: {
        type: Boolean,
        default: false
    },
    seatNumber: {
        type: String,
        default: 'General'
    },
    scannedAt: {
        type: Date
    },
    lastScanDate: {
        type: Date
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number
    },
    paymentStatus: {
        type: String,
        enum: ['PARTIAL', 'PAID'],
        default: 'PARTIAL'
    },
    booking: {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event'
    }
});

// --- PRODUCTION INDEXES ---
TicketSchema.index({ uuid: 1 });
TicketSchema.index({ ticketCode: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ isScanned: 1 });
TicketSchema.index({ booking: 1 });
TicketSchema.index({ user: 1 });
TicketSchema.index({ event: 1 });
TicketSchema.index({ bookedAt: -1 });

module.exports = mongoose.model('Ticket', TicketSchema);


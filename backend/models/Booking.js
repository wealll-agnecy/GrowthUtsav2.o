const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
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
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    totalAmount: {
        type: Number,
        required: true
    },
    attendeeDetails: [{
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    }],
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'completed', 'failed'],
        default: 'pending'
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    payments: [{
        amount: Number,
        paymentId: String,
        orderId: String,
        method: String,
        date: { type: Date, default: Date.now }
    }],
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    ticketId: {
        type: String // We'll store the UUID or ObjectId of the ticket
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);

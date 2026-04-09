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
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
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

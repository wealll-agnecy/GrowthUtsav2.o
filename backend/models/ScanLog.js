const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Ticket',
        required: true
    },
    staffId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    scannedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['success', 'duplicate', 'invalid_event', 'not_found'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ScanLog', scanLogSchema);

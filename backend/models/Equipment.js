const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add equipment name']
    },
    quantity: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['Required', 'Requested', 'Secured', 'Delivered', 'Returned'],
        default: 'Required'
    },
    source: {
        type: String,
        enum: ['In-house', 'Rental', 'Venue-provided'],
        default: 'In-house'
    },
    notes: String
});

module.exports = mongoose.model('Equipment', EquipmentSchema);

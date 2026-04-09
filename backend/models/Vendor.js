const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add vendor name']
    },
    category: {
        type: String,
        enum: ['Catering', 'AV', 'Venue', 'Decor', 'Security', 'Entertainment', 'Transport', 'Other'],
        required: true
    },
    contactPerson: String,
    email: String,
    phone: String,
    status: {
        type: String,
        enum: ['Proposed', 'Contracted', 'Paid', 'Cancelled'],
        default: 'Proposed'
    },
    notes: String
});

module.exports = mongoose.model('Vendor', VendorSchema);

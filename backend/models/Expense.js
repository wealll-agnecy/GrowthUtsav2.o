const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title for the expense'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add an expense amount']
    },
    eventId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        default: null
    },
    category: {
        type: String,
        enum: ['Venue', 'Makeup Products', 'Decoration', 'Marketing', 'Staff', 'Food', 'Travel', 'Other'],
        default: 'Other'
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    recordedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Optimization Indexes
expenseSchema.index({ eventId: 1 });
expenseSchema.index({ recordedBy: 1 });
expenseSchema.index({ date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);

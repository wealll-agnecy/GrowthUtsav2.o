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
        enum: ['Server', 'Marketing', 'Staff', 'Legal', 'Infrastructure', 'Other'],
        default: 'Other'
    },
    description: {
        type: String,
        trim: true
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

module.exports = mongoose.model('Expense', expenseSchema);

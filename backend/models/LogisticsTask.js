const mongoose = require('mongoose');

const LogisticsTaskSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add task title'],
        trim: true
    },
    description: String,
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    dueDate: Date,
    order: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('LogisticsTask', LogisticsTaskSchema);

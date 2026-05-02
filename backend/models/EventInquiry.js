const mongoose = require('mongoose');

const EventInquirySchema = new mongoose.Schema({
    attendeeId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    },
    eventId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    organizerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please provide your mobile number']
    },
    message: {
        type: String,
        required: [true, 'Please provide your message'],
        maxLength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'replied', 'closed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EventInquiry', EventInquirySchema);

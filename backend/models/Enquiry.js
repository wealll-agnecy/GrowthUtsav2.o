const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
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
        required: [true, 'Please provide your mobile number'],
        match: [/^\+?[0-9]{7,15}$/, 'Please provide a valid mobile number']
    },
    message: {
        type: String,
        required: [true, 'Please provide your message'],
        maxLength: [2000, 'Message cannot exceed 500 words or 2000 characters']
    },
    status: {
        type: String,
        enum: ['New', 'Read', 'Resolved'],
        default: 'New'
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Enquiry', enquirySchema);

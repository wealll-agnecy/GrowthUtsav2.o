const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add an event title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    bannerImage: {
        type: String,
        default: 'no-photo.jpg'
    },
    venue: {
        type: String,
        required: [true, 'Please add a venue']
    },
    date: {
        type: Date,
        required: [true, 'Please add an event date']
    },
    time: {
        type: String,
        required: [true, 'Please add an event time']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Seminar', 'Makeup Event', 'Carnival', 'Beauty Expo', 'Exhibition', 'Other']
    },
    ticketTypes: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            sold: { type: Number, default: 0 }
        }
    ],
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'live', 'completed'],
        default: 'pending'
    },
    organizer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    isMultiDay: {
        type: Boolean,
        default: false
    },
    multiDayPlan: [
        {
            date: { type: Date, required: true },
            plans: [
                {
                    name: { type: String, required: true }, // Silver, Gold, Platinum
                    price: { type: Number, required: true },
                    quantity: { type: Number, default: 100 },
                    sold: { type: Number, default: 0 }
                }
            ]
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', EventSchema);

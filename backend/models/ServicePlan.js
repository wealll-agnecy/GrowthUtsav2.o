const mongoose = require('mongoose');

const ServicePlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['Bronze', 'Silver', 'Gold']
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        default: 30 // days
    },
    features: [String],
    eventLimit: {
        type: Number,
        default: 5
    },
    supportLevel: {
        type: String,
        enum: ['Basic', 'Priority', 'Dedicated'],
        default: 'Basic'
    }
});

module.exports = mongoose.model('ServicePlan', ServicePlanSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['attendee', 'organizer', 'admin', 'staff'],
        default: 'attendee'
    },
    staffRole: {
        type: String,
        enum: ['gate staff', 'coordinator', 'support']
    },
    assignedEvents: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Event'
    }],
    status: {
        type: String,
        enum: ['pending', 'verified'],
        default: function() {
            return this.role === 'organizer' ? 'pending' : 'verified';
        }
    },
    // Organizer approval status — false until admin approves
    isApproved: {
        type: Boolean,
        default: true
    },
    isRejected: {
        type: Boolean,
        default: false
    },
    rejectionReason: {
        type: String
    },
    // Extra info organizer provides on registration
    organizationDetails: {
        companyName: String,
        registrationNumber: String,
        eventIntent: String,
        phone: String,
        website: String,
        logo: String,
        address: String,
        selectedEventTypes: [String]
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please add a valid phone number']
    },
    address: {
        type: String
    },
    avatar: {
        type: String,
        default: 'no-avatar.jpg'
    },
    servicePlan: {
        type: mongoose.Schema.ObjectId,
        ref: 'ServicePlan'
    },
    planExpiry: {
        type: Date
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    fcmToken: {
        type: String // Token for Firebase Cloud Messaging
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);

const User = require('../models/User');
const crypto = require('crypto');
const { sendTicketMail } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            message,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
};

// @desc    Register user
exports.register = async (req, res, next) => {
    let { name, email, phone, password, role, organizationDetails } = req.body;

    if (!phone || (typeof phone === 'string' && !phone.trim())) {
        phone = undefined;
    }

    try {
        const checkFields = [{ email }];
        if (phone) checkFields.push({ phone });

        const conflict = await User.findOne({ $or: checkFields });

        if (conflict) {
            const field = conflict.email === email ? 'Email' : 'Phone Number';
            return res.status(400).json({
                success: false,
                message: `This ${field} is already associated with an existing account.`
            });
        }

        if (typeof organizationDetails === 'string') {
            try { organizationDetails = JSON.parse(organizationDetails); } catch (e) {}
        }

        // Ensure registrationNumber is captured even if passed separately via FormData
        if (req.body.registrationNumber && organizationDetails) {
            organizationDetails.registrationNumber = req.body.registrationNumber;
        }

        if (req.file && role === 'organizer') {
            if (!organizationDetails) organizationDetails = {};
            organizationDetails.logo = `/uploads/logos/${req.file.filename}`;
        }

        const user = await User.create({
            name, email, phone, password, role, organizationDetails,
            isApproved: role === 'organizer' ? false : true,
            status: role === 'organizer' ? 'pending' : 'verified'
        });

        sendTokenResponse(user, 201, res, "Registered successfully");
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Login user
exports.login = async (req, res, next) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Please provide an email/phone and password' });
    }

    try {
        // PERMANENT FIX: Remove 'virtual-admin-1234' string ID logic.
        // If master admin credentials used, create/fetch real DB admin to ensure ObjectId consistency.
        if (identifier === "admin@growthu.com" && password === "GrowthUtsav2026") {
            let admin = await User.findOne({ email: identifier });
            if (!admin) {
                admin = await User.create({
                    name: "Primary Administrator",
                    email: identifier,
                    password: password,
                    role: 'admin',
                    status: 'verified'
                });
            }
            return sendTokenResponse(admin, 200, res, 'Admin authenticated via master override.');
        }

        const user = await User.findOne({ 
            $or: [{ email: identifier }, { phone: identifier }] 
        }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Identity not recognized.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Access Denied: Invalid security signature.' });
        }

        sendTokenResponse(user, 200, res, 'Login successful');
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Admin Stealth Login
exports.adminLogin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        // ENFORCED OBJECTID LOGIC: No more virtual strings.
        if (email === "admin@growthu.com" && password === "GrowthUtsav2026") {
            let admin = await User.findOne({ email });
            if (!admin) {
                admin = await User.create({
                    name: "Administrator",
                    email: email,
                    password: password,
                    role: 'admin',
                    status: 'verified'
                });
            }
            return sendTokenResponse(admin, 200, res);
        }

        const user = await User.findOne({ email, role: 'admin' }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized Gateway.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid Credentials.' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Log user out
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.status(200).json({ success: true, data: {} });
};

// @desc    Get current logged in user
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).lean();
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update FCM Token
// @route   PATCH /api/v1/auth/fcm-token
// @access  Private
exports.updateFcmToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) return res.status(400).json({ success: false, message: 'FCM Token is required' });

        await User.findByIdAndUpdate(req.user.id, { fcmToken });

        res.status(200).json({ success: true, message: 'FCM Token updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
    try {
        const { name, email, phone, address } = req.body;

        // Check if email already exists for another user
        if (email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existingEmail) {
                return res.status(400).json({ success: false, message: 'This email is already linked to another account.' });
            }
        }

        // Check if phone already exists for another user
        if (phone) {
            const existingPhone = await User.findOne({ phone, _id: { $ne: req.user.id } });
            if (existingPhone) {
                return res.status(400).json({ success: false, message: 'This phone number is already linked to another account.' });
            }
        }

        const fieldsToUpdate = { name, email, phone, address };

        if (req.file) {
            fieldsToUpdate.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Identity updated successfully',
            data: user
        });
    } catch (err) {
        console.error("[PROFILE_UPDATE_ERROR]:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Forgot password
exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) { return res.status(404).json({ success: false, message: 'User not found' }); }
    
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const message = `<h1>Reset Password</h1><p>Reset link: <a href="${resetUrl}">${resetUrl}</a></p>`;

    try {
        await sendTicketMail({ to: user.email, subject: 'Password Reset', html: message });
        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ success: false, message: 'Email failed' });
    }
};

// @desc    Reset password
exports.resetPassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) { return res.status(400).json({ success: false, message: 'Invalid token' }); }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
};

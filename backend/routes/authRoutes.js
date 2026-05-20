const express = require('express');
const rateLimit = require('express-rate-limit');
const {
    register,
    login,
    adminLogin,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    updateFcmToken,
    getFirebaseCustomToken,
    updateDetails
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const isLoopbackRequest = (req) => {
    const remoteAddress = req.socket?.remoteAddress || req.ip || '';

    return [remoteAddress].some(value =>
        value.includes('localhost') ||
        value.includes('127.0.0.1') ||
        value.includes('::1') ||
        value.includes('::ffff:127.0.0.1')
    );
};

// Targeted Rate Limiter to prevent brute-forcing sensitive auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts
    skip: (req) => process.env.NODE_ENV !== 'production' || isLoopbackRequest(req),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes'
    }
});

// Auth routes (Rate limited to secure credentials)
router.post('/register', authLimiter, upload.single('logo'), register);
router.post('/login', authLimiter, login);
router.post('/admin-login', authLimiter, adminLogin);
router.post('/forgotpassword', authLimiter, forgotPassword);

// Session and general routes (Exempt from strict rate limits to guarantee stability)
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.get('/firebase-token', protect, getFirebaseCustomToken);
router.patch('/fcm-token', protect, updateFcmToken);
router.put('/updatedetails', protect, upload.single('avatar'), updateDetails);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;

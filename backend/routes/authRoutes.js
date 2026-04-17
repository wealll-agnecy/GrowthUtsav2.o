const express = require('express');
const {
    register,
    login,
    adminLogin,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    updateFcmToken
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Auth routes
router.post('/register', upload.single('logo'), register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/fcm-token', protect, updateFcmToken);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;

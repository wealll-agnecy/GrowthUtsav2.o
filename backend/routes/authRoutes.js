const express = require('express');
const {
    register,
    login,
    adminLogin,
    logout,
    getMe,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
    getNotifications,
    markAsRead
} = require('../controllers/notificationController');

router.post('/register', upload.single('logo'), register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markAsRead);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);



module.exports = router;

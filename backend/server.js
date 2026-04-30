const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const automationRoutes = require('./routes/automationRoutes');
const servicePlanRoutes = require('./routes/servicePlanRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const { protect } = require('./middleware/authMiddleware');
const adminRoutes = require('./routes/adminRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const path = require('path');

const initScheduler = require('./utils/scheduler');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { initSocket } = require('./utils/socket');
const { initFirebase } = require('./utils/firebase');
const http = require('http');

// Initialize Notification Queue Worker
require('./queue/notificationQueue');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Initialize Firebase
initFirebase();

// Set security HTTP headers
app.set('trust proxy', 1); // trust first proxy
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // increased for dev
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

app.use((req, res, next) => {
    console.log(`📡 [REQUEST]: ${req.method} ${req.path}`);
    next();
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser());

app.use(cors({
    origin: true,
    credentials: true
}));

const { updateLiveStatus } = require('./controllers/eventController');

// ── EMERGENCY LIVE TOGGLE ROUTES (MOUNTED BEFORE ROUTERS) ──
app.put('/api/v1/event-live/:id', protect, updateLiveStatus);
app.put('/api/v1/events/set-live/:id', protect, updateLiveStatus);
app.put('/api/v1/events/:id/live', protect, updateLiveStatus);

console.log("🚀 Mounting routers...");
app.use('/api/v1/enquiries', enquiryRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/automation', automationRoutes);
app.use('/api/v1/plans', servicePlanRoutes);
app.use('/api/v1/logistics', logisticsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/organizer', organizerRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/notifications', notificationRoutes);

const { downloadTicket, verifyTicketForScanner } = require('./controllers/ticketController');
app.get('/api/ticket/download/:id', protect, downloadTicket);
app.get('/api/ticket/verify/:id', verifyTicketForScanner);

// --- SMTP TEST ROUTE ---
app.get("/test-mail", async (req, res) => {
    try {
        const { sendTicketMail } = require('./utils/sendEmail');
        const info = await sendTicketMail({
            to: "gp775843@gmail.com",
            subject: "SMTP TEST",
            html: "<b>Your SMTP is working perfectly</b>",
        });

        res.send("MAIL SENT SUCCESSFULLY TO gp775843@gmail.com. Check your inbox!");
    } catch (err) {
        console.error("❌ TEST MAIL FAILED:", err);
        res.status(500).send("MAIL FAILED: " + err.message);
    }
});

app.use((req, res, next) => {
    console.log(`❌ [404 ERROR]: ${req.method} ${req.originalUrl} - No route matched`);
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found on this server`
    });
});

app.use((err, req, res, next) => {
    console.error("🚨 GLOBAL SERVER ERROR:", err.message);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

initScheduler();

console.log("✅ Event Routes Loaded:", eventRoutes.stack.filter(r => r.route).map(r => `${Object.keys(r.route.methods)} ${r.route.path}`));
console.log("✅ Booking Routes Loaded:", bookingRoutes.stack.filter(r => r.route).map(r => `${Object.keys(r.route.methods)} ${r.route.path}`));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 [SERVER LIVE] [PORT: ${PORT}]`);
});

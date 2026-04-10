const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

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
const adminRoutes = require('./routes/adminRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const path = require('path');

const initScheduler = require('./utils/scheduler');

const app = express();

// Trust reverse proxy (needed for req.protocol accuracy on Heroku/Vercel/DigitalOcean)
app.set('trust proxy', true);

// DEBUG LOGGER
app.use((req, res, next) => {
    console.log(`📡 [REQUEST]: ${req.method} ${req.path}`);
    next();
});

// Body parser
app.use(express.json());

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
    origin: true, // Allow all origins for debugging
    credentials: true
}));

// Mount routers
console.log("🚀 Mounting routers...");
app.use('/api/v1/bookings', bookingRoutes);
console.log("✅ Bookings mounted");
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

// Specific ticket routes
const { downloadTicket, verifyTicketForScanner } = require('./controllers/ticketController');
const { protect } = require('./middleware/authMiddleware');
app.get('/api/ticket/download/:id', protect, downloadTicket);
app.get('/api/ticket/verify/:id', verifyTicketForScanner); // Public for scanner page




// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🚨 GLOBAL SERVER ERROR:", err.message);
    console.error("PATH:", req.path);
    console.error("STACK:", err.stack);
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start scheduler
initScheduler();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in mode on port ${PORT}`);
});

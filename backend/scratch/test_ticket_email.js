const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Event = require('../models/Event'); // Register Event model
const { generateTicketPDF } = require('../services/pdfService');
const { sendBookingConfirmation } = require('../services/emailService');

dotenv.config();

async function testDelivery() {
    try {
        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");

        // 1. Find a sample ticket (most recent)
        const ticket = await Ticket.findOne().sort({ createdAt: -1 }).populate('event booking user');
        
        if (!ticket) {
            console.log("❌ No tickets found in database. Please book a ticket first.");
            process.exit(1);
        }

        console.log(`🎫 Found Ticket: ${ticket.ticketCode} for event ${ticket.event.title}`);
        console.log(`👤 Attendee: ${ticket.name} (${ticket.email})`);

        // 2. Generate PDF
        console.log("📄 Generating PDF buffer...");
        const pdfBuffer = await generateTicketPDF(ticket._id);
        console.log("✅ PDF Generated successfully.");

        // 3. Send Email
        console.log(`📩 Dispatching email to ${ticket.user.email}...`);
        await sendBookingConfirmation(ticket.user, ticket.event, pdfBuffer, {
            ticketType: ticket.ticketType,
            quantity: ticket.booking?.quantity || 1,
            totalAmount: ticket.totalAmount,
            ticketId: ticket._id
        });
        console.log("✅ Email dispatch sequence completed.");

    } catch (err) {
        console.error("🚨 Test failed:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from DB.");
    }
}

testDelivery();

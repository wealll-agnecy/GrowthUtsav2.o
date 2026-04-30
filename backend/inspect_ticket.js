const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const Booking = require('./models/Booking');
require('dotenv').config();

async function checkTicket() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/GU');
        console.log("Connected to DB");

        const ticketId = '69eb0e500377973c77fb8231';
        const ticket = await Ticket.findById(ticketId).populate('booking');
        
        if (!ticket) {
            console.log("Ticket not found");
            return;
        }

        console.log("--- TICKET DATA ---");
        console.log("ID:", ticket._id);
        console.log("Amount Paid (Ticket):", ticket.amountPaid);
        console.log("Total Amount (Ticket):", ticket.totalAmount);
        console.log("Payment Status (Ticket):", ticket.paymentStatus);
        
        if (ticket.booking) {
            console.log("--- BOOKING DATA ---");
            console.log("ID:", ticket.booking._id);
            console.log("Amount Paid (Booking):", ticket.booking.amountPaid);
            console.log("Total Amount (Booking):", ticket.booking.totalAmount);
            console.log("Payment Status (Booking):", ticket.booking.paymentStatus);
            console.log("Payments Array:", JSON.stringify(ticket.booking.payments, null, 2));
        } else {
            console.log("No booking linked to this ticket.");
        }

        // Fix the data for the user
        console.log("\n--- APPLYING FIX ---");
        if (ticket.booking) {
            ticket.booking.amountPaid = 330;
            ticket.booking.paymentStatus = 'partial';
            await ticket.booking.save();
            console.log("Updated Booking amountPaid to 330");
        }
        ticket.amountPaid = 330;
        ticket.paymentStatus = 'PARTIAL';
        await ticket.save();
        console.log("Updated Ticket amountPaid to 330");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkTicket();

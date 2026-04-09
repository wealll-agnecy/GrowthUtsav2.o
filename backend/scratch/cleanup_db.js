const mongoose = require('mongoose');

// Path correction for relative requires
const Ticket = require('../models/Ticket');
const Counter = require('../models/Counter');

/**
 * DB CLEANUP SCRIPT
 * Run this to fix the "E11000 duplicate key error: ticketCode_1" issue.
 */
async function cleanupDatabase() {
    try {
        // Connect to your local MongoDB
        await mongoose.connect('mongodb://localhost:27017/growth_utsav');
        console.log("🛠️ Starting Database Recovery...");

        // 1. Remove all tickets with corrupted identifiers
        const deleteCount = await Ticket.deleteMany({ 
            $or: [
                { ticketId: null },
                { ticketCode: null },
                { ticketCode: { $exists: false } }
            ] 
        });
        console.log(`✅ Cleaned up ${deleteCount.deletedCount} corrupted ticket records.`);

        // 2. Drop the problematic old index
        try {
            await Ticket.collection.dropIndex('ticketCode_1');
            console.log("✅ Successfully dropped stale index: ticketCode_1");
        } catch (err) {
            console.log("ℹ️ Index ticketCode_1 not found or already dropped.");
        }

        console.log("🚀 Database is now clean and ready for production logic.");
        process.exit(0);
    } catch (err) {
        console.error("🚨 Cleanup Failed:", err.message);
        process.exit(1);
    }
}

cleanupDatabase();

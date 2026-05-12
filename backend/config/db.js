const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, 
            socketTimeoutMS: 45000,
            family: 4 // Force IPv4 to avoid slow DNS lookups in production
        });
        console.log(`✅ [DATABASE CONNECTED]: ${conn.connection.host} / ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ [DATABASE ERROR]: ${error.message}`);
        // Do not process.exit(1) here in production to allow the server to keep trying
    }
};

module.exports = connectDB;

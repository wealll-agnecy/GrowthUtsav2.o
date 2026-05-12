const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000,
            family: 4,
            autoIndex: true, // Build indexes
        });
        console.log(`✅ [DATABASE CONNECTED]: ${conn.connection.host} / ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ [DATABASE ERROR]: ${error.message}`);
    }
};

module.exports = connectDB;

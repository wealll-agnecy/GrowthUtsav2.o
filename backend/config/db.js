const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, 
            socketTimeoutMS: 45000,
        });
        console.log(`✅ [DATABASE CONNECTED]: ${conn.connection.host} / ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ [DATABASE ERROR]: ${error.message}`);
        if (error.message.includes('SSL') || error.message.includes('alert number 80')) {
            console.error('💡 [TIP]: This is likely an IP Whitelist issue. Please add your current IP to MongoDB Atlas Network Access.');
        }
        process.exit(1);
    }
};

module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 1000, // Enterprise scaling connection pool
            minPoolSize: 10,
            autoIndex: true, // Auto-build missing indexes for maximum query performance
        });
        console.log(`✅ [DATABASE CONNECTED]: ${conn.connection.host} / ${conn.connection.name}`);
        
        // Robust Production Event Listeners
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ [DATABASE] Disconnected! Attempting to automatically reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ [DATABASE] Successfully Reconnected!');
        });

        mongoose.connection.on('error', (err) => {
            console.error(`❌ [DATABASE ERROR]: ${err.message}`);
        });

    } catch (error) {
        console.error(`❌ [DATABASE CRASH]: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

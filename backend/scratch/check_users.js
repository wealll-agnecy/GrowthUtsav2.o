const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env from the backend folder specifically
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const checkUsers = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing from .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        const count = await User.countDocuments();
        console.log(`Total Users in DB: ${count}`);
        
        const admin = await User.findOne({ role: 'admin' });
        console.log(`Admin exists: ${!!admin}`);
        if (admin) {
            console.log(`Admin email: ${admin.email}`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err.message);
        process.exit(1);
    }
};

checkUsers();

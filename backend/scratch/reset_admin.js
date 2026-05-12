const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const email = 'admin@growthutsav.com';
        const newPassword = 'GrowthUtsav2026';
        
        let user = await User.findOne({ email });
        if (!user) {
            console.log('User not found, creating...');
            user = await User.create({
                name: 'Administrator',
                email,
                password: newPassword,
                role: 'admin',
                status: 'verified'
            });
        } else {
            console.log('User found, updating password...');
            user.password = newPassword;
            await user.save();
        }
        
        console.log('Admin password reset successfully for:', email);
        process.exit(0);
    } catch (err) {
        console.error('Reset failed:', err.message);
        process.exit(1);
    }
};

resetAdmin();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminEmail = 'admin@growthutsav.com';
        let admin = await User.findOne({ email: adminEmail });
        
        if (!admin) {
            admin = await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'adminpassword123',
                role: 'admin'
            });
            console.log('SUCCESS: Admin user created!');
        } else {
            console.log('SUCCESS: Admin user already exists!');
        }
        
        console.log('--- CREDENTIALS ---');
        console.log('Email:', adminEmail);
        console.log('Password: adminpassword123');
        console.log('-------------------');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();

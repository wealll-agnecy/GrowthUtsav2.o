const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const testDB = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected Successfully');
        process.exit(0);
    } catch (err) {
        console.error('DB Connection Failed:', err.message);
        process.exit(1);
    }
};

testDB();

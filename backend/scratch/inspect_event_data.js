const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkEvent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const event = await db.collection('events').findOne({});
        console.log('--- Sample Event ---');
        console.log(JSON.stringify(event, null, 2));
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

checkEvent();

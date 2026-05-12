const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to: ${process.env.MONGO_URI}`);
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log('\n--- Collection Stats ---');
        for (let col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`${col.name}: ${count} documents`);
        }
        
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

checkData();

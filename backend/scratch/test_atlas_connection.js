const mongoose = require('mongoose');
const ATLAS_URI = 'mongodb+srv://weallldevelopment_db_user:Growthutsav%402026@cluster0.vze4a3q.mongodb.net/Growthutsav?retryWrites=true&w=majority&appName=gu2026';

const testAtlas = async () => {
    console.log('📡 [TEST]: Attempting to connect to MongoDB Atlas...');
    try {
        await mongoose.connect(ATLAS_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ [SUCCESS]: Connected to MongoDB Atlas successfully!');
        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ [FAILED]: Could not connect to MongoDB Atlas.');
        console.error('Reason:', err.message);
        if (err.message.includes('IP') || err.message.includes('whitelist') || err.message.includes('alert number 80')) {
            console.log('💡 [TIP]: This is definitely an IP Whitelist issue. You need to add your current IP to MongoDB Atlas Network Access.');
        }
    }
};

testAtlas();

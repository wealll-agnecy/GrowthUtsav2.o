const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { initFirebase } = require('../utils/firebase');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkSystem() {
    console.log('--- 🛡️ GROWTH UTSAV SYSTEM DIAGNOSTIC ---');
    
    // 1. Check DB
    console.log('\n📡 [1/3] Checking MongoDB Atlas...');
    const dbNames = ['growth_utsav', 'Growthutsav', 'test', 'admin'];
    let success = false;

    for (const dbName of dbNames) {
        const testUri = process.env.MONGO_URI.replace(/\/([^/?]+)\?/, `/${dbName}?`);
        try {
            console.log(`🔍 Trying Database: "${dbName}"...`);
            const conn = await mongoose.connect(testUri, { serverSelectionTimeoutMS: 3000 });
            console.log(`✅ SUCCESS! Found active database: "${dbName}"`);
            console.log(`💡 UPDATE YOUR .env: MONGO_URI should end in "/${dbName}?..."`);
            await mongoose.connection.close();
            success = true;
            break;
        } catch (err) {
            console.log(`❌ Failed for "${dbName}"`);
        }
    }

    if (!success) {
        console.error('❌ ALL DATABASE ATTEMPTS FAILED');
        console.log('💡 CHECK: Is your Username/Password correct in .env?');
    }

    // 2. Check Firebase
    console.log('\n🔥 [2/3] Checking Firebase Admin...');
    try {
        const firebase = initFirebase();
        if (firebase) {
            console.log('✅ FIREBASE: INITIALIZED SUCCESSFULLY');
        } else {
            console.log('⚠️ FIREBASE: INITIALIZATION SKIPPED (No credentials)');
        }
    } catch (err) {
        console.error('❌ FIREBASE: FAILED');
        console.error('   REASON:', err.message);
    }

    // 3. Check Environment
    console.log('\n⚙️ [3/3] Checking Environment...');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   PORT:', process.env.PORT);
    console.log('   FRONTEND_URL:', process.env.FRONTEND_URL);

    console.log('\n--- DIAGNOSTIC COMPLETE ---');
    process.exit(0);
}

checkSystem();

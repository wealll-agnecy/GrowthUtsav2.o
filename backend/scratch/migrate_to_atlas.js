const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const LOCAL_URI = 'mongodb://localhost:27017/growth_utsav';
const ATLAS_URI = 'mongodb+srv://weallldevelopment_db_user:Growthutsav%402026@cluster0.vze4a3q.mongodb.net/Growthutsav?retryWrites=true&w=majority&appName=gu2026';

const migrate = async () => {
    try {
        console.log('🔌 Connecting to LOCAL database...');
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('✅ Local Connected.');

        console.log('🔌 Connecting to ATLAS database...');
        const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log('✅ Atlas Connected.');

        const collections = await localConn.db.listCollections().toArray();
        
        for (let col of collections) {
            const name = col.name;
            if (name === 'system.indexes') continue;

            console.log(`\n📦 Migrating collection: ${name}...`);
            const data = await localConn.db.collection(name).find({}).toArray();
            
            if (data.length > 0) {
                // Clear existing data in Atlas for this collection to avoid duplicates
                await atlasConn.db.collection(name).deleteMany({});
                // Insert new data
                await atlasConn.db.collection(name).insertMany(data);
                console.log(`✅ Successfully moved ${data.length} documents.`);
            } else {
                console.log(`ℹ️ Collection is empty, skipping.`);
            }
        }

        console.log('\n✨ ALL DATA MIGRATED SUCCESSFULLY! ✨');
        
        await localConn.close();
        await atlasConn.close();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ MIGRATION FAILED:', err.message);
        process.exit(1);
    }
};

migrate();

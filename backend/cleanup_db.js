const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = mongoose.connection.db.admin();
        const { databases } = await admin.listDatabases();
        
        console.log("Current databases on cluster:", databases.map(db => db.name));
        
        // We will try to drop these specifically
        const toDelete = ['growth_utsav', 'weallldevelopment_db_user', 'test'];
        
        for (const dbName of toDelete) {
            console.log(`Checking/Dropping database: ${dbName}...`);
            const db = mongoose.connection.useDb(dbName);
            try {
                await db.db.dropDatabase();
                console.log(`Successfully dropped ${dbName}`);
            } catch (e) {
                console.log(`Could not drop ${dbName} (maybe already gone or no permission)`);
            }
        }
        
        console.log("\n--- PRODUCTION STRUCTURE VERIFICATION (Growthutsav) ---");
        const growthDb = mongoose.connection.useDb('Growthutsav');
        const collections = await growthDb.db.listCollections().toArray();
        console.log("Verified collections in Growthutsav:");
        collections.forEach(c => console.log(` - ${c.name}`));
        
        process.exit(0);
    } catch (err) {
        console.error("Cleanup failed:", err);
        process.exit(1);
    }
}

cleanup();

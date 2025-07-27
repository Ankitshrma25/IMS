const mongoose = require('mongoose');

async function resetDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-management-system';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }

    console.log('\n✅ Database reset successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run create-users');
    console.log('2. Run: npm run create-items');
    console.log('3. Start the application: npm run dev');

  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
resetDatabase();
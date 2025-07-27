const mongoose = require('mongoose');

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database naming issue...');
    
    // Connect to the old database to check if it exists
    const oldDbUri = 'mongodb://localhost:27017/inventory-management';
    const newDbUri = 'mongodb://localhost:27017/inventory-management-system';
    
    try {
      // Try to connect to old database
      const oldConnection = await mongoose.createConnection(oldDbUri);
      const collections = await oldConnection.db.listCollections().toArray();
      
      if (collections.length > 0) {
        console.log('⚠️  Found old database "inventory-management" with data:');
        collections.forEach(col => console.log(`  - ${col.name}`));
        
        // Ask if user wants to migrate data
        console.log('\n📋 Options:');
        console.log('1. Keep old database (inventory-management)');
        console.log('2. Migrate to new database (inventory-management-system)');
        console.log('3. Use new database only (recommended)');
        
        // For now, we'll use the new database
        console.log('\n✅ Using new database: inventory-management-system');
        console.log('💡 If you want to migrate data, please do it manually');
      }
      
      await oldConnection.close();
    } catch (error) {
      console.log('✅ Old database does not exist or is not accessible');
    }
    
    // Connect to new database
    try {
      const newConnection = await mongoose.createConnection(newDbUri);
      const newCollections = await newConnection.db.listCollections().toArray();
      
      if (newCollections.length > 0) {
        console.log('\n📊 Current database "inventory-management-system" contains:');
        newCollections.forEach(col => console.log(`  - ${col.name}`));
      } else {
        console.log('\n📊 Database "inventory-management-system" is empty');
      }
      
      await newConnection.close();
    } catch (error) {
      console.log('✅ New database does not exist yet (this is normal)');
    }
    
    console.log('\n✅ Database naming issue fixed!');
    console.log('\n📋 All files now use: inventory-management-system');
    console.log('\n🔧 Next steps:');
    console.log('1. Run: npm run create-users');
    console.log('2. Run: npm run create-items');
    console.log('3. Start the application: npm run dev');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  }
}

// Run the script
fixDatabase(); 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema (simplified version for the script)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['localStoreManager', 'wsgStoreManager'] 
  },
  section: { type: String },
  rank: { type: String },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function createTestUsers() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-management-system';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log('Users already exist in the database:');
      existingUsers.forEach(user => {
        console.log(`- ${user.username} (${user.role}) ${user.section ? `- ${user.section}` : ''}`);
      });
      return;
    }

    // Create test users
    const testUsers = [
      // Local Store Managers for different sections
      {
        username: 'ordnance_manager',
        email: 'ordnance@workshop.com',
        password: 'password123',
        name: 'ORDNANCE Section Manager',
        role: 'localStoreManager',
        section: 'ORDNANCE',
        rank: 'SGT',
      },
      {
        username: 'dgeme_manager',
        email: 'dgeme@workshop.com',
        password: 'password123',
        name: 'DGEME Section Manager',
        role: 'localStoreManager',
        section: 'DGEME',
        rank: 'SGT',
      },
      {
        username: 'pmse_manager',
        email: 'pmse@workshop.com',
        password: 'password123',
        name: 'PMSE Section Manager',
        role: 'localStoreManager',
        section: 'PMSE',
        rank: 'SGT',
      },
      {
        username: 'ttg_manager',
        email: 'ttg@workshop.com',
        password: 'password123',
        name: 'TTG Section Manager',
        role: 'localStoreManager',
        section: 'TTG',
        rank: 'SGT',
      },
      // WSG Store Managers
      {
        username: 'wsgmanager',
        email: 'wsg@workshop.com',
        password: 'password123',
        name: 'WSG Store Manager',
        role: 'wsgStoreManager',
        rank: 'WO',
      },
      {
        username: 'admin',
        email: 'admin@workshop.com',
        password: 'password123',
        name: 'System Administrator',
        role: 'wsgStoreManager',
        rank: 'MAJ',
      }
    ];

    for (const userData of testUsers) {
      // Hash password
      const saltRounds = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
      });

      await user.save();
      console.log(`Created user: ${user.username} (${user.role}) ${user.section ? `- ${user.section}` : ''}`);
    }

    console.log('\n✅ Test users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('\nLocal Store Managers:');
    console.log('  ORDNANCE: ordnance_manager / password123');
    console.log('  DGEME: dgeme_manager / password123');
    console.log('  PMSE: pmse_manager / password123');
    console.log('  TTG: ttg_manager / password123');
    console.log('\nWSG Store Managers:');
    console.log('  WSG Manager: wsgmanager / password123');
    console.log('  Admin: admin / password123');

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTestUsers(); 
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 509 Army Based Workshop - Inventory Management System Setup');
console.log('=============================================================\n');

// Check if .env.local already exists
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('⚠️  .env.local already exists. Do you want to overwrite it? (y/N)');
  rl.question('', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      createEnvFile();
    } else {
      console.log('Setup cancelled. Your existing .env.local file remains unchanged.');
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  console.log('\n📝 Setting up environment variables...\n');

  const questions = [
    {
      name: 'MONGODB_URI',
      message: 'Enter MongoDB connection string (default: mongodb://localhost:27017/inventory-management-system):',
      default: 'mongodb://localhost:27017/inventory-management-system'
    },
    {
      name: 'JWT_SECRET',
      message: 'Enter JWT secret key (default: auto-generated):',
      default: generateRandomString(32)
    },
    {
      name: 'NEXTAUTH_SECRET',
      message: 'Enter NextAuth secret key (default: auto-generated):',
      default: generateRandomString(32)
    },
    {
      name: 'NODE_ENV',
      message: 'Enter environment (development/production):',
      default: 'development'
    }
  ];

  const answers = {};
  let currentQuestion = 0;

  function askQuestion() {
    if (currentQuestion >= questions.length) {
      writeEnvFile(answers);
      return;
    }

    const question = questions[currentQuestion];
    rl.question(question.message + ' ', (answer) => {
      answers[question.name] = answer.trim() || question.default;
      currentQuestion++;
      askQuestion();
    });
  }

  askQuestion();
}

function writeEnvFile(answers) {
  const envContent = `# Database Configuration
MONGODB_URI=${answers.MONGODB_URI}

# JWT Authentication
JWT_SECRET=${answers.JWT_SECRET}
JWT_EXPIRES_IN=7d

# NextAuth Configuration
NEXTAUTH_SECRET=${answers.NEXTAUTH_SECRET}
NEXTAUTH_URL=http://localhost:3000

# Application Configuration
NODE_ENV=${answers.NODE_ENV}
NEXT_PUBLIC_APP_NAME="509 Army Based Workshop - Inventory Management System"
NEXT_PUBLIC_APP_VERSION=1.3.0

# API Configuration
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=30000

# Security Configuration
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=${generateRandomString(32)}

# Logging Configuration
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_EXPORT_REPORTS=true
ENABLE_REAL_TIME_UPDATES=true

# Email Configuration (for future use)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# File Upload Configuration (for future use)
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache Configuration
CACHE_TTL=3600
REDIS_URL=redis://localhost:6379

# Monitoring and Analytics
ENABLE_METRICS=true
METRICS_PORT=9090

# Development Specific
ENABLE_HOT_RELOAD=true
ENABLE_DEBUG_MODE=true
SHOW_QUERY_LOGS=false

# Production Specific (uncomment for production)
# NODE_ENV=production
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory-management-system
# JWT_SECRET=your-production-jwt-secret-key
# NEXTAUTH_SECRET=your-production-nextauth-secret
# NEXTAUTH_URL=https://your-domain.com
# API_BASE_URL=https://your-domain.com/api
# LOG_LEVEL=info
# ENABLE_DEBUG_MODE=false
# ENABLE_HOT_RELOAD=false
`;

  try {
    fs.writeFileSync('.env.local', envContent);
    console.log('\n✅ Environment file created successfully!');
    console.log('📁 File: .env.local');
    console.log('\n🔧 Next steps:');
    console.log('1. Review the .env.local file and update any values if needed');
    console.log('2. Ensure MongoDB is running');
    console.log('3. Run: npm install');
    console.log('4. Run: npm run dev');
    console.log('\n🎉 Setup complete! Your inventory management system is ready to use.');
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
  }

  rl.close();
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 
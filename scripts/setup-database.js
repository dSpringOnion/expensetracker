#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up permanent database for Expense Tracker...\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

console.log('📋 Database Setup Options:');
console.log('1. 🆓 Neon (Free tier: 10GB, great for production)');
console.log('2. 🆓 Supabase (Free tier: 500MB, includes auth)');
console.log('3. 🆓 Railway PostgreSQL (Free tier: 100 hours/month)');
console.log('4. 🔧 Custom PostgreSQL connection string');
console.log('5. 🏠 Local PostgreSQL (if you have it installed)\n');

console.log('📝 Instructions:');
console.log('Choose one of the options above and follow these steps:\n');

console.log('🔗 Option 1 - Neon (Recommended):');
console.log('1. Go to https://neon.tech');
console.log('2. Sign up/login and create a new project');
console.log('3. Copy the connection string from the dashboard');
console.log('4. Run: npm run db:setup\n');

console.log('🔗 Option 2 - Supabase:');
console.log('1. Go to https://supabase.com');
console.log('2. Create a new project');
console.log('3. Go to Settings > Database');
console.log('4. Copy the connection string (make sure to replace [YOUR-PASSWORD])');
console.log('5. Run: npm run db:setup\n');

console.log('🚂 Option 3 - Railway:');
console.log('1. Deploy this app to Railway');
console.log('2. Add a PostgreSQL service');
console.log('3. Copy the DATABASE_URL from the service');
console.log('4. Run: npm run db:setup\n');

console.log('💡 Next steps after getting your connection string:');
console.log('1. Update your .env file with DATABASE_URL="your-connection-string"');
console.log('2. Run: npm run db:migrate');
console.log('3. Your data will now persist permanently! 🎉');
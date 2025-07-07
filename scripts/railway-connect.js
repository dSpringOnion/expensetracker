#!/usr/bin/env node

console.log('🚂 Railway Connection Helper\n');

console.log('📋 You provided an INTERNAL Railway URL, but need the PUBLIC URL for local development.\n');

console.log('🔗 To get the correct PUBLIC connection string:');
console.log('1. Go to https://railway.app/dashboard');
console.log('2. Click on your expense tracker project');
console.log('3. Click on the PostgreSQL service');
console.log('4. Go to the "Connect" tab');
console.log('5. Copy the "Public Network" connection string\n');

console.log('🎯 The public URL will look like:');
console.log('postgresql://postgres:FWEcBaHDnEzyoVZvZxXYuUtJTesrwHOt@roundhouse.proxy.rlwy.net:12345/railway\n');

console.log('⚙️  Alternative - Use Railway CLI:');
console.log('1. railway login');
console.log('2. railway link (select your project)');
console.log('3. railway run npm run db:push\n');

console.log('📝 Current internal URL (won\'t work locally):');
console.log('postgresql://postgres:FWEcBaHDnEzyoVZvZxXYuUtJTesrwHOt@postgres-mswh.railway.internal:5432/railway\n');

console.log('💡 Once you have the public URL:');
console.log('1. Update your .env file with the public URL');
console.log('2. Run: npm run db:push');
console.log('3. Run: npm run db:seed (optional sample data)');
console.log('4. Your permanent database is ready! 🎉');
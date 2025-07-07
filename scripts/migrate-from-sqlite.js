#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const path = require('path');

async function migrateSQLiteData() {
  console.log('🔄 Migrating data from SQLite to PostgreSQL...\n');

  // Check if SQLite database exists
  const sqlitePath = path.join(process.cwd(), 'prisma', 'dev.db');
  const fs = require('fs');
  
  if (!fs.existsSync(sqlitePath)) {
    console.log('ℹ️  No SQLite database found. Starting fresh with PostgreSQL.');
    return;
  }

  try {
    // Connect to SQLite
    const sqlitePrisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${sqlitePath}`
        }
      }
    });

    // Connect to PostgreSQL
    const postgresPrisma = new PrismaClient();

    console.log('📊 Reading data from SQLite...');
    const users = await sqlitePrisma.user.findMany({
      include: {
        expenses: true
      }
    });

    if (users.length === 0) {
      console.log('ℹ️  No data found in SQLite database.');
      return;
    }

    console.log(`📦 Found ${users.length} users with expenses. Migrating...`);

    for (const user of users) {
      // Create user in PostgreSQL
      const newUser = await postgresPrisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });

      // Create expenses for the user
      for (const expense of user.expenses) {
        await postgresPrisma.expense.create({
          data: {
            id: expense.id,
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            description: expense.description,
            date: expense.date,
            receiptUrl: expense.receiptUrl,
            userId: expense.userId,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt
          }
        });
      }

      console.log(`✅ Migrated user: ${user.email} with ${user.expenses.length} expenses`);
    }

    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();

    console.log('\n🎉 Migration completed successfully!');
    console.log('💡 You can now delete the SQLite database file if you want.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your PostgreSQL database is accessible');
    console.log('2. Check your DATABASE_URL in .env');
    console.log('3. Run: npm run db:push to create tables first');
  }
}

migrateSQLiteData();
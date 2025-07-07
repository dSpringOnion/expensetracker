#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...\n');

  try {
    // Create a demo user
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@expensetracker.com' },
      update: {},
      create: {
        id: 'user_1', // This matches the hardcoded ID in the API
        email: 'demo@expensetracker.com',
        name: 'Demo User'
      }
    });

    console.log('✅ Created demo user:', demoUser.email);

    // Create sample expenses
    const sampleExpenses = [
      {
        title: 'Coffee at Starbucks',
        amount: 4.99,
        category: 'Food & Dining',
        description: 'Morning coffee before work',
        date: new Date('2024-01-15'),
        userId: demoUser.id
      },
      {
        title: 'Uber ride to airport',
        amount: 25.50,
        category: 'Transportation',
        description: 'Trip to catch flight',
        date: new Date('2024-01-14'),
        userId: demoUser.id
      },
      {
        title: 'Grocery shopping',
        amount: 87.32,
        category: 'Food & Dining',
        description: 'Weekly grocery run at Whole Foods',
        date: new Date('2024-01-13'),
        userId: demoUser.id
      },
      {
        title: 'Netflix subscription',
        amount: 15.99,
        category: 'Entertainment',
        description: 'Monthly streaming service',
        date: new Date('2024-01-12'),
        userId: demoUser.id
      },
      {
        title: 'Gas station fill-up',
        amount: 45.20,
        category: 'Transportation',
        description: 'Weekly gas for commuting',
        date: new Date('2024-01-11'),
        userId: demoUser.id
      }
    ];

    for (const expense of sampleExpenses) {
      const created = await prisma.expense.create({
        data: expense
      });
      console.log(`✅ Created expense: ${created.title} - $${created.amount}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('💡 You can now visit your app and see sample expenses.');
    console.log('🗑️  To clear sample data later, run: npm run db:reset');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your database is accessible');
    console.log('2. Check your DATABASE_URL in .env');
    console.log('3. Run: npm run db:push to create tables first');
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
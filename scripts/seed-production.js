#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mock data configuration
const VENDORS = [
  'Amazon Business', 'Staples', 'Home Depot', 'Walmart', 'Target', 'Best Buy',
  'Office Depot', 'Costco', 'Sam\'s Club', 'Local Coffee Shop', 'FedEx',
  'UPS', 'Verizon', 'AT&T', 'Microsoft', 'Adobe', 'Google Workspace',
  'Restaurant Supply Co', 'Food Distributor Inc', 'Equipment Rental LLC',
  'Marketing Agency Pro', 'Legal Services Ltd', 'Accounting Firm Plus'
];

const CATEGORIES = [
  'Food & Beverage Inventory', 'Kitchen Equipment & Supplies', 'Staff Meals & Benefits',
  'Cleaning & Sanitation', 'Utilities (Gas/Electric/Water)', 'Equipment Maintenance',
  'Marketing & Promotion', 'Inventory & Merchandise', 'Store Fixtures & Equipment',
  'Point of Sale Systems', 'Security & Surveillance', 'Store Maintenance',
  'Customer Service', 'Office Supplies & Equipment', 'Professional Development',
  'Client Entertainment', 'Technology & Software', 'Insurance & Legal',
  'Office Supplies', 'Professional Services', 'Insurance', 'Marketing/Advertising',
  'Vehicle/Transportation', 'Utilities', 'Rent & Facilities', 'Other'
];

const EXPENSE_TITLES = [
  'Office supplies purchase', 'Monthly software subscription', 'Equipment maintenance',
  'Business lunch', 'Marketing materials', 'Travel expenses', 'Training workshop',
  'Equipment rental', 'Utilities payment', 'Insurance premium', 'Legal consultation',
  'Inventory purchase', 'Cleaning supplies', 'Security system', 'Staff training',
  'Customer service tools', 'Technology upgrade', 'Professional services',
  'Vehicle maintenance', 'Facility repairs', 'Marketing campaign', 'Office furniture'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAmount(min = 10, max = 2000) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

async function seedProductionDatabase() {
  console.log('🌱 Seeding production database with demo data...\n');

  try {
    // Check if already seeded
    const existingExpenses = await prisma.expense.count();
    if (existingExpenses > 100) {
      console.log('📊 Database already contains substantial data, skipping seeding');
      return;
    }
    // 1. Create organization
    console.log('Creating organization...');
    const org = await prisma.organization.upsert({
      where: { name: 'MultiCorp Holdings LLC' },
      update: {},
      create: {
        name: 'MultiCorp Holdings LLC',
        inviteCode: 'cfh80x64zbhcsaxarzalcnrq'
      }
    });
    console.log('✅ Organization created');

    // 2. Create businesses
    console.log('Creating businesses...');
    const businesses = await Promise.all([
      prisma.business.upsert({
        where: { name_organizationId: { name: 'Main Office', organizationId: org.id } },
        update: {},
        create: {
          name: 'Main Office',
          organizationId: org.id
        }
      }),
      prisma.business.upsert({
        where: { name_organizationId: { name: 'Downtown Store', organizationId: org.id } },
        update: {},
        create: {
          name: 'Downtown Store',
          organizationId: org.id
        }
      }),
      prisma.business.upsert({
        where: { name_organizationId: { name: 'Warehouse', organizationId: org.id } },
        update: {},
        create: {
          name: 'Warehouse',
          organizationId: org.id
        }
      })
    ]);
    console.log('✅ Businesses created');

    // 3. Create locations
    console.log('Creating locations...');
    const locations = [];
    for (const business of businesses) {
      const location = await prisma.location.upsert({
        where: { name_businessId: { name: `${business.name} Location`, businessId: business.id } },
        update: {},
        create: {
          name: `${business.name} Location`,
          businessId: business.id
        }
      });
      locations.push(location);
    }
    console.log('✅ Locations created');

    // 4. Create demo user with password
    console.log('Creating demo user...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 12); // Use same hash rounds as signup
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@multicorp.com' },
      update: {
        password: hashedPassword, // Update password if user exists
        organizationId: org.id
      },
      create: {
        email: 'demo@multicorp.com',
        name: 'Demo Manager',
        role: 'EMPLOYEE',
        password: hashedPassword,
        organizationId: org.id
      }
    });
    console.log('✅ Demo user created:', demoUser.email);
    console.log('🔐 Demo login: demo@multicorp.com / password123');

    // 5. Generate comprehensive expense data (500+ records)
    console.log('Generating comprehensive expense data...');
    const expenseCount = 500;
    const expenses = [];

    for (let i = 0; i < expenseCount; i++) {
      const randomBusiness = getRandomElement(businesses);
      const randomLocation = getRandomElement(locations.filter(l => l.businessId === randomBusiness.id));
      
      const expense = {
        title: getRandomElement(EXPENSE_TITLES),
        amount: getRandomAmount(10, 2000),
        category: getRandomElement(CATEGORIES),
        categories: [getRandomElement(CATEGORIES)],
        description: `Generated expense #${i + 1} for analytics testing`,
        date: getRandomDate(365), // Within last year
        vendorName: getRandomElement(VENDORS),
        taxDeductible: Math.random() > 0.3,
        approvalStatus: Math.random() > 0.1 ? 'approved' : 'pending',
        userId: demoUser.id,
        businessId: randomBusiness.id,
        locationId: randomLocation.id
      };

      expenses.push(expense);
    }

    // Insert expenses in batches
    const batchSize = 50;
    for (let i = 0; i < expenses.length; i += batchSize) {
      const batch = expenses.slice(i, i + batchSize);
      await prisma.expense.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`✅ Created expenses ${i + 1}-${Math.min(i + batchSize, expenses.length)}`);
    }

    // 6. Create sample budgets
    console.log('Creating sample budgets...');
    const budgets = [
      {
        name: 'Monthly Office Supplies',
        amount: 5000,
        period: 'monthly',
        category: 'Office Supplies',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        alertThreshold: 80,
        isActive: true,
        organizationId: org.id,
        businessId: businesses[0].id,
        locationId: locations[0].id
      },
      {
        name: 'Quarterly Marketing Budget',
        amount: 15000,
        period: 'quarterly',
        category: 'Marketing/Advertising',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        alertThreshold: 75,
        isActive: true,
        organizationId: org.id,
        businessId: businesses[1].id,
        locationId: locations[1].id
      }
    ];

    for (const budget of budgets) {
      await prisma.budget.upsert({
        where: { name_organizationId: { name: budget.name, organizationId: org.id } },
        update: {},
        create: budget
      });
    }
    console.log('✅ Sample budgets created');

    // 7. Create recurring expenses
    console.log('Creating recurring expenses...');
    const recurringExpenses = [
      {
        title: 'Monthly Software Subscription',
        amount: 299.99,
        category: 'Technology & Software',
        categories: ['Technology & Software'],
        description: 'Monthly SaaS subscription',
        frequency: 'monthly',
        startDate: new Date('2024-01-01'),
        nextDueDate: new Date('2024-02-01'),
        dayOfMonth: 1,
        vendorName: 'Microsoft',
        taxDeductible: true,
        autoCreate: true,
        isActive: true,
        userId: demoUser.id,
        businessId: businesses[0].id,
        locationId: locations[0].id
      },
      {
        title: 'Weekly Office Cleaning',
        amount: 150.00,
        category: 'Cleaning & Sanitation',
        categories: ['Cleaning & Sanitation'],
        description: 'Weekly cleaning service',
        frequency: 'weekly',
        startDate: new Date('2024-01-01'),
        nextDueDate: new Date('2024-01-08'),
        vendorName: 'Local Cleaning Service',
        taxDeductible: true,
        autoCreate: true,
        isActive: true,
        userId: demoUser.id,
        businessId: businesses[1].id,
        locationId: locations[1].id
      }
    ];

    for (const recurringExpense of recurringExpenses) {
      await prisma.recurringExpense.upsert({
        where: { title_userId: { title: recurringExpense.title, userId: demoUser.id } },
        update: {},
        create: recurringExpense
      });
    }
    console.log('✅ Recurring expenses created');

    console.log('\n🎉 Production database seeded successfully!');
    console.log(`📊 Created ${expenseCount} expenses for comprehensive analytics`);
    console.log('🏢 Created organization, businesses, and locations');
    console.log('💰 Created sample budgets and recurring expenses');
    console.log('👤 Created demo user: demo@multicorp.com');
    console.log('\n🚀 Your Railway app now has rich demo data for testing!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your Railway database is accessible');
    console.log('2. Check your DATABASE_URL environment variable');
    console.log('3. Ensure database migrations are up to date');
  } finally {
    await prisma.$disconnect();
  }
}

seedProductionDatabase();
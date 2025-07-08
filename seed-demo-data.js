const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo data for client...')

  // 1. Create Organization
  const organization = await prisma.organization.create({
    data: {
      name: 'MultiCorp Holdings LLC',
      taxId: '12-3456789',
      address: '123 Business Plaza, Suite 500, Business City, BC 12345',
      settings: {
        fiscalYearStart: 'January',
        currency: 'USD',
        timeZone: 'America/New_York'
      }
    }
  })
  console.log('✅ Created organization:', organization.name)

  // 2. Create Businesses
  const restaurant = await prisma.business.create({
    data: {
      organizationId: organization.id,
      name: 'Bella Vista Italian Restaurant',
      businessType: 'Restaurant/Food Service',
      taxSettings: {
        taxRate: 8.25,
        businessLicense: 'REST-2024-001',
        liquorLicense: 'LIQ-2024-001'
      }
    }
  })

  const retail = await prisma.business.create({
    data: {
      organizationId: organization.id,
      name: 'TechGear Electronics',
      businessType: 'Retail',
      taxSettings: {
        taxRate: 7.5,
        businessLicense: 'RET-2024-002',
        resalePermit: 'RSL-2024-002'
      }
    }
  })

  const services = await prisma.business.create({
    data: {
      organizationId: organization.id,
      name: 'ConsultPro Services',
      businessType: 'Professional Services',
      taxSettings: {
        taxRate: 6.0,
        businessLicense: 'SRV-2024-003'
      }
    }
  })

  console.log('✅ Created businesses:', [restaurant.name, retail.name, services.name])

  // 3. Create Locations
  const restaurantLocations = await Promise.all([
    prisma.location.create({
      data: {
        businessId: restaurant.id,
        name: 'Downtown Location',
        address: '456 Main Street, Downtown, BC 12346',
        managerEmail: 'downtown@bellavista.com',
        settings: {
          seatingCapacity: 120,
          kitchenSize: 'large',
          parkingSpaces: 25
        }
      }
    }),
    prisma.location.create({
      data: {
        businessId: restaurant.id,
        name: 'Mall Location',
        address: '789 Shopping Center, Mall Plaza, BC 12347',
        managerEmail: 'mall@bellavista.com',
        settings: {
          seatingCapacity: 80,
          kitchenSize: 'medium',
          parkingSpaces: 0
        }
      }
    }),
    prisma.location.create({
      data: {
        businessId: restaurant.id,
        name: 'Airport Terminal',
        address: 'Terminal B, Gate 15, International Airport, BC 12348',
        managerEmail: 'airport@bellavista.com',
        settings: {
          seatingCapacity: 45,
          kitchenSize: 'small',
          specialHours: '5AM-11PM'
        }
      }
    })
  ])

  const retailLocations = await Promise.all([
    prisma.location.create({
      data: {
        businessId: retail.id,
        name: 'Main Store',
        address: '321 Tech Boulevard, Business District, BC 12349',
        managerEmail: 'main@techgear.com',
        settings: {
          floorSpace: 5000,
          storageCapacity: 'large',
          parkingSpaces: 50
        }
      }
    }),
    prisma.location.create({
      data: {
        businessId: retail.id,
        name: 'Outlet Store',
        address: '654 Outlet Drive, Retail Park, BC 12350',
        managerEmail: 'outlet@techgear.com',
        settings: {
          floorSpace: 3000,
          storageCapacity: 'medium',
          parkingSpaces: 30
        }
      }
    })
  ])

  const serviceLocations = await Promise.all([
    prisma.location.create({
      data: {
        businessId: services.id,
        name: 'Corporate Office',
        address: '987 Professional Way, Suite 200, BC 12351',
        managerEmail: 'office@consultpro.com',
        settings: {
          officeSpace: 2500,
          meetingRooms: 8,
          parkingSpaces: 20
        }
      }
    })
  ])

  console.log('✅ Created locations:', {
    restaurant: restaurantLocations.length,
    retail: retailLocations.length,
    services: serviceLocations.length
  })

  // 4. Create Demo User
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@multicorp.com',
      name: 'Demo Manager',
      role: 'business_manager',
      organizationId: organization.id
    }
  })

  console.log('✅ Created demo user:', demoUser.email)

  // 5. Create Sample Expenses
  const sampleExpenses = [
    // Restaurant expenses
    {
      title: 'Fresh Seafood Delivery',
      amount: 485.50,
      category: 'Food & Beverage Inventory',
      description: 'Weekly seafood order from Ocean Fresh Suppliers',
      date: new Date('2024-01-15'),
      vendorName: 'Ocean Fresh Suppliers',
      expenseCode: 'FOOD-001',
      taxDeductible: true,
      approvalStatus: 'approved',
      userId: demoUser.id,
      businessId: restaurant.id,
      locationId: restaurantLocations[0].id
    },
    {
      title: 'Kitchen Equipment Repair',
      amount: 320.00,
      category: 'Equipment Maintenance',
      description: 'Repair commercial dishwasher - replaced heating element',
      date: new Date('2024-01-18'),
      vendorName: 'Pro Kitchen Services',
      expenseCode: 'MAINT-002',
      taxDeductible: true,
      approvalStatus: 'approved',
      userId: demoUser.id,
      businessId: restaurant.id,
      locationId: restaurantLocations[1].id
    },
    {
      title: 'Staff Training Materials',
      amount: 125.99,
      category: 'Staff Meals & Benefits',
      description: 'Food safety certification training for new employees',
      date: new Date('2024-01-20'),
      vendorName: 'SafeFood Training Co.',
      expenseCode: 'TRAIN-003',
      taxDeductible: true,
      approvalStatus: 'pending',
      userId: demoUser.id,
      businessId: restaurant.id,
      locationId: restaurantLocations[2].id
    },
    // Retail expenses
    {
      title: 'Laptop Inventory Restock',
      amount: 12500.00,
      category: 'Inventory & Merchandise',
      description: 'Quarterly laptop inventory - 25 units various models',
      date: new Date('2024-01-22'),
      vendorName: 'TechDistributor Inc.',
      expenseCode: 'INV-004',
      taxDeductible: true,
      approvalStatus: 'approved',
      userId: demoUser.id,
      businessId: retail.id,
      locationId: retailLocations[0].id
    },
    {
      title: 'Store Display Fixtures',
      amount: 890.75,
      category: 'Store Fixtures & Equipment',
      description: 'New product display stands for smartphone section',
      date: new Date('2024-01-25'),
      vendorName: 'Retail Displays Pro',
      expenseCode: 'FIXT-005',
      taxDeductible: true,
      approvalStatus: 'approved',
      userId: demoUser.id,
      businessId: retail.id,
      locationId: retailLocations[1].id
    },
    // Professional Services expenses
    {
      title: 'Legal Consultation',
      amount: 750.00,
      category: 'Insurance & Legal',
      description: 'Contract review and legal advice for new client agreements',
      date: new Date('2024-01-28'),
      vendorName: 'Business Law Associates',
      expenseCode: 'LEGAL-006',
      taxDeductible: true,
      approvalStatus: 'approved',
      userId: demoUser.id,
      businessId: services.id,
      locationId: serviceLocations[0].id
    },
    {
      title: 'Office Software Licenses',
      amount: 299.99,
      category: 'Technology & Software',
      description: 'Annual subscription for project management software',
      date: new Date('2024-01-30'),
      vendorName: 'ProjectPro Software',
      expenseCode: 'SOFT-007',
      taxDeductible: true,
      approvalStatus: 'pending',
      userId: demoUser.id,
      businessId: services.id,
      locationId: serviceLocations[0].id
    }
  ]

  for (const expense of sampleExpenses) {
    await prisma.expense.create({ data: expense })
  }

  console.log('✅ Created sample expenses:', sampleExpenses.length)

  console.log('\n🎉 Demo data seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Organization: ${organization.name}`)
  console.log(`- Businesses: 3 (Restaurant, Retail, Professional Services)`)
  console.log(`- Locations: 6 total`)
  console.log(`- Sample Expenses: ${sampleExpenses.length}`)
  console.log(`- Demo User: ${demoUser.email}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
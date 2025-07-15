const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Mock data configuration
const VENDORS = [
  'Amazon Business', 'Staples', 'Home Depot', 'Walmart', 'Target', 'Best Buy',
  'Office Depot', 'Costco', 'Sam\'s Club', 'Local Coffee Shop', 'FedEx',
  'UPS', 'Verizon', 'AT&T', 'Microsoft', 'Adobe', 'Google Workspace',
  'Restaurant Supply Co', 'Food Distributor Inc', 'Equipment Rental LLC',
  'Marketing Agency Pro', 'Legal Services Ltd', 'Accounting Firm Plus'
]

const CATEGORIES = [
  'Food & Beverage Inventory', 'Kitchen Equipment & Supplies', 'Staff Meals & Benefits',
  'Cleaning & Sanitation', 'Utilities (Gas/Electric/Water)', 'Equipment Maintenance',
  'Marketing & Promotion', 'Inventory & Merchandise', 'Store Fixtures & Equipment',
  'Point of Sale Systems', 'Security & Surveillance', 'Store Maintenance',
  'Customer Service', 'Office Supplies & Equipment', 'Professional Development',
  'Client Entertainment', 'Technology & Software', 'Insurance & Legal',
  'Office Supplies', 'Professional Services', 'Insurance', 'Marketing/Advertising',
  'Vehicle/Transportation', 'Utilities', 'Rent & Facilities', 'Other'
]

const EXPENSE_TITLES = [
  'Office supplies purchase', 'Monthly software subscription', 'Equipment maintenance',
  'Business lunch', 'Marketing materials', 'Travel expenses', 'Training workshop',
  'Equipment rental', 'Utilities payment', 'Insurance premium', 'Legal consultation',
  'Inventory purchase', 'Cleaning supplies', 'Security system', 'Staff training',
  'Customer service tools', 'Technology upgrade', 'Professional services',
  'Vehicle maintenance', 'Facility repairs', 'Marketing campaign', 'Office furniture'
]

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomAmount(min = 10, max = 2000) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function getRandomDate(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

async function generateMockData() {
  try {
    console.log('🚀 Starting mock data generation...')

    // Get the first organization and user (assuming one exists)
    const organization = await prisma.organization.findFirst()
    if (!organization) {
      console.log('❌ No organization found. Please create a user account first.')
      return
    }

    const user = await prisma.user.findFirst({
      where: { organizationId: organization.id }
    })
    if (!user) {
      console.log('❌ No user found. Please create a user account first.')
      return
    }

    console.log(`📋 Found organization: ${organization.name}`)
    console.log(`👤 Found user: ${user.email}`)

    // Create or get businesses and locations
    const businesses = []
    const locations = []

    // Create sample businesses
    const businessData = [
      { name: 'Main Office', type: 'Professional Services' },
      { name: 'Downtown Store', type: 'Retail' },
      { name: 'Restaurant Location', type: 'Restaurant/Food Service' },
      { name: 'Warehouse', type: 'General Business' }
    ]

    for (const biz of businessData) {
      let business = await prisma.business.findFirst({
        where: { 
          name: biz.name,
          organizationId: organization.id 
        }
      })

      if (!business) {
        business = await prisma.business.create({
          data: {
            name: biz.name,
            businessType: biz.type,
            organizationId: organization.id
          }
        })
        console.log(`🏢 Created business: ${business.name}`)
      }
      businesses.push(business)

      // Create locations for each business
      const locationNames = {
        'Main Office': ['Headquarters', 'Branch Office'],
        'Downtown Store': ['Ground Floor', 'Second Floor'],
        'Restaurant Location': ['Kitchen', 'Dining Area', 'Bar'],
        'Warehouse': ['Storage Area', 'Loading Dock']
      }

      for (const locName of locationNames[biz.name]) {
        let location = await prisma.location.findFirst({
          where: { 
            name: locName,
            businessId: business.id 
          }
        })

        if (!location) {
          location = await prisma.location.create({
            data: {
              name: locName,
              businessId: business.id,
              address: `123 ${locName} Street`
            }
          })
          console.log(`📍 Created location: ${location.name}`)
        }
        locations.push(location)
      }
    }

    // Generate expenses over the last 12 months
    console.log('💰 Generating expenses...')
    const expensesToCreate = []
    const expenseCount = 500 // Generate 500 expenses

    for (let i = 0; i < expenseCount; i++) {
      const business = getRandomElement(businesses)
      const businessLocations = locations.filter(l => l.businessId === business.id)
      const location = getRandomElement(businessLocations)
      const category = getRandomElement(CATEGORIES)
      const vendor = getRandomElement(VENDORS)
      const title = getRandomElement(EXPENSE_TITLES)
      
      // Create different spending patterns for different months
      const daysAgo = Math.floor(Math.random() * 365) // Last 12 months
      const date = getRandomDate(daysAgo)
      
      // Seasonal spending variations
      const month = date.getMonth()
      let amountMultiplier = 1
      
      // Higher spending in certain months (holiday seasons, etc.)
      if (month === 11 || month === 0) amountMultiplier = 1.5 // Dec/Jan
      if (month === 5 || month === 6) amountMultiplier = 1.3 // Jun/Jul
      if (month === 2 || month === 3) amountMultiplier = 0.8 // Mar/Apr (lower)
      
      // Category-based amount ranges
      let baseAmount = 50
      if (category.includes('Equipment') || category.includes('Technology')) {
        baseAmount = 200
      } else if (category.includes('Utilities') || category.includes('Rent')) {
        baseAmount = 500
      } else if (category.includes('Office Supplies') || category.includes('Cleaning')) {
        baseAmount = 25
      }

      const amount = getRandomAmount(baseAmount * 0.5, baseAmount * 3) * amountMultiplier

      expensesToCreate.push({
        title: `${title} - ${vendor}`,
        amount: Math.round(amount * 100) / 100,
        category,
        categories: [category],
        description: `${category} expense from ${vendor}`,
        date,
        vendorName: vendor,
        expenseCode: `EXP-${String(i + 1).padStart(4, '0')}`,
        taxDeductible: Math.random() > 0.3, // 70% tax deductible
        approvalStatus: 'approved',
        userId: user.id,
        businessId: business.id,
        locationId: location.id
      })
    }

    // Batch create expenses
    console.log(`📝 Creating ${expensesToCreate.length} expenses...`)
    await prisma.expense.createMany({
      data: expensesToCreate
    })

    // Create sample budgets
    console.log('🎯 Creating sample budgets...')
    const budgets = [
      {
        name: 'Monthly Office Supplies',
        amount: 1500,
        period: 'monthly',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        category: 'Office Supplies',
        alertThreshold: 80,
        isActive: true,
        organizationId: organization.id,
        createdBy: user.id
      },
      {
        name: 'Quarterly Marketing',
        amount: 5000,
        period: 'quarterly',
        startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1),
        category: 'Marketing & Promotion',
        alertThreshold: 75,
        isActive: true,
        organizationId: organization.id,
        createdBy: user.id
      },
      {
        name: 'Annual Technology Budget',
        amount: 25000,
        period: 'yearly',
        startDate: new Date(new Date().getFullYear(), 0, 1),
        category: 'Technology & Software',
        alertThreshold: 85,
        isActive: true,
        organizationId: organization.id,
        createdBy: user.id
      },
      {
        name: 'Monthly Utilities',
        amount: 2000,
        period: 'monthly',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        category: 'Utilities',
        alertThreshold: 90,
        isActive: true,
        organizationId: organization.id,
        businessId: businesses[0].id,
        createdBy: user.id
      }
    ]

    for (const budget of budgets) {
      const existing = await prisma.budget.findFirst({
        where: { 
          name: budget.name,
          organizationId: organization.id 
        }
      })

      if (!existing) {
        await prisma.budget.create({ data: budget })
        console.log(`🎯 Created budget: ${budget.name}`)
      }
    }

    // Create sample recurring expenses
    console.log('🔄 Creating sample recurring expenses...')
    const recurringExpenses = [
      {
        title: 'Monthly Office Rent',
        amount: 3500,
        category: 'Rent & Facilities',
        categories: ['Rent & Facilities'],
        description: 'Monthly office space rental',
        frequency: 'monthly',
        startDate: new Date(new Date().getFullYear(), 0, 1),
        dayOfMonth: 1,
        vendorName: 'Property Management LLC',
        taxDeductible: true,
        isActive: true,
        autoCreate: false,
        userId: user.id,
        businessId: businesses[0].id
      },
      {
        title: 'Weekly Cleaning Service',
        amount: 250,
        category: 'Cleaning & Sanitation',
        categories: ['Cleaning & Sanitation'],
        description: 'Professional office cleaning',
        frequency: 'weekly',
        startDate: new Date(new Date().getFullYear(), 0, 1),
        vendorName: 'Clean Pro Services',
        taxDeductible: true,
        isActive: true,
        autoCreate: false,
        userId: user.id,
        businessId: businesses[0].id
      },
      {
        title: 'Monthly Software Licenses',
        amount: 899,
        category: 'Technology & Software',
        categories: ['Technology & Software'],
        description: 'Business software subscriptions',
        frequency: 'monthly',
        startDate: new Date(new Date().getFullYear(), 0, 1),
        dayOfMonth: 15,
        vendorName: 'Microsoft',
        taxDeductible: true,
        isActive: true,
        autoCreate: false,
        userId: user.id,
        businessId: businesses[0].id
      }
    ]

    for (const recurring of recurringExpenses) {
      // Calculate next due date
      const nextDueDate = new Date()
      switch (recurring.frequency) {
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1)
          if (recurring.dayOfMonth) {
            nextDueDate.setDate(recurring.dayOfMonth)
          }
          break
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 7)
          break
      }

      const existing = await prisma.recurringExpense.findFirst({
        where: { 
          title: recurring.title,
          userId: user.id 
        }
      })

      if (!existing) {
        await prisma.recurringExpense.create({ 
          data: { ...recurring, nextDueDate } 
        })
        console.log(`🔄 Created recurring expense: ${recurring.title}`)
      }
    }

    // Generate summary statistics
    const totalExpenses = await prisma.expense.count({
      where: { userId: user.id }
    })

    const totalAmount = await prisma.expense.aggregate({
      where: { userId: user.id },
      _sum: { amount: true }
    })

    const categoryBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: { userId: user.id },
      _sum: { amount: true },
      _count: true
    })

    console.log('\n📊 Mock Data Summary:')
    console.log(`✅ Total Expenses: ${totalExpenses}`)
    console.log(`💰 Total Amount: $${totalAmount._sum.amount?.toFixed(2) || 0}`)
    console.log(`🏢 Businesses: ${businesses.length}`)
    console.log(`📍 Locations: ${locations.length}`)
    console.log(`🎯 Budgets: ${budgets.length}`)
    console.log(`🔄 Recurring Expenses: ${recurringExpenses.length}`)
    console.log('\n🔝 Top Categories:')
    
    categoryBreakdown
      .sort((a, b) => (b._sum.amount || 0) - (a._sum.amount || 0))
      .slice(0, 5)
      .forEach(cat => {
        console.log(`   ${cat.category}: $${cat._sum.amount?.toFixed(2)} (${cat._count} expenses)`)
      })

    console.log('\n🎉 Mock data generation completed successfully!')
    console.log('🔗 You can now test the analytics features with realistic data.')

  } catch (error) {
    console.error('❌ Error generating mock data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Calculate next due date for recurring expenses
function calculateNextDueDate(startDate, frequency, dayOfMonth) {
  const nextDue = new Date()
  
  switch (frequency) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + 1)
      break
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + 7)
      break
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + 1)
      if (dayOfMonth) {
        nextDue.setDate(dayOfMonth)
      }
      break
    case 'quarterly':
      nextDue.setMonth(nextDue.getMonth() + 3)
      if (dayOfMonth) {
        nextDue.setDate(dayOfMonth)
      }
      break
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + 1)
      if (dayOfMonth) {
        nextDue.setDate(dayOfMonth)
      }
      break
  }
  
  return nextDue
}

// Run the script
if (require.main === module) {
  generateMockData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = { generateMockData }
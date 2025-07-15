const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function showTestUser() {
  try {
    const users = await prisma.user.findMany({
      include: {
        organization: true
      }
    })

    console.log('👥 Available Test Users:\n')
    
    for (const user of users) {
      console.log(`📧 Email: ${user.email}`)
      console.log(`👤 Name: ${user.name || 'Not set'}`)
      console.log(`🏢 Organization: ${user.organization?.name || 'None'}`)
      console.log(`🔑 Role: ${user.role}`)
      console.log(`📅 Created: ${user.createdAt.toLocaleDateString()}`)
      
      // Check if user has expenses
      const expenseCount = await prisma.expense.count({
        where: { userId: user.id }
      })
      console.log(`💰 Expenses: ${expenseCount}`)
      
      console.log('─'.repeat(40))
    }

    // Show organization info
    const orgs = await prisma.organization.findMany()
    console.log('\n🏢 Organizations:')
    for (const org of orgs) {
      console.log(`• ${org.name} (Invite Code: ${org.inviteCode})`)
    }

    console.log('\n🔐 To test analytics:')
    console.log('1. Go to http://localhost:3003')
    console.log('2. Sign in or create account with the organization invite code')
    console.log('3. Use the Analytics tab to see the mock data in action')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showTestUser()
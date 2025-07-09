const { PrismaClient } = require('@prisma/client');
const { createId } = require('@paralleldrive/cuid2');

const prisma = new PrismaClient();

async function generateInviteCodes() {
  try {
    // Find organizations without invite codes
    const organizations = await prisma.organization.findMany({
      where: {
        inviteCode: null
      }
    });

    console.log(`Found ${organizations.length} organizations without invite codes`);

    for (const org of organizations) {
      const inviteCode = createId();
      
      await prisma.organization.update({
        where: { id: org.id },
        data: { inviteCode }
      });

      console.log(`Generated invite code for ${org.name}: ${inviteCode}`);
    }

    // Show all organizations with their invite codes
    const allOrgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        inviteCode: true,
        users: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    console.log('\n📋 All Organizations with Invite Codes:');
    allOrgs.forEach(org => {
      console.log(`\n🏢 ${org.name}`);
      console.log(`   Code: ${org.inviteCode}`);
      console.log(`   Users: ${org.users.map(u => `${u.email} (${u.role})`).join(', ')}`);
    });

    console.log('\n✅ All organizations now have invite codes!');
  } catch (error) {
    console.error('Error generating invite codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateInviteCodes();
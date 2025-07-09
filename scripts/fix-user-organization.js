const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUserOrganization() {
  try {
    // Find users without organizations
    const usersWithoutOrg = await prisma.user.findMany({
      where: {
        organizationId: null
      },
      include: {
        organization: true
      }
    });

    console.log('Users without organization:', usersWithoutOrg.length);

    for (const user of usersWithoutOrg) {
      console.log(`\nFixing user: ${user.email}`);
      
      // Create organization for the user
      const organization = await prisma.organization.create({
        data: {
          name: `${user.name}'s Organization`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      console.log(`Created organization: ${organization.name} (ID: ${organization.id})`);

      // Update user to link to organization
      await prisma.user.update({
        where: { id: user.id },
        data: {
          organizationId: organization.id,
          role: 'owner' // Make them owner of their organization
        }
      });

      console.log(`Updated user ${user.email} to organization ${organization.id}`);
    }

    console.log('\n✅ All users now have organizations!');
  } catch (error) {
    console.error('Error fixing user organizations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserOrganization();
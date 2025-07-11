import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { db as prisma } from '@/lib/db'
import { canManageUsers } from '@/lib/roles'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    if (!canManageUsers(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const resolvedParams = await params
    
    // Deactivate the invite code (soft delete)
    const inviteCode = await prisma.inviteCode.update({
      where: {
        id: resolvedParams.id,
        organizationId: user.organization.id, // Ensure user can only manage their org's codes
      },
      data: {
        isActive: false,
      }
    })

    return NextResponse.json(inviteCode)
  } catch (error) {
    console.error('Failed to deactivate invite code:', error)
    return NextResponse.json({ error: 'Failed to deactivate invite code' }, { status: 500 })
  }
}
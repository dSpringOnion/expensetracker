import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { db as prisma } from '@/lib/db'
import { z } from 'zod'
import { canManageUsers, hasRole } from '@/lib/roles'
import { UserRole } from '@prisma/client'

const updateUserSchema = z.object({
  role: z.enum(['EMPLOYEE', 'MANAGER', 'BUSINESS_OWNER', 'ORGANIZATION_ADMIN']).optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    })

    if (!currentUser?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    if (!canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { role, isActive } = updateUserSchema.parse(body)
    const resolvedParams = await params

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { 
        id: resolvedParams.id,
        organizationId: currentUser.organization.id, // Ensure user is in same org
      }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent users from promoting someone to a role higher than their own
    if (role && !hasRole(currentUser.role, role as UserRole)) {
      return NextResponse.json({ 
        error: 'Cannot assign a role higher than your own' 
      }, { status: 403 })
    }

    // Prevent users from demoting themselves if they're the only admin
    if (targetUser.id === currentUser.id && role && role !== currentUser.role) {
      const adminCount = await prisma.user.count({
        where: {
          organizationId: currentUser.organization.id,
          role: UserRole.ORGANIZATION_ADMIN,
          isActive: true,
        }
      })

      if (adminCount === 1 && currentUser.role === UserRole.ORGANIZATION_ADMIN) {
        return NextResponse.json({ 
          error: 'Cannot change role - you are the only active admin' 
        }, { status: 400 })
      }
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: {
        ...(role && { role: role as UserRole }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { db as prisma } from '@/lib/db'
import { z } from 'zod'
import { canManageUsers, generateInviteCode } from '@/lib/roles'
import { UserRole } from '@prisma/client'

const createInviteCodeSchema = z.object({
  role: z.enum(['EMPLOYEE', 'MANAGER', 'BUSINESS_OWNER', 'ORGANIZATION_ADMIN']),
  maxUses: z.number().optional(),
  expiresAt: z.string().optional(),
})

export async function GET() {
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

    const inviteCodes = await prisma.inviteCode.findMany({
      where: {
        organizationId: user.organization.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(inviteCodes)
  } catch (error) {
    console.error('Failed to fetch invite codes:', error)
    return NextResponse.json({ error: 'Failed to fetch invite codes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { role, maxUses, expiresAt } = createInviteCodeSchema.parse(body)

    // Generate unique invite code
    let attempts = 0
    let code: string
    let existingCode

    do {
      code = generateInviteCode(user.organization.name, role as UserRole)
      existingCode = await prisma.inviteCode.findUnique({ where: { code } })
      attempts++
    } while (existingCode && attempts < 10)

    if (existingCode) {
      return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 })
    }

    const inviteCode = await prisma.inviteCode.create({
      data: {
        code,
        role: role as UserRole,
        organizationId: user.organization.id,
        maxUses,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: user.id,
      }
    })

    return NextResponse.json(inviteCode)
  } catch (error) {
    console.error('Failed to create invite code:', error)
    return NextResponse.json({ error: 'Failed to create invite code' }, { status: 500 })
  }
}
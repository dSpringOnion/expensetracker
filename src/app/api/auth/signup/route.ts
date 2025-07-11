import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'
import { generateInviteCode } from '@/lib/roles'
import { UserRole } from '@prisma/client'

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, organizationCode } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Handle organization logic
    interface TransactionResult {
      user: {
        id: string
        name: string | null
        email: string
        role: UserRole
        organizationId: string | null
      }
      organization: {
        id: string
        name: string
      }
    }

    const result = await db.$transaction(async (tx): Promise<TransactionResult> => {
      let organization: { id: string; name: string }
      let userRole: UserRole = UserRole.EMPLOYEE
      
      // Check if organization code is provided
      if (organizationCode && organizationCode.trim()) {
        const code = organizationCode.trim()
        
        // First try to find role-based invite code
        const inviteCode = await tx.inviteCode.findUnique({
          where: { 
            code,
            isActive: true,
          },
          include: { organization: true }
        })
        
        if (inviteCode) {
          // Check if code is expired
          if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) {
            throw new Error('Invite code has expired')
          }
          
          // Check if code has reached max uses
          if (inviteCode.maxUses && inviteCode.usedCount >= inviteCode.maxUses) {
            throw new Error('Invite code has reached maximum uses')
          }
          
          // Use invite code
          organization = inviteCode.organization
          userRole = inviteCode.role
          
          // Increment usage count
          await tx.inviteCode.update({
            where: { id: inviteCode.id },
            data: { usedCount: { increment: 1 } }
          })
          
        } else {
          // Try legacy invite code (single org code)
          const existingOrg = await tx.organization.findUnique({
            where: { inviteCode: code }
          })
          
          if (existingOrg) {
            // Join existing organization as employee
            organization = existingOrg
            userRole = UserRole.EMPLOYEE
          } else {
            throw new Error('Invalid organization code')
          }
        }
      } else {
        // No organization code provided - create new organization
        organization = await tx.organization.create({
          data: {
            name: `${name}'s Organization`,
            inviteCode: createId(),
            settings: {}
          }
        })
        
        // First user in organization becomes admin
        userRole = UserRole.ORGANIZATION_ADMIN
        
        // Default invite codes will be created after user creation
      }

      // Create user with organization
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: userRole,
          organizationId: organization.id
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          organizationId: true,
        }
      })
      
      // If this is a new organization, create default invite codes
      if (!organizationCode) {
        const defaultCodes = [
          UserRole.EMPLOYEE,
          UserRole.MANAGER, 
          UserRole.BUSINESS_OWNER,
          UserRole.ORGANIZATION_ADMIN,
        ]
        
        for (const role of defaultCodes) {
          const code = generateInviteCode(organization.name, role)
          await tx.inviteCode.create({
            data: {
              code,
              role,
              organizationId: organization.id,
              createdBy: user.id,
            }
          })
        }
      }

      return { user, organization }
    })

    const { user } = result

    // Return success (don't include password in response)
    return NextResponse.json(
      { 
        message: 'Account created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
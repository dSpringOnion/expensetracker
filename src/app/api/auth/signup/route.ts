import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'

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
    const result = await db.$transaction(async (tx) => {
      let organization
      let userRole = 'owner'
      
      // Check if organization code is provided
      if (organizationCode && organizationCode.trim()) {
        // Try to find existing organization by invite code
        const existingOrg = await tx.organization.findUnique({
          where: { inviteCode: organizationCode.trim() }
        })
        
        if (existingOrg) {
          // Join existing organization as employee
          organization = existingOrg
          userRole = 'employee'
        } else {
          // Invalid organization code - create new organization
          organization = await tx.organization.create({
            data: {
              name: `${name}'s Organization`,
              inviteCode: createId(),
              settings: {}
            }
          })
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
      }

      // Create user with organization
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: userRole,
          organizationId: organization.id
        }
      })

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
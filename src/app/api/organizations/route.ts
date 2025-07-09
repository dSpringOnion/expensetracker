import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createAuthenticatedRoute, createRoleAuthenticatedRoute } from '@/lib/auth-middleware'

export const GET = createAuthenticatedRoute(async (request: NextRequest, user) => {
  try {
    // Regular users can only see their own organization
    if (user.role !== 'owner') {
      if (!user.organizationId) {
        return NextResponse.json(
          { error: 'No organization associated with user' },
          { status: 404 }
        )
      }

      const organization = await db.organization.findUnique({
        where: { id: user.organizationId },
        include: {
          businesses: {
            include: {
              locations: true
            }
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      })

      return NextResponse.json(organization ? [organization] : [])
    }

    // Owners can see all organizations
    const organizations = await db.organization.findMany({
      include: {
        businesses: {
          include: {
            locations: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(organizations)
  } catch (error) {
    console.error('Failed to fetch organizations:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
})

export const POST = createRoleAuthenticatedRoute(['owner'], async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name, taxId, address, settings } = body

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    const organization = await db.organization.create({
      data: {
        name,
        taxId,
        address,
        settings
      }
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    console.error('Failed to create organization:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
})
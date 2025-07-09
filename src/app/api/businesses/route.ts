import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createAuthenticatedRoute } from '@/lib/auth-middleware'

export const GET = createAuthenticatedRoute(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    // Use user's organizationId if not provided and user is not owner
    const effectiveOrgId = organizationId || user.organizationId
    
    if (!effectiveOrgId) {
      // Return empty array if user has no organization yet
      return NextResponse.json([])
    }

    // Ensure user can only access their organization's businesses
    if (user.role !== 'owner' && user.organizationId !== effectiveOrgId) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot access other organizations' },
        { status: 403 }
      )
    }

    const businesses = await db.business.findMany({
      where: { organizationId: effectiveOrgId },
      include: {
        organization: true,
        locations: true,
        expenses: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(businesses)
  } catch (error) {
    console.error('Failed to fetch businesses:', error)
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }
})

export const POST = createAuthenticatedRoute(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { organizationId, name, businessType, taxSettings } = body

    // Use user's organizationId if not provided
    const effectiveOrgId = organizationId || user.organizationId

    if (!effectiveOrgId || !name) {
      return NextResponse.json({ 
        error: 'Organization ID and business name are required' 
      }, { status: 400 })
    }

    // Ensure user can only create businesses in their organization
    if (user.role !== 'owner' && user.organizationId !== effectiveOrgId) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot create businesses in other organizations' },
        { status: 403 }
      )
    }

    const business = await db.business.create({
      data: {
        organizationId: effectiveOrgId,
        name,
        businessType,
        taxSettings
      },
      include: {
        organization: true,
        locations: true
      }
    })

    return NextResponse.json(business, { status: 201 })
  } catch (error) {
    console.error('Failed to create business:', error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
})
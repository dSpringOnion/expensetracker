import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createAuthenticatedRoute } from '@/lib/auth-middleware'

export const GET = createAuthenticatedRoute(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    let where = {}

    if (businessId) {
      // Verify user has access to this business
      const business = await db.business.findUnique({
        where: { id: businessId },
        select: { organizationId: true }
      })

      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 })
      }

      if (user.role !== 'owner' && user.organizationId !== business.organizationId) {
        return NextResponse.json(
          { error: 'Forbidden - Cannot access locations from other organizations' },
          { status: 403 }
        )
      }

      where = { businessId }
    } else {
      // Get all locations for user's organization
      where = {
        business: {
          organizationId: user.organizationId
        }
      }
    }

    const locations = await db.location.findMany({
      where,
      include: {
        business: {
          include: {
            organization: true
          }
        },
        expenses: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(locations)
  } catch (error) {
    console.error('Failed to fetch locations:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
})

export const POST = createAuthenticatedRoute(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { businessId, name, address, managerEmail, settings } = body

    if (!businessId || !name) {
      return NextResponse.json({ 
        error: 'Business ID and location name are required' 
      }, { status: 400 })
    }

    // Verify user has access to this business
    const business = await db.business.findUnique({
      where: { id: businessId },
      select: { organizationId: true }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (user.role !== 'owner' && user.organizationId !== business.organizationId) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot create locations in other organizations' },
        { status: 403 }
      )
    }

    const location = await db.location.create({
      data: {
        businessId,
        name,
        address,
        managerEmail,
        settings
      },
      include: {
        business: {
          include: {
            organization: true
          }
        }
      }
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Failed to create location:', error)
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 })
  }
})
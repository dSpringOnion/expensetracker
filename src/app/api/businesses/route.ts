import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    const where = organizationId ? { organizationId } : {}

    const businesses = await prisma.business.findMany({
      where,
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, name, businessType, taxSettings } = body

    if (!organizationId || !name) {
      return NextResponse.json({ error: 'Organization ID and business name are required' }, { status: 400 })
    }

    const business = await prisma.business.create({
      data: {
        organizationId,
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
}
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    const where = businessId ? { businessId } : {}

    const locations = await prisma.location.findMany({
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, name, address, managerEmail, settings } = body

    if (!businessId || !name) {
      return NextResponse.json({ error: 'Business ID and location name are required' }, { status: 400 })
    }

    const location = await prisma.location.create({
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
}
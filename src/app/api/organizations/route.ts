import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        businesses: {
          include: {
            locations: true
          }
        },
        users: true
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, taxId, address, settings } = body

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    const organization = await prisma.organization.create({
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
}
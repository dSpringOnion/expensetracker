import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const business = await db.business.findUnique({
      where: { id },
      include: {
        organization: true,
        locations: true,
        expenses: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json(business)
  } catch (error) {
    console.error('Failed to fetch business:', error)
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const body = await request.json()
    const { name, businessType, taxSettings } = body

    if (!name) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    const business = await db.business.update({
      where: { id },
      data: {
        name,
        businessType,
        taxSettings
      },
      include: {
        organization: true,
        locations: true
      }
    })

    return NextResponse.json(business)
  } catch (error) {
    console.error('Failed to update business:', error)
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    await db.business.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Business deleted successfully' })
  } catch (error) {
    console.error('Failed to delete business:', error)
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 })
  }
}
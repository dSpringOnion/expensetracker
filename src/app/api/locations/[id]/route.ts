import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        business: {
          include: {
            organization: true
          }
        },
        expenses: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error('Failed to fetch location:', error)
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const body = await request.json()
    const { name, address, managerEmail, settings } = body

    if (!name) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 })
    }

    const location = await prisma.location.update({
      where: { id },
      data: {
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

    return NextResponse.json(location)
  } catch (error) {
    console.error('Failed to update location:', error)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    await prisma.location.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Location deleted successfully' })
  } catch (error) {
    console.error('Failed to delete location:', error)
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
  }
}
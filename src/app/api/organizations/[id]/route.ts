import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        businesses: {
          include: {
            locations: true
          }
        },
        users: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Failed to fetch organization:', error)
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const body = await request.json()
    const { name, taxId, address, settings } = body

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        name,
        taxId,
        address,
        settings
      }
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Failed to update organization:', error)
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    await prisma.organization.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Organization deleted successfully' })
  } catch (error) {
    console.error('Failed to delete organization:', error)
    return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 })
  }
}
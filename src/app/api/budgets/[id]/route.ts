import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: token.sub },
      include: { organization: true }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User not found or not in organization' }, { status: 404 })
    }

    const budgetId = params.id
    const data = await request.json()

    // Verify budget belongs to user's organization
    const existingBudget = await db.budget.findFirst({
      where: {
        id: budgetId,
        organizationId: user.organizationId
      }
    })

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    const budget = await db.budget.update({
      where: { id: budgetId },
      data: {
        name: data.name,
        amount: data.amount,
        period: data.period,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        category: data.category,
        businessId: data.businessId,
        locationId: data.locationId,
        alertThreshold: data.alertThreshold,
        isActive: data.isActive
      },
      include: {
        business: true,
        location: true
      }
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Budget update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: token.sub },
      include: { organization: true }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User not found or not in organization' }, { status: 404 })
    }

    const budgetId = params.id

    // Verify budget belongs to user's organization
    const existingBudget = await db.budget.findFirst({
      where: {
        id: budgetId,
        organizationId: user.organizationId
      }
    })

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    await db.budget.delete({
      where: { id: budgetId }
    })

    return NextResponse.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    console.error('Budget deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
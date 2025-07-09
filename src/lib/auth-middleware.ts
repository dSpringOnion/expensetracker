import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

export interface AuthenticatedUser {
  id: string
  email: string
  role: string
  organizationId: string | null
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
      role: session.user.role || 'employee',
      organizationId: session.user.organizationId || null
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export function createAuthenticatedRoute(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = await getAuthenticatedUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    return await handler(request, user)
  }
}

export function createRoleAuthenticatedRoute(
  requiredRoles: string[],
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return createAuthenticatedRoute(async (request: NextRequest, user: AuthenticatedUser) => {
    if (!requiredRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    return await handler(request, user)
  })
}
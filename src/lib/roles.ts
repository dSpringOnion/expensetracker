import { UserRole } from '@prisma/client'

export const USER_ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  BUSINESS_OWNER: 'BUSINESS_OWNER',
  ORGANIZATION_ADMIN: 'ORGANIZATION_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export const ROLE_HIERARCHY = {
  EMPLOYEE: 1,
  MANAGER: 2,
  BUSINESS_OWNER: 3,
  ORGANIZATION_ADMIN: 4,
  SUPER_ADMIN: 5,
} as const

export const ROLE_DISPLAY_NAMES = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  BUSINESS_OWNER: 'Business Owner',
  ORGANIZATION_ADMIN: 'Organization Admin',
  SUPER_ADMIN: 'Super Admin',
} as const

export const ROLE_DESCRIPTIONS = {
  EMPLOYEE: 'Can manage their own expenses and receipts',
  MANAGER: 'Can view and approve expenses for their business area',
  BUSINESS_OWNER: 'Full access to their business data and management',
  ORGANIZATION_ADMIN: 'Full organization management and user administration',
  SUPER_ADMIN: 'System-wide administration across organizations',
} as const

// Role permission checks
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function canManageUsers(userRole: UserRole): boolean {
  return hasRole(userRole, USER_ROLES.ORGANIZATION_ADMIN)
}

export function canAccessImportExport(userRole: UserRole): boolean {
  return hasRole(userRole, USER_ROLES.MANAGER)
}

export function canManageBusinesses(userRole: UserRole): boolean {
  return hasRole(userRole, USER_ROLES.BUSINESS_OWNER)
}

export function canViewAllOrganizationData(userRole: UserRole): boolean {
  return hasRole(userRole, USER_ROLES.ORGANIZATION_ADMIN)
}

// Generate invite codes
export function generateInviteCode(organizationName: string, role: UserRole): string {
  const roleCode = {
    EMPLOYEE: 'EMP',
    MANAGER: 'MGR', 
    BUSINESS_OWNER: 'BIZ',
    ORGANIZATION_ADMIN: 'ADM',
    SUPER_ADMIN: 'SUP',
  }[role]

  const orgCode = organizationName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 4)
    .padEnd(4, 'X')

  const year = new Date().getFullYear()
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase()

  return `${orgCode}${year}-${roleCode}-${randomSuffix}`
}

// Validate invite code format
export function parseInviteCode(code: string): { orgCode: string; year: string; roleCode: string; suffix: string } | null {
  const match = code.match(/^([A-Z]{4})(\d{4})-([A-Z]{3})-([A-Z0-9]{3})$/)
  if (!match) return null

  const [, orgCode, year, roleCode, suffix] = match
  return { orgCode, year, roleCode, suffix }
}

export function getRoleFromInviteCode(code: string): UserRole | null {
  const parsed = parseInviteCode(code)
  if (!parsed) return null

  const roleMap = {
    'EMP': USER_ROLES.EMPLOYEE,
    'MGR': USER_ROLES.MANAGER,
    'BIZ': USER_ROLES.BUSINESS_OWNER,
    'ADM': USER_ROLES.ORGANIZATION_ADMIN,
    'SUP': USER_ROLES.SUPER_ADMIN,
  } as const

  return roleMap[parsed.roleCode as keyof typeof roleMap] || null
}
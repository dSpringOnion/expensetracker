'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-radix'
import { Users, Shield, UserCheck, UserX, Copy, Plus } from 'lucide-react'
import { ROLE_DISPLAY_NAMES, ROLE_DESCRIPTIONS } from '@/lib/roles'
import { UserRole } from '@prisma/client'

interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

interface InviteCode {
  id: string
  code: string
  role: UserRole
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'invite-codes'>('users')

  useEffect(() => {
    fetchUsers()
    fetchInviteCodes()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInviteCodes = async () => {
    try {
      const response = await fetch('/api/admin/invite-codes')
      if (response.ok) {
        const data = await response.json()
        setInviteCodes(data)
      }
    } catch (error) {
      console.error('Failed to fetch invite codes:', error)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
      }
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })
      
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive } : user
        ))
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  const createInviteCode = async (role: UserRole): Promise<void> => {
    try {
      const response = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      
      if (response.ok) {
        const newCode = await response.json()
        setInviteCodes(prev => [newCode, ...prev])
      }
    } catch (error) {
      console.error('Failed to create invite code:', error)
    }
  }

  const deactivateInviteCode = async (codeId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/invite-codes/${codeId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setInviteCodes(prev => prev.filter(code => code.id !== codeId))
      }
    } catch (error) {
      console.error('Failed to deactivate invite code:', error)
    }
  }

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'users'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="inline-block h-4 w-4 mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('invite-codes')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'invite-codes'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shield className="inline-block h-4 w-4 mr-2" />
          Invite Codes
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Organization Users</h3>
            <p className="text-sm text-gray-600">Manage user roles and access permissions</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {ROLE_DESCRIPTIONS[user.role]}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Select
                    value={user.role}
                    onValueChange={(value) => updateUserRole(user.id, value as UserRole)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_DISPLAY_NAMES).map(([role, name]) => (
                        <SelectItem key={role} value={role}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserStatus(user.id, !user.isActive)}
                    className={user.isActive ? 'text-red-600' : 'text-green-600'}
                  >
                    {user.isActive ? (
                      <>
                        <UserX className="h-4 w-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'invite-codes' && (
        <div className="space-y-4">
          {/* Create New Invite Code */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Invite Code</h3>
            <div className="flex space-x-4">
              {Object.entries(ROLE_DISPLAY_NAMES).map(([role, name]) => (
                <Button
                  key={role}
                  variant="outline"
                  onClick={() => createInviteCode(role as UserRole)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>{name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Active Invite Codes */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Invite Codes</h3>
              <p className="text-sm text-gray-600">Share these codes with new team members</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {inviteCodes.map((code) => (
                <div key={code.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {code.code}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {ROLE_DISPLAY_NAMES[code.role]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 space-x-4">
                      <span>Used: {code.usedCount}{code.maxUses ? `/${code.maxUses}` : ''}</span>
                      {code.expiresAt && (
                        <span>Expires: {new Date(code.expiresAt).toLocaleDateString()}</span>
                      )}
                      <span>Created: {new Date(code.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(code.code)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deactivateInviteCode(code.id)}
                      className="text-red-600"
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
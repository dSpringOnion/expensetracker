'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn } from 'lucide-react'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoLogin = async () => {
    setIsLoading(true)
    // For demo purposes, we'll just redirect to the main app
    // In production, this would handle actual authentication
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your expense tracker
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <Button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Demo mode - Click sign in to continue
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
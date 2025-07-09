import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import type { NextAuthOptions } from 'next-auth'
import bcrypt from 'bcryptjs'

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { organization: true }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
        }
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (session.user && token.sub) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
            role: token.role,
            organizationId: token.organizationId,
          }
        }
      }
      return session
    },
    jwt: ({ token, user }) => {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.organizationId = (user as any).organizationId
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  session: {
    strategy: 'jwt'
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions)
export { authOptions }
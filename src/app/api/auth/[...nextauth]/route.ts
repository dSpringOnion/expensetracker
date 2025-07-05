import NextAuth from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { db } from '@/lib/db'
import type { NextAuthOptions } from 'next-auth'

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    // For development, we'll use a simple email provider
    // In production, you'd add OAuth providers like Google, GitHub, etc.
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (session.user && token.sub) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
# Database Setup Guide

## Current Setup (Development)
- ✅ SQLite database (`prisma/dev.db`)
- ✅ Prisma ORM configured
- ✅ Migrations created
- ✅ Working locally

## Production Database Setup

### Option 1: Railway PostgreSQL (Recommended)
1. Deploy to Railway
2. Add PostgreSQL service
3. Copy the DATABASE_URL from Railway dashboard
4. Set environment variable: `DATABASE_URL=postgresql://...`
5. Run: `npx prisma db push` to create tables

### Option 2: External PostgreSQL
Services like Supabase, Neon, or PlanetScale:

1. Create account and database
2. Get connection string
3. Update `.env`:
   ```
   DATABASE_URL="postgresql://username:password@host:port/database"
   ```
4. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // changed from sqlite
     url      = env("DATABASE_URL")
   }
   ```
5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Environment Variables Needed
```env
DATABASE_URL="your-database-connection-string"
NEXTAUTH_URL="https://your-app-url.com"
NEXTAUTH_SECRET="your-random-secret-key"
```

## When to Switch
- **Now**: If you want to test with persistent data
- **Before deployment**: Required for production
- **When sharing**: If others need to access the same data

The app will work the same way, Prisma handles the database differences automatically!
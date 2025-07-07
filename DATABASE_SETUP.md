# Permanent Database Setup Guide

## 🎯 Why Permanent Database?

✅ **Data persists forever** - No more losing expenses after server restarts  
✅ **Production ready** - Deploy anywhere without data loss  
✅ **Multi-user support** - Each user has their own secure data  
✅ **Backup & recovery** - Professional database providers handle this  
✅ **Scalability** - Handle thousands of expenses efficiently  

## 🆓 Free Database Options (Recommended)

### Option 1: Neon ⭐ (Best Choice)
**Free tier: 10GB storage, excellent performance**

1. Go to [neon.tech](https://neon.tech)
2. Create account and new project
3. Copy the connection string
4. Update your `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@ep-example.us-east-1.aws.neon.tech/expensetracker"
   ```
5. Run setup:
   ```bash
   npm run db:push
   ```

### Option 2: Supabase
**Free tier: 500MB storage, includes authentication**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy connection string (replace `[YOUR-PASSWORD]` with your actual password)
5. Update `.env` and run `npm run db:push`

### Option 3: Railway (During Deployment)
**Free tier: 100 hours/month**

1. Deploy your app to Railway
2. Add PostgreSQL service
3. Copy DATABASE_URL from Railway dashboard
4. Environment variable is set automatically

## 🚀 Quick Setup Commands

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your database URL
# DATABASE_URL="your-connection-string-here"

# 3. Create database tables
npm run db:push

# 4. (Optional) Migrate existing SQLite data
npm run db:migrate-from-sqlite

# 5. Start using permanent storage!
npm run dev
```

## 🔧 Advanced Setup

### Custom PostgreSQL
If you have your own PostgreSQL server:

```env
DATABASE_URL="postgresql://username:password@your-server:5432/expensetracker"
```

### Local PostgreSQL
For development with local PostgreSQL:

```bash
# Install PostgreSQL locally first
createdb expensetracker
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/expensetracker"' > .env
npm run db:push
```

## 📊 Data Migration

### From SQLite to PostgreSQL
If you have existing SQLite data:

```bash
npm run db:migrate-from-sqlite
```

This will:
- Read all data from your SQLite database
- Create it in your new PostgreSQL database  
- Preserve all your existing expenses and user data

## 🔐 Security Best Practices

1. **Never commit** your actual DATABASE_URL to git
2. **Use strong passwords** for database connections
3. **Restrict database access** to your application only
4. **Enable SSL** connections (most providers do this automatically)
5. **Regular backups** (most cloud providers handle this)

## ✅ Verification

After setup, verify everything works:

```bash
# Check database connection
npm run db:studio

# Test the application
npm run dev
# Visit http://localhost:3000 and add an expense
# Restart the server - your data should still be there!
```

## 🆘 Troubleshooting

**Connection failed?**
- Check your connection string format
- Verify username/password are correct
- Ensure database exists and is accessible

**Migration errors?**
- Run `npm run db:reset` to start fresh
- Check PostgreSQL version compatibility
- Verify network access to database

**Still using SQLite?**
Your app will work, but data won't persist in production. Upgrade when ready!

## 📈 Production Deployment

When deploying to production:

1. **Environment Variables**: Set DATABASE_URL in your hosting platform
2. **Run Migrations**: `npm run db:deploy` on first deployment  
3. **Monitor**: Check database usage and performance
4. **Backup**: Ensure regular backups are configured

Your expense tracker now has enterprise-grade data persistence! 🎉
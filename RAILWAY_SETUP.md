# Railway Database Setup Guide

## 🚂 Getting the Correct Database URL

You provided the **internal** Railway URL, but for local development you need the **public** URL.

### Steps to Get Public URL:

1. **Go to your Railway dashboard** at https://railway.app
2. **Click on your project** 
3. **Click on the PostgreSQL service**
4. **Go to the "Connect" tab**
5. **Copy the "Public Network" connection string** (not internal)

The public URL will look like:
```
postgresql://postgres:FWEcBaHDnEzyoVZvZxXYuUtJTesrwHOt@roundhouse.proxy.rlwy.net:12345/railway
```

### Quick Setup with Railway CLI:

```bash
# 1. Install Railway CLI (already done)
npm i -g @railway/cli

# 2. Login to Railway
railway login

# 3. Link to your project
railway link

# 4. Get environment variables
railway run npm run db:push
```

### Alternative: Manual Setup

1. **Get the public URL** from Railway dashboard
2. **Update your .env file**:
   ```env
   DATABASE_URL="postgresql://postgres:FWEcBaHDnEzyoVZvZxXYuUtJTesrwHOt@roundhouse.proxy.rlwy.net:XXXX/railway"
   ```
3. **Run database setup**:
   ```bash
   npm run db:push
   ```

## 🔧 Current Status

- ✅ Railway PostgreSQL database is provisioned
- ✅ App is configured for PostgreSQL  
- 🔄 Need public URL for local development
- 🔄 Need to create database tables

## 📝 Next Steps

1. Get the **public connection URL** from Railway dashboard
2. Update your `.env` file with the public URL
3. Run `npm run db:push` to create tables
4. Run `npm run db:seed` to add sample data
5. Your permanent database will be ready! 🎉
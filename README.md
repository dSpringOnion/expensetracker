# Expense Tracker

A full-stack multi-tenant expense tracking application built with Next.js, TypeScript, Tailwind CSS, and Prisma. Features organization-based user management, inline business/location creation, and comprehensive expense tracking.

## Features

- **Organization Management**: Multi-tenant architecture with organization invite codes
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Business & Location Management**: Create and manage businesses and locations inline
- **Expense Tracking**: Complete expense management with categories, analytics, and filtering
- **Form Validation**: Comprehensive error handling with data persistence on failure
- **Real-time Analytics**: Track expenses with statistics and category breakdowns
- **Production Ready**: Deployed on Railway with PostgreSQL database
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js with JWT strategy
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **Deployment**: Railway with environment variable management
- **Architecture**: Multi-tenant with organization-based data isolation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Railway, Neon, Supabase, or local)

### Quick Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. **Set up database** (choose one option):

   **🚀 Option A: Railway (Recommended - Production ready)**
   ```bash
   # 1. Go to https://railway.app and create a project
   # 2. Add PostgreSQL service
   # 3. Copy your connection string
   # 4. Create .env file:
   echo 'DATABASE_URL="your-railway-connection-string"' > .env
   echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env
   echo 'NEXTAUTH_SECRET="$(openssl rand -base64 32)"' >> .env
   ```

   **🆓 Option B: Neon (Free tier)**
   ```bash
   # 1. Go to https://neon.tech and create a project
   # 2. Copy your connection string
   # 3. Create .env file with your connection string
   ```

   **🔧 Option C: Local PostgreSQL**
   ```bash
   # If you have PostgreSQL installed locally
   createdb expensetracker
   echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/expensetracker"' > .env
   ```

4. Set up database tables:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create `.env` file with the following variables:

```env
# Required: PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/database_name"

# Required for authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# For production deployment
# NEXTAUTH_URL="https://your-app-url.com"
```

### Database Setup

After setting up your database connection:

```bash
# Push schema to database
npm run db:push

# Optional: Generate organization invite codes for existing data
node scripts/generate-invite-codes.js
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   │   ├── auth/       # NextAuth configuration and signup
│   │   ├── expenses/   # Expense CRUD operations
│   │   ├── businesses/ # Business management
│   │   ├── locations/  # Location management
│   │   ├── organizations/ # Organization management
│   │   ├── upload/     # File upload handling
│   │   └── health/     # Health check endpoint
│   └── auth/           # Authentication pages (signin/signup)
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── forms/         # Form components (expense, business, location)
│   ├── dashboard/     # Dashboard components
│   └── modals/        # Modal components
├── lib/               # Utility functions
│   ├── db.ts          # Centralized Prisma client
│   ├── utils.ts       # Utility functions
│   └── auth-middleware.ts # Authentication middleware
├── types/             # TypeScript type definitions
│   ├── index.ts       # Main type definitions
│   └── next-auth.d.ts # NextAuth type extensions
├── scripts/           # Database and utility scripts
└── docs/              # Project documentation
```

## Database Schema

### Organization
- id: Unique identifier
- name: Organization name
- inviteCode: Unique invite code for user onboarding
- settings: Organization settings (JSON)
- users: Related users
- businesses: Related businesses

### User
- id: Unique identifier
- email: User email (unique)
- name: User display name
- role: User role (owner, business_manager, location_manager, employee)
- organizationId: Foreign key to Organization
- expenses: Related expenses

### Business
- id: Unique identifier
- name: Business name
- organizationId: Foreign key to Organization
- locations: Related locations
- expenses: Related expenses

### Location
- id: Unique identifier
- name: Location name
- address: Optional address
- businessId: Foreign key to Business
- expenses: Related expenses

### Expense
- id: Unique identifier
- title: Expense title
- amount: Amount spent
- category: Expense category
- categories: Multiple categories (JSON array)
- description: Optional description
- date: Expense date
- vendorName: Optional vendor name
- expenseCode: Optional expense code
- taxDeductible: Tax deductible flag
- receiptUrl: Optional receipt image URL
- userId: Foreign key to User
- businessId: Optional foreign key to Business
- locationId: Optional foreign key to Location

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration with organization code
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Expenses
- `GET /api/expenses` - Fetch user expenses (with filtering)
- `POST /api/expenses` - Create new expense

### Organizations
- `GET /api/organizations` - Fetch user's organization
- `POST /api/organizations` - Create new organization
- `GET /api/organizations/[id]` - Get organization details

### Businesses
- `GET /api/businesses` - Fetch organization businesses
- `POST /api/businesses` - Create new business
- `GET /api/businesses/[id]` - Get business details

### Locations
- `GET /api/locations` - Fetch business locations
- `POST /api/locations` - Create new location
- `GET /api/locations/[id]` - Get location details

### Utilities
- `POST /api/upload` - Upload receipt image
- `GET /api/health` - Health check

## Production Deployment

### Railway (Recommended)

1. Push your code to a Git repository
2. Connect your repository to Railway
3. Add PostgreSQL service to your Railway project
4. Set environment variables in Railway dashboard:
   - `DATABASE_URL`: PostgreSQL connection string (auto-generated)
   - `NEXTAUTH_URL`: Your app URL (e.g., https://your-app.up.railway.app)
   - `NEXTAUTH_SECRET`: Random secret key (generate with `openssl rand -base64 32`)
5. Deploy and run database migrations:
   ```bash
   npx prisma db push
   ```

**Current Production URL**: https://expensetracker-production-3f27.up.railway.app

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Vercel (requires PostgreSQL setup)
- Netlify (requires PostgreSQL setup)
- Heroku (with PostgreSQL add-on)
- AWS (with RDS PostgreSQL)
- Google Cloud (with Cloud SQL)
- Azure (with PostgreSQL service)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (development only)
- `npm run railway:connect` - Connect to Railway database

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma` and run migrations
2. **API Routes**: Add new routes in `src/app/api/`
3. **Components**: Create reusable components in `src/components/`
4. **Types**: Update TypeScript types in `src/types/`

## Getting Started - User Guide

### First Time Setup

1. **Sign Up**: Create an account at the application URL
2. **Organization Code**: 
   - Leave blank to create your own organization (you become the owner)
   - Enter an existing code to join an organization as an employee
3. **Sign In**: Use your credentials to access the dashboard

### Using the Application

1. **Add Expenses**: Go to "Add Expense" tab
   - Required: Title, Amount, Date, Business, Location, at least 1 Category
   - Optional: Vendor, Description, Expense Code
2. **Create Businesses**: Click "Add New" in Business section (inline creation)
3. **Create Locations**: Select a business, then click "Add New" in Location section
4. **View Analytics**: Go to "View Expenses" tab for statistics and filtering

### Organization Management

- **Owners**: Can create businesses, manage users, generate invite codes
- **Employees**: Can create expenses, may have business/location creation permissions
- **Invite Codes**: Generated automatically for each organization

## Current Status

✅ **Production Ready**: Fully deployed with all core features working
✅ **Multi-tenant**: Organization-based data isolation
✅ **Authentication**: Secure JWT-based user management
✅ **Business Management**: Inline business and location creation
✅ **Error Handling**: Form data persists on submission failure
✅ **Real-time Analytics**: Expense statistics and filtering

## Future Enhancements

- Expense deletion API endpoints
- Real OCR integration (Tesseract.js, Google Vision API)
- Export to CSV/PDF
- Budget tracking and alerts
- Multi-currency support
- Enhanced role-based permissions
- Mobile app (React Native)
- Dark mode
- Advanced data visualization charts
- Admin interface for organization management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
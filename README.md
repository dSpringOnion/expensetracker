# Expense Tracker

A full-stack expense tracking application built with Next.js, TypeScript, Tailwind CSS, and Prisma.

## Features

- **Manual Expense Entry**: Add expenses with title, amount, category, date, and description
- **Photo Upload**: Upload receipt photos with OCR integration (mock implementation)
- **Expense Dashboard**: View expenses with filtering and statistics
- **Categories**: Predefined expense categories for better organization
- **Statistics**: Track total expenses, monthly spending, and category breakdowns
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: NextAuth.js (basic setup)
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (see setup options below)

### Quick Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. **Set up permanent database** (choose one option):

   **🆓 Option A: Neon (Recommended - Free tier)**
   ```bash
   # 1. Go to https://neon.tech and create a project
   # 2. Copy your connection string
   # 3. Create .env file:
   echo 'DATABASE_URL="your-neon-connection-string"' > .env
   echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env
   echo 'NEXTAUTH_SECRET="your-random-secret"' >> .env
   ```

   **🆓 Option B: Supabase (Free tier)**
   ```bash
   # 1. Go to https://supabase.com and create a project
   # 2. Get connection string from Settings > Database
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

Copy `.env.example` to `.env` and update the values:

```env
# Required: PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/database_name"

# Required for authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### Migrating from SQLite (if applicable)

If you were using the SQLite version and want to migrate your data:

```bash
npm run db:migrate-from-sqlite
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   │   ├── auth/       # NextAuth configuration
│   │   ├── expenses/   # Expense CRUD operations
│   │   ├── upload/     # File upload handling
│   │   └── health/     # Health check endpoint
│   └── auth/           # Authentication pages
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── forms/         # Form components
│   └── dashboard/     # Dashboard components
├── lib/               # Utility functions
├── types/             # TypeScript type definitions
└── generated/         # Generated Prisma client
```

## Database Schema

### User
- id: Unique identifier
- email: User email (unique)
- name: User display name
- expenses: Related expenses

### Expense
- id: Unique identifier
- title: Expense title
- amount: Amount spent
- category: Expense category
- description: Optional description
- date: Expense date
- receiptUrl: Optional receipt image URL
- userId: Foreign key to User

## API Endpoints

- `GET /api/expenses` - Fetch user expenses
- `POST /api/expenses` - Create new expense
- `POST /api/upload` - Upload receipt image
- `GET /api/health` - Health check

## Deployment

### Railway

1. Push your code to a Git repository
2. Connect your repository to Railway
3. Set environment variables in Railway dashboard:
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXTAUTH_URL`: Your app URL
   - `NEXTAUTH_SECRET`: Random secret key

The app includes a `railway.toml` configuration file for deployment.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Vercel
- Netlify
- Heroku
- AWS
- Google Cloud
- Azure

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma` and run migrations
2. **API Routes**: Add new routes in `src/app/api/`
3. **Components**: Create reusable components in `src/components/`
4. **Types**: Update TypeScript types in `src/types/`

## Future Enhancements

- Real OCR integration (Tesseract.js, Google Vision API)
- Export to CSV/PDF
- Expense categories management
- Budget tracking and alerts
- Multi-currency support
- Expense sharing with other users
- Mobile app (React Native)
- Dark mode
- Data visualization charts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
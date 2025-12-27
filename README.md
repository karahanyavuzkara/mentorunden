# Mentorunden

A modern platform for connecting students with mentors. Built with Next.js, Express, TypeScript, and Supabase.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (React) + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database/Auth**: Supabase
- **Monorepo**: npm workspaces

## 📁 Folder Structure

```
mentorunden/
├── apps/
│   ├── web/              # Next.js frontend application
│   │   └── src/
│   │       ├── app/      # Next.js app router pages
│   │       ├── components/ # React components
│   │       ├── lib/      # Utilities and configs
│   │       └── styles/   # Global styles
│   └── api/              # Express backend API
│       └── src/
│           ├── routes/   # API routes
│           ├── controllers/ # Route controllers
│           └── lib/     # Utilities and configs
├── packages/
│   └── shared/           # Shared TypeScript types and utilities
│       └── src/
├── docs/                 # Documentation
└── package.json          # Root workspace configuration
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mentorunden
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_URL` - Your Supabase project URL (for backend)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for backend)

## 🏃 Running the Development Server

### Run both frontend and backend:
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

### Run individually:

**Frontend only:**
```bash
npm run dev:web
```

**Backend only:**
```bash
npm run dev:api
```

## 🧪 Testing the API

Check the health endpoint:
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{"status":"ok"}
```

## 🏗️ Building for Production

Build all packages:
```bash
npm run build
```

## 📝 Next Steps

1. **Set up Supabase Schema**:
   - Create database tables for users, mentors, and bookings
   - Set up Row Level Security (RLS) policies
   - Configure authentication

2. **Implement Booking Logic**:
   - Create booking routes in the API
   - Build booking UI components
   - Add calendar/availability management

3. **Add Features**:
   - User authentication and authorization
   - Mentor profile pages
   - Booking management dashboard
   - Payment integration (if needed)
   - Email notifications

## 📚 Scripts

- `npm run dev` - Run both web and API in development mode
- `npm run dev:web` - Run only the Next.js frontend
- `npm run dev:api` - Run only the Express API
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages

## 🔒 Security Notes

- Never commit `.env` files
- Keep service role keys secure and server-side only
- Use RLS policies in Supabase for data access control
- Validate and sanitize all user inputs

## 📄 License

[Add your license here]


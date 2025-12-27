# Mentorunden

A modern platform for connecting students with mentors. Built with Next.js, Express, TypeScript, and Supabase.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (React) + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database/Auth**: Supabase

## 📁 Folder Structure

```
mentorunden/
├── frontend/          # Next.js frontend application
│   └── src/
│       ├── app/       # Next.js app router pages
│       ├── components/ # React components
│       ├── lib/       # Utilities and configs
│       └── styles/    # Global styles
├── backend/           # Express backend API
│   └── src/
│       ├── routes/    # API routes
│       ├── controllers/ # Route controllers
│       └── lib/       # Utilities and configs
├── docs/              # Documentation
├── .env.example       # Environment variables template
└── README.md          # This file
```

## 🛠️ Installation

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (or copy from root `.env.example`):
```bash
cp ../.env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:4000)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (or copy from root `.env.example`):
```bash
cp ../.env.example .env
```

Edit `.env` and add your Supabase credentials:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `PORT` - Server port (default: 4000)

## 🏃 Running the Development Servers

### Frontend

From the `frontend/` directory:
```bash
npm run dev
```

The frontend will be available at: **http://localhost:3000**

### Backend

From the `backend/` directory:
```bash
npm run dev
```

The backend API will be available at: **http://localhost:4000**

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

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Backend
```bash
cd backend
npm run build
npm start
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

## 🔒 Security Notes

- Never commit `.env` or `.env.local` files
- Keep service role keys secure and server-side only
- Use RLS policies in Supabase for data access control
- Validate and sanitize all user inputs

## 📄 License

[Add your license here]

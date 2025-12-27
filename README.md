# Mentorunden

A modern, full-stack mentoring platform that connects students with experienced mentors. Built with Next.js, Express, TypeScript, and Supabase.

## 🎯 Overview

Mentorunden is a comprehensive platform that enables:
- **Students** to find and book sessions with mentors
- **Mentors** to manage their availability, expertise, and sessions
- **Admins** to manage content (blogs, collaboration videos)
- **Community** features including blogs and collaboration videos

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router) + React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: Supabase Auth

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Email**: Nodemailer (SMTP)
- **Authentication**: Supabase Auth (JWT)

### Database & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for avatars)
- **Row Level Security**: Supabase RLS policies

## 📁 Project Structure

```
mentorunden/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── admin/       # Admin panel
│   │   │   ├── availability/# Mentor availability management
│   │   │   ├── become-mentor/# Become a mentor page
│   │   │   ├── blog/        # Blog system (list, create, edit, detail)
│   │   │   ├── collab/      # Collaboration videos page
│   │   │   ├── dashboard/   # User dashboard
│   │   │   ├── mentors/     # Browse mentors & mentor detail
│   │   │   ├── profile/     # User profile management
│   │   │   ├── login/       # Authentication pages
│   │   │   └── signup/
│   │   ├── components/      # React components
│   │   │   ├── AdminRoute.tsx      # Admin-only route protection
│   │   │   ├── BookingModal.tsx    # Session booking modal
│   │   │   ├── Navbar.tsx          # Navigation bar
│   │   │   └── ProtectedRoute.tsx # Auth route protection
│   │   ├── contexts/        # React contexts
│   │   │   └── AuthContext.tsx     # Authentication context
│   │   ├── lib/             # Utilities
│   │   │   ├── calendar.ts         # Google Calendar/Meet utilities
│   │   │   ├── config.ts           # Configuration
│   │   │   └── supabaseClient.ts  # Supabase client
│   │   └── styles/          # Global styles
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   ├── bookings.ts  # Booking management
│   │   │   └── health.ts    # Health check
│   │   ├── middleware/      # Express middleware
│   │   │   └── auth.ts      # JWT authentication
│   │   ├── services/        # Business logic
│   │   │   └── emailService.ts # Email notifications
│   │   ├── lib/             # Utilities
│   │   │   ├── config.ts    # Configuration
│   │   │   └── supabaseClient.ts # Supabase client
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                     # Documentation & SQL scripts
│   ├── add-admin-flag.sql
│   ├── bookings-rls-policies.sql
│   ├── check-admin-status.sql
│   ├── collab-videos-schema.sql
│   ├── fix-blog-admin-rls.sql
│   ├── fix-collab-videos-rls.sql
│   ├── fix-video-ids.sql
│   ├── make-user-admin.sql
│   ├── reviews-schema.sql
│   └── update-video-thumbnails.sql
│
├── .env.example              # Environment variables template
├── .gitignore
└── README.md                 # This file
```

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login
- Email verification
- Password reset
- Role-based access control (Student, Mentor, Admin)
- Protected routes
- Admin panel access

### 👤 User Management
- User profiles with avatar upload
- Profile editing
- Role management (student/mentor/admin)
- User dashboard

### 👨‍🏫 Mentor Features
- Mentor profile creation
- Expertise management (tags: Cloud, AI, etc.)
- Hourly rate setting
- Availability management (weekly schedule)
- Session booking management
- Student list ("My Students")
- Session cancellation with email notifications
- Reviews and ratings

### 🎓 Student Features
- Browse mentors with search and filters
- View mentor profiles
- Book sessions with Google Calendar integration
- Google Meet link generation
- Mentor list ("My Mentors")
- Leave reviews and ratings
- View upcoming sessions

### 📅 Booking System
- Session booking with date/time selection
- Duration selection
- Google Calendar integration
- Google Meet link generation
- Booking status management (pending, confirmed, completed, cancelled)
- Email notifications for cancellations

### 📝 Blog System
- Create, read, update, delete blog posts
- Featured images
- Excerpt support
- Publish/draft status
- View count tracking
- Author information
- Admin management

### 🎥 Collaboration Videos
- YouTube video embedding
- Video management (add, edit, delete)
- Display order control
- Active/inactive status
- Thumbnail support
- Admin management

### ⭐ Review System
- 5-star rating system
- Comment support
- Mentor rating aggregation
- Review display on mentor profiles

### 🎨 Admin Panel
- Collab videos management (CRUD)
- Blog management (CRUD, publish/unpublish)
- User role management
- Content moderation

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Gmail account (for email notifications)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mentorunden
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=4000
NODE_ENV=development
NODE_TLS_REJECT_UNAUTHORIZED=0

# Email Configuration (for booking cancellations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
WEB_URL=http://localhost:3000
```

**Note**: For Gmail, you need to generate an [App Password](https://support.google.com/accounts/answer/185833).

### 4. Database Setup

Run the following SQL scripts in Supabase SQL Editor (in order):

1. **Database Schema** (create tables):
   - `docs/collab-videos-schema.sql` - Collab videos table
   - `docs/reviews-schema.sql` - Reviews table
   - (Blogs table should be created via Supabase dashboard or migration)

2. **RLS Policies**:
   - `docs/bookings-rls-policies.sql` - Booking-related policies
   - `docs/fix-blog-admin-rls.sql` - Blog admin policies
   - `docs/fix-collab-videos-rls.sql` - Collab videos admin policies

3. **Admin Setup**:
   - `docs/add-admin-flag.sql` - Add is_admin column
   - `docs/make-user-admin.sql` - Make a user admin

4. **Storage Setup**:
   - Create `avatars` bucket in Supabase Storage
   - Set public access
   - Configure RLS policies for avatar access

## 🏃 Running the Development Servers

### Frontend
```bash
cd frontend
npm run dev
```
Frontend runs at: **http://localhost:3000**

### Backend
```bash
cd backend
npm run dev
```
Backend API runs at: **http://localhost:4000**

## 📊 Database Schema

### Tables

#### `profiles`
- User profiles with role (student/mentor/admin)
- `is_admin` flag for admin access
- Avatar URL, full name, bio

#### `mentors`
- Mentor-specific information
- Expertise tags (JSONB array)
- Hourly rate
- Availability schedule (JSONB)
- Rating and total sessions

#### `bookings`
- Session bookings
- Status: pending, confirmed, completed, cancelled
- Google Meet links
- Start/end times

#### `blogs`
- Blog posts
- Title, content, excerpt
- Featured image
- Published/draft status
- View count

#### `collab_videos`
- YouTube collaboration videos
- Video ID, title, description
- Thumbnail URL
- Display order
- Active/inactive status

#### `reviews`
- Mentor reviews
- Rating (1-5 stars)
- Optional comments
- Unique constraint (one review per student per mentor)

## 🔌 API Endpoints

### Health Check
- `GET /health` - Server health status

### Bookings
- `POST /bookings/:id/cancel` - Cancel a booking (mentor only)
  - Requires authentication
  - Sends email notification to student

## 🎨 Key Pages

### Public Pages
- `/` - Landing page with search
- `/mentors` - Browse mentors (search & filter)
- `/mentors/[id]` - Mentor detail page with booking
- `/blog` - Blog listing
- `/blog/[id]` - Blog detail
- `/collab` - Collaboration videos
- `/become-mentor` - Mentor application info

### Authenticated Pages
- `/dashboard` - User dashboard
- `/profile` - Profile management
- `/availability` - Mentor availability management
- `/blog/create` - Create blog post
- `/blog/[id]/edit` - Edit blog post

### Admin Pages
- `/admin` - Admin panel (videos & blogs management)

## 🔒 Security Features

- Row Level Security (RLS) policies in Supabase
- JWT authentication
- Protected routes (frontend & backend)
- Role-based access control
- Input validation
- Secure file uploads (avatars)

## 📧 Email Notifications

- Booking cancellation emails (sent to students)
- SMTP configuration via environment variables
- HTML-formatted emails

## 🎯 User Roles

### Student
- Browse and book mentor sessions
- Leave reviews
- Manage profile
- View upcoming sessions

### Mentor
- Manage profile (expertise, hourly rate)
- Set availability
- View and manage bookings
- Cancel sessions (with email notification)
- View students

### Admin
- Manage collab videos
- Manage blog posts
- Can be both mentor and admin

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
```

Set environment variables in deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

### Backend (Railway/Render/Heroku)
```bash
cd backend
npm run build
npm start
```

Set environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT`
- `SMTP_*` variables
- `WEB_URL`

## 🧪 Testing

### Health Check
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{"status":"ok"}
```

## 📝 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend (.env)
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PORT=4000
NODE_ENV=development
NODE_TLS_REJECT_UNAUTHORIZED=0

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
WEB_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### SSL Certificate Issues (Development)
If you encounter SSL certificate errors, the backend `.env` includes:
```env
NODE_TLS_REJECT_UNAUTHORIZED=0
```
**Warning**: Only use this in development!

### Admin Access
To make a user admin:
1. Run `docs/make-user-admin.sql` in Supabase SQL Editor
2. Update the email in the SQL script
3. Refresh the application

### Thumbnail Issues
If video thumbnails don't show:
1. Run `docs/fix-video-ids.sql` to clean video IDs
2. Run `docs/update-video-thumbnails.sql` to regenerate thumbnails

### RLS Policy Errors
If you get "row-level security policy" errors:
1. Check if you're logged in
2. Verify your role in the `profiles` table
3. Run the appropriate RLS policy scripts from `docs/`

## 📚 Documentation

All SQL scripts and documentation are in the `docs/` directory:
- Database schemas
- RLS policies
- Admin setup scripts
- Troubleshooting scripts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add your license here]

## 👥 Authors

- Karahan Yavuz KARA
- Baran Okan

## 🙏 Acknowledgments

- Built with Next.js, Express, and Supabase
- UI components styled with Tailwind CSS
- Email notifications via Nodemailer

---

**Note**: This is an MVP (Minimum Viable Product) version. Future enhancements may include payment integration, video calls, messaging, and more advanced features.

# Database Setup Guide

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Run the Schema

1. Open the file `docs/database-schema.sql` in this project
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press `Cmd/Ctrl + Enter`)

## Step 3: Verify Tables Were Created

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - `profiles` - User profiles
   - `mentors` - Mentor information
   - `bookings` - Booking records

## What Was Created?

### Tables:
- **profiles**: Extends Supabase auth.users with additional user info (name, role, bio)
- **mentors**: Mentor-specific information (expertise, hourly rate, availability)
- **bookings**: Booking records linking students to mentors

### Security:
- **Row Level Security (RLS)** enabled on all tables
- **Policies** set up so:
  - Users can only see/edit their own data
  - Anyone can view active mentors (for browsing)
  - Students can create bookings
  - Mentors can manage their own bookings

### Features:
- Automatic profile creation when a user signs up
- Automatic `updated_at` timestamp updates
- Indexes for better query performance

## Next Steps

After running the schema:
1. ✅ Database tables are ready
2. ✅ Security policies are in place
3. Next: Set up authentication in your app!


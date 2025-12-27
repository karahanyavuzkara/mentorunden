-- Bookings RLS Policies for My Students / My Mentors
-- Run this in Supabase SQL Editor if bookings table RLS policies don't allow viewing related profiles

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Mentors can view student profiles for bookings" ON profiles;
DROP POLICY IF EXISTS "Students can view mentor profiles for bookings" ON profiles;

-- Policy: Allow viewing student profiles for mentors (for My Students)
-- This allows mentors to see student profile info (name, avatar) for their bookings
CREATE POLICY "Mentors can view student profiles for bookings"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      JOIN mentors ON mentors.id = bookings.mentor_id
      WHERE bookings.student_id = profiles.id
      AND mentors.user_id = auth.uid()
    )
  );

-- Policy: Allow viewing mentor profiles for students (for My Mentors)
-- This allows students to see mentor profile info (name, avatar) for their bookings
CREATE POLICY "Students can view mentor profiles for bookings"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      JOIN mentors ON mentors.id = bookings.mentor_id
      WHERE bookings.student_id = auth.uid()
      AND mentors.user_id = profiles.id
    )
  );


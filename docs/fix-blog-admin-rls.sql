-- Fix RLS policies for blogs table to allow admins to delete and update
-- Run this in Supabase SQL Editor

-- First, make sure is_admin column exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can update blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can delete blogs" ON blogs;

-- Policy: Admins can view all blogs (including unpublished)
CREATE POLICY "Admins can view all blogs"
  ON blogs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
    OR published = true  -- Also allow public published blogs
  );

-- Policy: Admins can update any blog
CREATE POLICY "Admins can update blogs"
  ON blogs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Policy: Admins can delete any blog
CREATE POLICY "Admins can delete blogs"
  ON blogs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Verify your admin status
-- Replace 'your-email@example.com' with your email
SELECT 
  id,
  email,
  role,
  is_admin,
  CASE 
    WHEN role = 'admin' OR is_admin = true THEN '✅ IS ADMIN'
    ELSE '❌ NOT ADMIN'
  END as admin_status
FROM profiles 
WHERE email = 'your-email@example.com';


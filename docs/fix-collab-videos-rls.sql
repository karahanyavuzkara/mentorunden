-- Fix RLS policies for collab_videos table
-- This ensures admins (both role='admin' and is_admin=true) can manage videos
-- Run this in Supabase SQL Editor

-- First, make sure is_admin column exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all collab videos" ON collab_videos;
DROP POLICY IF EXISTS "Admins can insert collab videos" ON collab_videos;
DROP POLICY IF EXISTS "Admins can update collab videos" ON collab_videos;
DROP POLICY IF EXISTS "Admins can delete collab videos" ON collab_videos;

-- Policy: Admins can view all videos (including inactive)
CREATE POLICY "Admins can view all collab videos"
  ON collab_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Policy: Admins can insert videos
CREATE POLICY "Admins can insert collab videos"
  ON collab_videos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Policy: Admins can update videos
CREATE POLICY "Admins can update collab videos"
  ON collab_videos FOR UPDATE
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

-- Policy: Admins can delete videos
CREATE POLICY "Admins can delete collab videos"
  ON collab_videos FOR DELETE
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


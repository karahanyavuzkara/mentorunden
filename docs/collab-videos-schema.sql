-- Collab Videos Table
-- Run this in Supabase SQL Editor

-- Create collab_videos table
CREATE TABLE IF NOT EXISTS collab_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_id TEXT NOT NULL UNIQUE,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_collab_videos_active ON collab_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_collab_videos_order ON collab_videos(display_order);

-- Enable RLS
ALTER TABLE collab_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Anyone can view active videos (public)
DROP POLICY IF EXISTS "Anyone can view active collab videos" ON collab_videos;
CREATE POLICY "Anyone can view active collab videos"
  ON collab_videos FOR SELECT
  USING (is_active = true);

-- Policy: Admins can view all videos (including inactive)
-- Check both role = 'admin' and is_admin = true
DROP POLICY IF EXISTS "Admins can view all collab videos" ON collab_videos;
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
DROP POLICY IF EXISTS "Admins can insert collab videos" ON collab_videos;
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
DROP POLICY IF EXISTS "Admins can update collab videos" ON collab_videos;
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
DROP POLICY IF EXISTS "Admins can delete collab videos" ON collab_videos;
CREATE POLICY "Admins can delete collab videos"
  ON collab_videos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_collab_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_collab_videos_updated_at ON collab_videos;

-- Trigger to update updated_at
CREATE TRIGGER update_collab_videos_updated_at
  BEFORE UPDATE ON collab_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_collab_videos_updated_at();


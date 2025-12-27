-- Blog Table Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================
-- BLOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT, -- Short summary/preview
  featured_image TEXT, -- URL to featured image
  published BOOLEAN DEFAULT false, -- Draft vs Published
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published blogs
CREATE POLICY "Anyone can view published blogs"
  ON blogs FOR SELECT
  USING (published = true);

-- Policy: Authors can view their own blogs (including drafts)
CREATE POLICY "Authors can view own blogs"
  ON blogs FOR SELECT
  USING (auth.uid() = author_id);

-- Policy: Authenticated users can create blogs
CREATE POLICY "Authenticated users can create blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policy: Authors can update their own blogs
CREATE POLICY "Authors can update own blogs"
  ON blogs FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy: Authors can delete their own blogs
CREATE POLICY "Authors can delete own blogs"
  ON blogs FOR DELETE
  USING (auth.uid() = author_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);


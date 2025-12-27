-- Reviews/Ratings Table for Mentors
-- Run this in Supabase SQL Editor

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a student can only review a mentor once
  UNIQUE(mentor_id, student_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_mentor_id ON reviews(mentor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_student_id ON reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drop existing policies if they exist (for updates/re-runs)
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Students can create reviews" ON reviews;
DROP POLICY IF EXISTS "Students can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Students can delete their own reviews" ON reviews;

-- Policy: Anyone can view reviews (public)
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

-- Policy: Any authenticated student can create reviews
CREATE POLICY "Students can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'student'
    )
  );

-- Policy: Students can update their own reviews
CREATE POLICY "Students can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Policy: Students can delete their own reviews
CREATE POLICY "Students can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = student_id);

-- Function to update mentor rating when a review is created/updated/deleted
CREATE OR REPLACE FUNCTION update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update mentor's average rating
  UPDATE mentors
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews
    WHERE reviews.mentor_id = COALESCE(NEW.mentor_id, OLD.mentor_id)
  )
  WHERE id = COALESCE(NEW.mentor_id, OLD.mentor_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_mentor_rating_on_review ON reviews;
DROP TRIGGER IF EXISTS update_mentor_rating_on_delete ON reviews;

-- Trigger to update rating on insert/update
CREATE TRIGGER update_mentor_rating_on_review
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_rating();

-- Trigger to update rating on delete
CREATE TRIGGER update_mentor_rating_on_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;

-- Trigger to update updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


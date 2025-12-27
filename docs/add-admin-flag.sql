-- Add is_admin flag to profiles table
-- This allows users to be both mentor and admin
-- Run this in Supabase SQL Editor

-- Add is_admin column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Update existing admin users (if any role = 'admin')
UPDATE profiles 
SET is_admin = true 
WHERE role = 'admin';

-- Optional: You can set a user as both mentor and admin
-- Example:
-- UPDATE profiles 
-- SET role = 'mentor', is_admin = true 
-- WHERE email = 'your-email@example.com';


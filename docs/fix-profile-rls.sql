-- Fix RLS Policy for Profile Updates
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- This fixes the "new row violates row-level security policy" error

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate the update policy with both USING and WITH CHECK clauses
-- USING: checks if user can access the existing row
-- WITH CHECK: validates the new row values after update
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile';


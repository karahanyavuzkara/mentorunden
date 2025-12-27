-- Make a user admin
-- Replace 'your-email@example.com' with the actual email address
-- Run this in Supabase SQL Editor

-- Option 1: Make user admin only (not mentor)
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';

-- Option 2: Make user both mentor AND admin
UPDATE profiles 
SET role = 'mentor', is_admin = true 
WHERE email = 'your-email@example.com';

-- Option 3: Make user admin with role = 'admin' (old way, still works)
UPDATE profiles 
SET role = 'admin', is_admin = true 
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, role, is_admin 
FROM profiles 
WHERE email = 'your-email@example.com';


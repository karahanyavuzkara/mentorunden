-- Check if a user is admin
-- Replace 'your-email@example.com' with your actual email
-- Run this in Supabase SQL Editor

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

-- If the query returns no results, the user doesn't exist
-- If is_admin is NULL or false and role is not 'admin', user is not admin


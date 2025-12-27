-- Update thumbnail URLs for existing videos
-- This will regenerate thumbnail URLs based on video_id
-- Run this in Supabase SQL Editor

UPDATE collab_videos
SET thumbnail_url = 'https://img.youtube.com/vi/' || video_id || '/maxresdefault.jpg'
WHERE thumbnail_url IS NULL 
   OR thumbnail_url NOT LIKE '%' || video_id || '%'
   OR video_id IS NOT NULL;

-- Verify the update
SELECT 
  id,
  title,
  video_id,
  thumbnail_url,
  CASE 
    WHEN thumbnail_url LIKE '%' || video_id || '%' THEN '✅ Valid'
    ELSE '❌ Invalid'
  END as thumbnail_status
FROM collab_videos
ORDER BY created_at DESC;


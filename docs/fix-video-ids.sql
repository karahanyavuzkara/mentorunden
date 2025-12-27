-- Fix video IDs by removing ?si=... parameters and update thumbnail URLs
-- Run this in Supabase SQL Editor

-- Update video_id to remove query parameters (?si=...)
UPDATE collab_videos
SET 
  video_id = SPLIT_PART(video_id, '?', 1),
  thumbnail_url = 'https://img.youtube.com/vi/' || SPLIT_PART(video_id, '?', 1) || '/maxresdefault.jpg'
WHERE video_id LIKE '%?%';

-- Verify the update
SELECT 
  id,
  title,
  video_id,
  thumbnail_url,
  CASE 
    WHEN video_id NOT LIKE '%?%' AND video_id NOT LIKE '%&%' THEN '✅ Clean'
    ELSE '❌ Has parameters'
  END as video_id_status,
  CASE 
    WHEN thumbnail_url LIKE '%' || SPLIT_PART(video_id, '?', 1) || '%' THEN '✅ Valid'
    ELSE '❌ Invalid'
  END as thumbnail_status
FROM collab_videos
ORDER BY created_at DESC;


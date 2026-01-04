-- Drop the conflicting RLS policy that bypasses moderation_status check
DROP POLICY IF EXISTS "Anyone can view active feed posts" ON feed_posts;
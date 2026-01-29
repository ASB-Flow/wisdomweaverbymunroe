-- Fix: User email addresses exposed to all authenticated users
-- The current "Authenticated users can view display names" policy exposes the email column
-- We need to restrict users to only see their own full profile, while allowing others to see display_name and avatar_url

-- Step 1: Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view display names" ON public.profiles;

-- Step 2: Create policy allowing users to view their own complete profile
CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Step 3: The comments_with_profiles view already uses a SECURITY DEFINER approach
-- through joins with profiles, but we need to recreate it to work with the new policy
-- Drop the existing view first
DROP VIEW IF EXISTS public.comments_with_profiles;

-- Step 4: Create a helper function to safely get profile display info
-- This allows viewing display_name and avatar_url of any user for comment display purposes
CREATE OR REPLACE FUNCTION public.get_profile_display_info(p_user_id uuid)
RETURNS TABLE(display_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = p_user_id
  LIMIT 1;
$$;

-- Step 5: Recreate the comments_with_profiles view using the secure function
CREATE VIEW public.comments_with_profiles
WITH (security_invoker = on) AS
SELECT 
  c.id,
  c.teaching_id,
  c.content,
  c.created_at,
  c.updated_at,
  (SELECT display_name FROM public.get_profile_display_info(c.user_id)) as display_name,
  (SELECT avatar_url FROM public.get_profile_display_info(c.user_id)) as avatar_url,
  CASE WHEN c.user_id = auth.uid() THEN true ELSE false END as is_own_comment
FROM public.comments c;
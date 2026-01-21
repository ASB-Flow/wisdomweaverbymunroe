-- Add a policy to allow authenticated users to view display_name and avatar_url from profiles
-- This allows comments to show author names without exposing user_id directly through client code

CREATE POLICY "Authenticated users can view display names"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: The existing "Users can view own profile" policy is RESTRICTIVE
-- We need to drop it and recreate it as PERMISSIVE to work with the new policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Recreate as PERMISSIVE so both policies can work
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
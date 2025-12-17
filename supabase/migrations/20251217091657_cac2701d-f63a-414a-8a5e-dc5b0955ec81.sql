-- Add UPDATE policy to user_roles - only admins can update roles
CREATE POLICY "Only admins can update roles" ON public.user_roles
FOR UPDATE USING (is_admin());

-- Add DELETE policy to user_roles - only admins can delete roles
CREATE POLICY "Only admins can delete roles" ON public.user_roles
FOR DELETE USING (is_admin());
-- Create a view for comments that hides raw user_id and includes profile info
CREATE VIEW public.comments_with_profiles
WITH (security_invoker = on) AS
SELECT 
  c.id,
  c.teaching_id,
  c.content,
  c.created_at,
  c.updated_at,
  p.display_name,
  p.avatar_url,
  -- Only expose if the current user owns this comment (for edit/delete buttons)
  CASE WHEN c.user_id = auth.uid() THEN true ELSE false END as is_own_comment
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.user_id;
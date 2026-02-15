-- Recreate the view with security_invoker to respect RLS on underlying tables
DROP VIEW IF EXISTS public.comments_with_profiles;

CREATE VIEW public.comments_with_profiles
WITH (security_invoker = on) AS
SELECT 
    c.id,
    c.teaching_id,
    c.content,
    c.created_at,
    c.updated_at,
    (SELECT get_profile_display_info.display_name FROM public.get_profile_display_info(c.user_id)) AS display_name,
    (SELECT get_profile_display_info.avatar_url FROM public.get_profile_display_info(c.user_id)) AS avatar_url,
    CASE WHEN c.user_id = auth.uid() THEN true ELSE false END AS is_own_comment
FROM public.comments c;
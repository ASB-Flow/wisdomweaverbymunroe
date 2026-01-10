-- Create enum for teaching status
CREATE TYPE public.teaching_status AS ENUM ('draft', 'review', 'published');

-- Create teachings table
CREATE TABLE public.teachings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_fr TEXT NOT NULL,
  theme TEXT NOT NULL,
  status teaching_status NOT NULL DEFAULT 'draft',
  content_fr TEXT NOT NULL DEFAULT '',
  youtube_url TEXT,
  social_posts JSONB,
  generated_design TEXT,
  visual_concepts JSONB,
  practical_tips JSONB,
  citations JSONB,
  principles JSONB,
  application_steps JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teachings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can view published teachings
CREATE POLICY "Anyone can view published teachings"
ON public.teachings
FOR SELECT
USING (status = 'published' OR is_admin());

-- Policy: Admins can insert teachings
CREATE POLICY "Admins can insert teachings"
ON public.teachings
FOR INSERT
WITH CHECK (is_admin());

-- Policy: Admins can update teachings
CREATE POLICY "Admins can update teachings"
ON public.teachings
FOR UPDATE
USING (is_admin());

-- Policy: Admins can delete teachings
CREATE POLICY "Admins can delete teachings"
ON public.teachings
FOR DELETE
USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_teachings_updated_at
BEFORE UPDATE ON public.teachings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
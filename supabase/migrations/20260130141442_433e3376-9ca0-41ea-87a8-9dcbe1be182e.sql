-- Add vitrine fields to toolbox_projects
ALTER TABLE public.toolbox_projects
ADD COLUMN show_in_vitrine BOOLEAN DEFAULT false,
ADD COLUMN vitrine_title TEXT,
ADD COLUMN vitrine_description TEXT;

-- Create policy for public access to vitrine projects
CREATE POLICY "Anyone can view vitrine projects"
ON public.toolbox_projects
FOR SELECT
USING (show_in_vitrine = true);
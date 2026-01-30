-- Add show_in_vitrine column to properties table
ALTER TABLE public.properties
ADD COLUMN show_in_vitrine BOOLEAN DEFAULT false;

-- Add RLS policy for public vitrine access
CREATE POLICY "Anyone can view vitrine properties"
ON public.properties
FOR SELECT
USING (show_in_vitrine = true AND status = 'available');
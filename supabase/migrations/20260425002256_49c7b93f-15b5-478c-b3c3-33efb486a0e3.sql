DROP VIEW IF EXISTS public.vitrine_projects_public;

CREATE VIEW public.vitrine_projects_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  project_type,
  inputs,
  results,
  vitrine_title,
  vitrine_description,
  show_in_vitrine,
  created_at,
  updated_at
FROM public.toolbox_projects
WHERE show_in_vitrine = true;

GRANT SELECT ON public.vitrine_projects_public TO anon, authenticated;

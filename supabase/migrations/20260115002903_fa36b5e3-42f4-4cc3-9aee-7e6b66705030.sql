-- Create toolbox_projects table for saving calculator simulations
CREATE TABLE public.toolbox_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('simulador', 'permuta', 'hbu', 'decisor')),
  name TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.toolbox_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own projects
CREATE POLICY "Users can view own projects"
ON public.toolbox_projects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
ON public.toolbox_projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON public.toolbox_projects
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON public.toolbox_projects
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all projects (for analytics)
CREATE POLICY "Admins can view all projects"
ON public.toolbox_projects
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Create trigger for automatic updated_at
CREATE TRIGGER update_toolbox_projects_updated_at
BEFORE UPDATE ON public.toolbox_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
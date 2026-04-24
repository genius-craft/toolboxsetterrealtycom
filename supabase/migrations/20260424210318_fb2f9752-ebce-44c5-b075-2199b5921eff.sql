-- Tabela de histórico de versões de projetos
CREATE TABLE public.project_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.toolbox_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  version_number integer NOT NULL,
  name text NOT NULL,
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  results jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_versions_project_id ON public.project_versions(project_id, version_number DESC);
CREATE INDEX idx_project_versions_user_id ON public.project_versions(user_id);

ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project versions"
ON public.project_versions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project versions"
ON public.project_versions FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true)
);

CREATE POLICY "Users can delete own project versions"
ON public.project_versions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all project versions"
ON public.project_versions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Função: ao atualizar um projeto, salvar snapshot da versão anterior
CREATE OR REPLACE FUNCTION public.snapshot_project_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version int;
BEGIN
  -- Só faz snapshot se inputs ou results mudaram
  IF (OLD.inputs IS DISTINCT FROM NEW.inputs) OR (OLD.results IS DISTINCT FROM NEW.results) OR (OLD.name IS DISTINCT FROM NEW.name) THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM public.project_versions WHERE project_id = OLD.id;

    INSERT INTO public.project_versions (project_id, user_id, version_number, name, inputs, results)
    VALUES (OLD.id, OLD.user_id, next_version, OLD.name, OLD.inputs, OLD.results);

    -- Limita a 20 versões mais recentes
    DELETE FROM public.project_versions
    WHERE project_id = OLD.id
      AND id NOT IN (
        SELECT id FROM public.project_versions
        WHERE project_id = OLD.id
        ORDER BY version_number DESC
        LIMIT 20
      );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_snapshot_project_version
BEFORE UPDATE ON public.toolbox_projects
FOR EACH ROW
EXECUTE FUNCTION public.snapshot_project_version();
-- =============================================================
-- Parte A: Tabela de rate limit por usuário
-- =============================================================
CREATE TABLE IF NOT EXISTS public.tool_chat_usage (
  user_id uuid NOT NULL,
  window_start timestamptz NOT NULL,
  request_count int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, window_start)
);

ALTER TABLE public.tool_chat_usage ENABLE ROW LEVEL SECURITY;

-- Sem policies = só service role pode ler/escrever (perfeito)
CREATE INDEX IF NOT EXISTS idx_tool_chat_usage_window
  ON public.tool_chat_usage (user_id, window_start DESC);

-- =============================================================
-- Parte B: Defaults de configuração
-- =============================================================
INSERT INTO public.tool_config (key, value, updated_at)
VALUES 
  ('chat_rate_limit_user', '30'::jsonb, now()),
  ('chat_rate_limit_admin', '120'::jsonb, now()),
  ('chat_payload_max_chars', '50000'::jsonb, now())
ON CONFLICT (key) DO NOTHING;

-- =============================================================
-- Parte C: CORREÇÃO CRÍTICA — restringir vitrine pública
-- =============================================================
-- Remove a policy aberta atual
DROP POLICY IF EXISTS "Anyone can view vitrine projects" ON public.toolbox_projects;

-- Cria view pública SEM user_id, inputs, results
CREATE OR REPLACE VIEW public.vitrine_projects_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  project_type,
  vitrine_title,
  vitrine_description,
  show_in_vitrine,
  created_at,
  updated_at
FROM public.toolbox_projects
WHERE show_in_vitrine = true;

GRANT SELECT ON public.vitrine_projects_public TO anon, authenticated;

-- Recria policy mas SEM expor dados sensíveis publicamente.
-- A view acima é o canal público. Para detalhe completo, exigir login + autorização explícita.
-- Mantemos uma policy restrita: apenas usuários autenticados aprovados podem ver os detalhes
-- (inputs/results) de projetos da vitrine.
CREATE POLICY "Approved users can view vitrine project details"
ON public.toolbox_projects
FOR SELECT
TO authenticated
USING (
  show_in_vitrine = true 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
      AND profiles.approved = true
  )
);

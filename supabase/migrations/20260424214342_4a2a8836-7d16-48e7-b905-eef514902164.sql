CREATE TABLE public.tool_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.tool_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage tool config"
ON public.tool_config
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Modelo padrão inicial
INSERT INTO public.tool_config (key, value)
VALUES ('openrouter_model', '"google/gemma-3-27b-it:free"'::jsonb)
ON CONFLICT (key) DO NOTHING;
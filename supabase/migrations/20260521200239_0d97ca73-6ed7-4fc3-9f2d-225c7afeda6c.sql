
-- =====================================================
-- 1. admin_notifications
-- =====================================================
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('new_signup','new_project','vitrine_published','lgpd_request')),
  title text NOT NULL,
  message text,
  link text,
  entity_id uuid,
  read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_notifications_unread ON public.admin_notifications (created_at DESC) WHERE read = false;
CREATE INDEX idx_admin_notifications_created ON public.admin_notifications (created_at DESC);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage notifications"
ON public.admin_notifications FOR ALL
USING (has_role(auth.uid(),'super_admin'))
WITH CHECK (has_role(auth.uid(),'super_admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
ALTER TABLE public.admin_notifications REPLICA IDENTITY FULL;

-- =====================================================
-- 2. lgpd_requests
-- =====================================================
CREATE TABLE public.lgpd_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  request_type text NOT NULL DEFAULT 'account_deletion' CHECK (request_type IN ('account_deletion','data_export')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.lgpd_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own lgpd requests"
ON public.lgpd_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins view all lgpd requests"
ON public.lgpd_requests FOR SELECT
USING (has_role(auth.uid(),'super_admin'));

CREATE POLICY "Users create own lgpd requests"
ON public.lgpd_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 3. Triggers — notificações automáticas
-- =====================================================

-- Novo cadastro (profile criado)
CREATE OR REPLACE FUNCTION public.notify_new_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, link, entity_id)
  VALUES (
    'new_signup',
    'Novo cadastro pendente',
    COALESCE(NEW.name, NEW.user_id::text) || ' aguarda aprovação',
    '/admin/users',
    NEW.user_id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_signup
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_new_signup();

-- Novo projeto criado
CREATE OR REPLACE FUNCTION public.notify_new_project()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_name text;
BEGIN
  SELECT name INTO user_name FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
  INSERT INTO public.admin_notifications (type, title, message, link, entity_id)
  VALUES (
    'new_project',
    'Novo projeto: ' || NEW.name,
    COALESCE(user_name,'Usuário') || ' criou um projeto do tipo ' || NEW.project_type,
    '/admin/projects',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_project
AFTER INSERT ON public.toolbox_projects
FOR EACH ROW EXECUTE FUNCTION public.notify_new_project();

-- Publicação na Vitrine
CREATE OR REPLACE FUNCTION public.notify_vitrine_published()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.show_in_vitrine = true AND (OLD.show_in_vitrine IS DISTINCT FROM true) THEN
    INSERT INTO public.admin_notifications (type, title, message, link, entity_id)
    VALUES (
      'vitrine_published',
      'Projeto publicado na Vitrine',
      NEW.name || ' agora está visível na Vitrine pública',
      '/vitrine',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_vitrine_published
AFTER UPDATE ON public.toolbox_projects
FOR EACH ROW EXECUTE FUNCTION public.notify_vitrine_published();

-- Solicitação LGPD
CREATE OR REPLACE FUNCTION public.notify_lgpd_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, link, entity_id)
  VALUES (
    'lgpd_request',
    'Solicitação LGPD',
    NEW.email || ' solicitou ' || (CASE WHEN NEW.request_type = 'account_deletion' THEN 'exclusão de conta' ELSE 'exportação de dados' END),
    '/admin/lgpd',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_lgpd_request
AFTER INSERT ON public.lgpd_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_lgpd_request();

-- =====================================================
-- 4. Seeds em tool_config
-- =====================================================
INSERT INTO public.tool_config (key, value) VALUES
  ('calc_defaults', jsonb_build_object(
    'vacancy_rate', 5,
    'igpm_annual', 4.5,
    'ipca_annual', 4.0,
    'admin_fee_pct', 5,
    'iptu_monthly', 0,
    'target_cap_rate', 0.8
  )),
  ('branding', jsonb_build_object(
    'logo_url', '',
    'primary_color', '#0F1B3D',
    'accent_color', '#C4A882',
    'cvm_disclaimer', 'As informações fornecidas têm caráter exclusivamente educacional e informativo, não constituindo recomendação de investimento, oferta ou solicitação de compra/venda de valores mobiliários, nos termos da regulamentação da Comissão de Valores Mobiliários (CVM). Resultados passados não garantem resultados futuros.',
    'lgpd_banner', 'Utilizamos cookies essenciais para o funcionamento da plataforma. Ao continuar navegando, você concorda com nossa política de privacidade.'
  )),
  ('ai_config', jsonb_build_object(
    'default_model', 'google/gemini-2.5-flash',
    'system_prompt', 'Você é um assistente especialista em análise imobiliária. Responda de forma objetiva e técnica.',
    'rate_limit_per_minute', 10,
    'feature_autofill_enabled', true,
    'feature_compare_enabled', true,
    'feature_pdf_summary_enabled', true,
    'feature_analyze_enabled', true
  )),
  ('email_templates', jsonb_build_object(
    'welcome', jsonb_build_object(
      'subject', 'Bem-vindo ao Setter Toolbox',
      'body', 'Olá {{name}}, sua conta foi criada e aguarda aprovação. Avisaremos assim que for liberada.'
    ),
    'approval', jsonb_build_object(
      'subject', 'Sua conta foi aprovada',
      'body', 'Olá {{name}}, sua conta no Setter Toolbox foi aprovada. Acesse: {{url}}'
    ),
    'lgpd_confirmation', jsonb_build_object(
      'subject', 'Confirmação de exclusão de dados (LGPD)',
      'body', 'Olá, confirmamos a exclusão da sua conta e de todos os dados associados conforme solicitado.'
    )
  ))
ON CONFLICT (key) DO NOTHING;

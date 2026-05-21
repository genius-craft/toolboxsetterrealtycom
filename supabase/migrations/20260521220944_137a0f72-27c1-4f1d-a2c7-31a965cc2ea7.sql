
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'Disponível',
  titulo text NOT NULL,
  imagem_url text,
  investimento_total text,
  cap_rate text,
  noi_anual text,
  receita_mensal text,
  opex text,
  descricao text,
  localizacao text,
  tipo_ativo text,
  inquilino_perfil text,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active deals"
  ON public.deals FOR SELECT
  USING (ativo = true);

CREATE POLICY "Admins manage all deals"
  ON public.deals FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.leads_investidores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  perfil_alocacao text NOT NULL,
  projeto_interesse text,
  deal_id uuid,
  consentimento_lgpd boolean NOT NULL DEFAULT false,
  consentimento_at timestamptz,
  ip_hash text,
  user_agent text,
  status text NOT NULL DEFAULT 'novo'
);

ALTER TABLE public.leads_investidores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.leads_investidores FOR INSERT
  WITH CHECK (consentimento_lgpd = true);

CREATE POLICY "Admins view leads"
  ON public.leads_investidores FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins update leads"
  ON public.leads_investidores FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_leads_investidores_updated_at
  BEFORE UPDATE ON public.leads_investidores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_leads_investidores_created_at ON public.leads_investidores(created_at DESC);
CREATE INDEX idx_deals_ativo_ordem ON public.deals(ativo, ordem);

INSERT INTO public.deals (status, titulo, investimento_total, cap_rate, noi_anual, receita_mensal, opex, descricao, localizacao, tipo_ativo, inquilino_perfil, ativo, ordem)
VALUES (
  'Fase de Estruturação',
  'Projeto Strip Mall – Araçatuba / SP',
  'R$ 6.740.000',
  '12% a.a. (1,00% a.m.) — alvo',
  'R$ 809.400',
  'R$ 71.000',
  'R$ 0 (Contrato NNN)',
  'Empreendimento comercial desenhado para o vetor de crescimento de Araçatuba, com receita estimada e diversificada entre duas operações de alta resiliência macroeconômica: Academia (R$ 58k/mês) e Drogaria (R$ 13k/mês).',
  'Araçatuba / SP',
  'Strip Mall',
  'Varejo essencial (Academia + Drogaria)',
  true,
  0
);

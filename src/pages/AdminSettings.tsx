import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save, Sliders, Bot, Palette, Mail } from 'lucide-react';

type ConfigMap = Record<string, any>;

const DEFAULTS = {
  calculator_defaults: {
    vacancy_rate: 5,
    igpm_rate: 4.5,
    ipca_rate: 4.0,
    admin_fee_pct: 8,
    iptu_pct: 1,
    condo_pct: 0,
  },
  ai_config: {
    model: 'google/gemini-2.5-flash',
    fallback_model: 'google/gemini-2.5-flash-lite',
    system_prompt:
      'Você é o TOOL, assistente da Setter Realty. Responda com base nos documentos fornecidos, de forma clara e objetiva.',
    max_requests_per_hour: 30,
    temperature: 0.3,
  },
  branding: {
    primary_color: '#0F1B3D',
    accent_color: '#C4A882',
    logo_url: '',
    legal_disclaimer:
      'Esta ferramenta possui caráter exclusivamente educacional e informativo, não constituindo oferta de investimento nos termos da CVM.',
  },
  email_templates: {
    sender_name: 'Setter Toolbox',
    sender_email: 'no-reply@setterrealty.com',
    welcome_subject: 'Bem-vindo à Setter Toolbox',
    welcome_body:
      'Olá {{name}}, seu cadastro foi recebido e está em análise. Em breve você será notificado.',
    approval_subject: 'Sua conta foi aprovada',
    approval_body: 'Olá {{name}}, sua conta foi aprovada. Acesse: {{link}}',
  },
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [cfg, setCfg] = useState<ConfigMap>(DEFAULTS);

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) navigate('/dashboard');
  }, [roleLoading, isSuperAdmin, navigate]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('tool_config').select('key, value');
      if (data) {
        const merged: ConfigMap = { ...DEFAULTS };
        for (const row of data as any[]) {
          merged[row.key] = { ...(DEFAULTS as any)[row.key], ...(row.value || {}) };
        }
        setCfg(merged);
      }
      setLoading(false);
    })();
  }, []);

  async function save(key: string) {
    setSaving(key);
    const { error } = await supabase
      .from('tool_config')
      .upsert({ key, value: cfg[key], updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setSaving(null);
    if (error) toast.error('Erro ao salvar: ' + error.message);
    else toast.success('Configurações salvas');
  }

  const update = (key: string, patch: Record<string, any>) =>
    setCfg((p) => ({ ...p, [key]: { ...p[key], ...patch } }));

  if (loading || roleLoading) {
    return (
      <AppLayout title="Configurações">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Configurações">
      <div className="container max-w-5xl py-8 space-y-6">
        <div>
          <p className="eyebrow text-accent">Super Admin</p>
          <h1 className="font-display text-3xl text-foreground">Configurações globais</h1>
          <p className="text-muted-foreground mt-1">
            Parâmetros padrão das calculadoras, IA, branding e e-mails.
          </p>
        </div>

        <Tabs defaultValue="calc">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="calc"><Sliders className="h-4 w-4 mr-2" />Parâmetros</TabsTrigger>
            <TabsTrigger value="ai"><Bot className="h-4 w-4 mr-2" />IA</TabsTrigger>
            <TabsTrigger value="brand"><Palette className="h-4 w-4 mr-2" />Branding</TabsTrigger>
            <TabsTrigger value="email"><Mail className="h-4 w-4 mr-2" />E-mails</TabsTrigger>
          </TabsList>

          <TabsContent value="calc">
            <Card>
              <CardHeader>
                <CardTitle>Parâmetros padrão das calculadoras</CardTitle>
                <CardDescription>Valores sugeridos ao iniciar novos projetos.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['vacancy_rate', 'Vacância padrão (%)'],
                  ['igpm_rate', 'IGPM anual (%)'],
                  ['ipca_rate', 'IPCA anual (%)'],
                  ['admin_fee_pct', 'Taxa de administração (%)'],
                  ['iptu_pct', 'IPTU (% sobre valor)'],
                  ['condo_pct', 'Condomínio (% sobre aluguel)'],
                ].map(([k, label]) => (
                  <div key={k} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={cfg.calculator_defaults[k]}
                      onChange={(e) =>
                        update('calculator_defaults', { [k]: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <Button onClick={() => save('calculator_defaults')} disabled={saving === 'calculator_defaults'}>
                    {saving === 'calculator_defaults' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar parâmetros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>Configuração da IA (TOOL)</CardTitle>
                <CardDescription>Modelos, prompt e limites de uso.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modelo principal</Label>
                    <Input value={cfg.ai_config.model} onChange={(e) => update('ai_config', { model: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Modelo fallback</Label>
                    <Input value={cfg.ai_config.fallback_model} onChange={(e) => update('ai_config', { fallback_model: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Limite por hora (requests/usuário)</Label>
                    <Input type="number" value={cfg.ai_config.max_requests_per_hour} onChange={(e) => update('ai_config', { max_requests_per_hour: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature (0–1)</Label>
                    <Input type="number" step="0.1" min="0" max="1" value={cfg.ai_config.temperature} onChange={(e) => update('ai_config', { temperature: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Prompt do sistema</Label>
                  <Textarea rows={6} value={cfg.ai_config.system_prompt} onChange={(e) => update('ai_config', { system_prompt: e.target.value })} />
                </div>
                <Button onClick={() => save('ai_config')} disabled={saving === 'ai_config'}>
                  {saving === 'ai_config' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar configuração da IA
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brand">
            <Card>
              <CardHeader>
                <CardTitle>Branding e textos legais</CardTitle>
                <CardDescription>Logo, cores e disclaimers exibidos no produto e PDFs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cor primária (hex)</Label>
                    <Input value={cfg.branding.primary_color} onChange={(e) => update('branding', { primary_color: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor de destaque (hex)</Label>
                    <Input value={cfg.branding.accent_color} onChange={(e) => update('branding', { accent_color: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>URL do logo</Label>
                    <Input value={cfg.branding.logo_url} onChange={(e) => update('branding', { logo_url: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Disclaimer CVM (exibido em rodapés e PDFs)</Label>
                    <Textarea rows={4} value={cfg.branding.legal_disclaimer} onChange={(e) => update('branding', { legal_disclaimer: e.target.value })} />
                  </div>
                </div>
                <Button onClick={() => save('branding')} disabled={saving === 'branding'}>
                  {saving === 'branding' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar branding
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Templates de e-mail</CardTitle>
                <CardDescription>Use {`{{name}}`} e {`{{link}}`} como placeholders.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do remetente</Label>
                    <Input value={cfg.email_templates.sender_name} onChange={(e) => update('email_templates', { sender_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail do remetente</Label>
                    <Input value={cfg.email_templates.sender_email} onChange={(e) => update('email_templates', { sender_email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assunto — Boas-vindas</Label>
                  <Input value={cfg.email_templates.welcome_subject} onChange={(e) => update('email_templates', { welcome_subject: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Corpo — Boas-vindas</Label>
                  <Textarea rows={4} value={cfg.email_templates.welcome_body} onChange={(e) => update('email_templates', { welcome_body: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Assunto — Aprovação</Label>
                  <Input value={cfg.email_templates.approval_subject} onChange={(e) => update('email_templates', { approval_subject: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Corpo — Aprovação</Label>
                  <Textarea rows={4} value={cfg.email_templates.approval_body} onChange={(e) => update('email_templates', { approval_body: e.target.value })} />
                </div>
                <Button onClick={() => save('email_templates')} disabled={saving === 'email_templates'}>
                  {saving === 'email_templates' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar templates
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

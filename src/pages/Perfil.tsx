import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, Download, Trash2, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Perfil() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!user) {
    return (
      <AppLayout title="Perfil">
        <div className="p-8 text-center text-muted-foreground">
          Faça login para acessar seu perfil.
        </div>
      </AppLayout>
    );
  }

  const handleExport = async () => {
    setExporting(true);
    try {
      const [{ data: profile }, { data: projects }, { data: lgpd }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('toolbox_projects').select('*').eq('user_id', user.id),
        supabase.from('lgpd_requests').select('*').eq('user_id', user.id),
      ]);

      const payload = {
        exported_at: new Date().toISOString(),
        account: { id: user.id, email: user.email, created_at: user.created_at },
        profile: profile ?? null,
        projects: projects ?? [],
        lgpd_history: lgpd ?? [],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `setter-toolbox-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Seus dados foram exportados.');
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível exportar seus dados.');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (confirmEmail.trim().toLowerCase() !== (user.email || '').toLowerCase()) {
      toast.error('E-mail de confirmação não confere.');
      return;
    }
    if (!confirmPassword) {
      toast.error('Informe sua senha.');
      return;
    }

    setDeleting(true);
    try {
      // Re-autenticar para confirmar a posse da conta
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: confirmPassword,
      });
      if (reauthError) {
        toast.error('Senha incorreta.');
        setDeleting(false);
        return;
      }

      const { error } = await supabase.functions.invoke('delete-user-account');
      if (error) throw error;

      toast.success('Conta excluída com sucesso.');
      await signOut();
      navigate('/auth');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Não foi possível excluir a conta.');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <AppLayout title="Meu Perfil">
      <div className="max-w-3xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="animate-fade-up">
          <h2 className="font-display text-3xl font-bold">Meu Perfil</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie sua conta, dados pessoais e configurações de privacidade.
          </p>
        </div>

        <Card className="animate-fade-up delay-75">
          <CardHeader>
            <CardTitle className="font-display">Conta</CardTitle>
            <CardDescription>Informações básicas da sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-muted-foreground">E-mail</span>
              <span className="col-span-2 font-medium">{user.email}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-muted-foreground">Membro desde</span>
              <span className="col-span-2 font-medium">
                {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-100 border-accent/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              <CardTitle className="font-display">Privacidade & LGPD</CardTitle>
            </div>
            <CardDescription>
              Você tem direitos garantidos pela Lei Geral de Proteção de Dados (LGPD).
              Exporte seus dados ou solicite a exclusão definitiva da sua conta a qualquer momento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-secondary/30">
              <div className="p-2 rounded-md bg-card border border-border">
                <Download className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Exportar meus dados</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Baixe um arquivo JSON com perfil, projetos e histórico de solicitações LGPD.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 mr-1" />}
                Exportar
              </Button>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="p-2 rounded-md bg-card border border-destructive/30">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-destructive">Excluir minha conta permanentemente</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Esta ação remove sua conta, perfil, projetos e todos os dados associados.
                  <strong className="text-destructive"> Não pode ser desfeita.</strong>
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed pt-2">
              Para dúvidas sobre tratamento de dados ou exercer outros direitos previstos na LGPD
              (art. 18), entre em contato com nosso Encarregado pelo email{' '}
              <a href="mailto:dpo@setterrealty.com" className="text-accent hover:underline">
                dpo@setterrealty.com
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={(o) => !deleting && setDeleteOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Excluir conta permanentemente
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                Esta ação irá remover <strong>permanentemente</strong>:
              </span>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Sua conta e dados de autenticação</li>
                <li>Seu perfil e informações cadastrais</li>
                <li>Todos os seus projetos e simulações</li>
                <li>Histórico de versões e exportações</li>
              </ul>
              <span className="block text-destructive font-medium">
                Esta ação não pode ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="confirm-email" className="text-xs">
                Digite seu e-mail para confirmar
              </Label>
              <Input
                id="confirm-email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={user.email || ''}
                disabled={deleting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs">
                Confirme com sua senha
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={deleting}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir permanentemente'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

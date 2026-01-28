import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2, Users, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  approved: boolean;
  approved_at: string | null;
  created_at: string | null;
  email?: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (profile: UserProfile) => {
    setActionLoading(profile.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Usuário aprovado!',
        description: `${profile.name || 'Usuário'} agora pode acessar o sistema.`,
      });

      fetchProfiles();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (profile: UserProfile) => {
    setActionLoading(profile.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Cadastro rejeitado',
        description: 'O usuário foi removido do sistema.',
      });

      fetchProfiles();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingUsers = profiles.filter((p) => !p.approved);
  const approvedUsers = profiles.filter((p) => p.approved);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{pendingUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{approvedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Usuários Pendentes
          </CardTitle>
          <CardDescription>
            Usuários que aguardam aprovação para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum usuário pendente de aprovação
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.name || 'Sem nome'}
                    </TableCell>
                    <TableCell>{profile.phone || '-'}</TableCell>
                    <TableCell>
                      {profile.created_at
                        ? format(new Date(profile.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleApprove(profile)}
                          disabled={actionLoading === profile.id}
                        >
                          {actionLoading === profile.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          <span className="ml-1">Aprovar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleReject(profile)}
                          disabled={actionLoading === profile.id}
                        >
                          {actionLoading === profile.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="ml-1">Rejeitar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approved Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Usuários Aprovados
          </CardTitle>
          <CardDescription>
            Usuários com acesso liberado ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum usuário aprovado ainda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data de Aprovação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedUsers.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.name || 'Sem nome'}
                    </TableCell>
                    <TableCell>{profile.phone || '-'}</TableCell>
                    <TableCell>
                      {profile.approved_at
                        ? format(new Date(profile.approved_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Aprovado
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

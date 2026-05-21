import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Download, Trash2 } from 'lucide-react';

interface LgpdRow {
  id: string;
  email: string;
  request_type: string;
  status: string;
  requested_at: string;
  completed_at: string | null;
}

export default function AdminLgpd() {
  const navigate = useNavigate();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [rows, setRows] = useState<LgpdRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) navigate('/dashboard');
  }, [roleLoading, isSuperAdmin, navigate]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('lgpd_requests')
        .select('*')
        .order('requested_at', { ascending: false });
      setRows((data || []) as LgpdRow[]);
      setLoading(false);
    })();
  }, []);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

  return (
    <AppLayout title="Solicitações LGPD">
      <div className="container max-w-6xl py-8 space-y-6">
        <div>
          <p className="eyebrow text-accent">Privacidade</p>
          <h1 className="font-display text-3xl text-foreground flex items-center gap-2">
            <Shield className="h-7 w-7 text-accent" /> Solicitações LGPD
          </h1>
          <p className="text-muted-foreground mt-1">
            Histórico de pedidos de exportação e exclusão de dados.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico ({rows.length})</CardTitle>
            <CardDescription>Auditoria de solicitações registradas pelos usuários.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : rows.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">Nenhuma solicitação registrada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Solicitado</TableHead>
                    <TableHead>Concluído</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.email}</TableCell>
                      <TableCell>
                        <Badge variant={r.request_type === 'account_deletion' ? 'destructive' : 'secondary'}>
                          {r.request_type === 'account_deletion' ? (
                            <><Trash2 className="h-3 w-3 mr-1" />Exclusão</>
                          ) : (
                            <><Download className="h-3 w-3 mr-1" />Exportação</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'completed' ? 'default' : 'outline'}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(r.requested_at)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(r.completed_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

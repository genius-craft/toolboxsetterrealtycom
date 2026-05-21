import { useEffect, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, Plus, Pencil, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DealFormDialog } from "@/components/investidores/DealFormDialog";
import type { Deal } from "@/components/investidores/DealCard";
import { PERFIL_LABEL } from "@/lib/investidores/schemas";

interface Lead {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  whatsapp: string;
  perfil_alocacao: string;
  projeto_interesse: string | null;
  status: string;
}

const LEAD_STATUS = ["novo", "contatado", "qualificado", "descartado"];

export default function InvestidoresAdmin() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const [d, l] = await Promise.all([
      supabase.from("deals").select("*").order("ordem").order("created_at", { ascending: false }),
      supabase.from("leads_investidores").select("*").order("created_at", { ascending: false }),
    ]);
    if (d.error) toast.error(d.error.message);
    if (l.error) toast.error(l.error.message);
    setDeals((d.data as any) || []);
    setLeads((l.data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const toggleAtivo = async (deal: Deal) => {
    const { error } = await supabase
      .from("deals")
      .update({ ativo: !deal.ativo })
      .eq("id", deal.id);
    if (error) return toast.error(error.message);
    setDeals((prev) => prev.map((d) => (d.id === deal.id ? { ...d, ativo: !d.ativo } : d)));
  };

  const updateLeadStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("leads_investidores")
      .update({ status })
      .eq("id", id);
    if (error) return toast.error(error.message);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      return (
        l.nome.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.projeto_interesse || "").toLowerCase().includes(q)
      );
    });
  }, [leads, search, statusFilter]);

  const exportCsv = () => {
    const headers = ["Data", "Nome", "Email", "WhatsApp", "Perfil", "Projeto", "Status"];
    const rows = filteredLeads.map((l) => [
      new Date(l.created_at).toLocaleString("pt-BR"),
      l.nome,
      l.email,
      l.whatsapp,
      PERFIL_LABEL[l.perfil_alocacao as keyof typeof PERFIL_LABEL] || l.perfil_alocacao,
      l.projeto_interesse || "",
      l.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-investidores-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="container max-w-7xl py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vitrine de Investidores</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie ativos publicados em <code>/investidores</code> e leads captados.
          </p>
        </div>
        <a href="/investidores" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" /> Abrir página pública
          </Button>
        </a>
      </header>

      <Tabs defaultValue="deals">
        <TabsList>
          <TabsTrigger value="deals">Ativos ({deals.length})</TabsTrigger>
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
        </TabsList>

        {/* DEALS */}
        <TabsContent value="deals" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar novo ativo
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Cap Rate</TableHead>
                  <TableHead>Investimento</TableHead>
                  <TableHead>Visível</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : deals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Nenhum ativo cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  deals.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.titulo}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{d.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {d.localizacao || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{d.cap_rate || "—"}</TableCell>
                      <TableCell className="text-sm">{d.investimento_total || "—"}</TableCell>
                      <TableCell>
                        <Switch checked={d.ativo} onCheckedChange={() => toggleAtivo(d)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(d);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* LEADS */}
        <TabsContent value="leads" className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2 flex-1 max-w-xl">
              <Input
                placeholder="Buscar por nome, e-mail ou projeto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  {LEAD_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Nenhum lead.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(l.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium">{l.nome}</TableCell>
                      <TableCell className="text-sm">
                        <div>{l.email}</div>
                        <a
                          href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          {l.whatsapp}
                        </a>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px]">
                        {PERFIL_LABEL[l.perfil_alocacao as keyof typeof PERFIL_LABEL] ||
                          l.perfil_alocacao}
                      </TableCell>
                      <TableCell className="text-sm">{l.projeto_interesse || "—"}</TableCell>
                      <TableCell>
                        <Select
                          value={l.status}
                          onValueChange={(v) => updateLeadStatus(l.id, v)}
                        >
                          <SelectTrigger className="w-36 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_STATUS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <DealFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={editing}
        onSaved={load}
      />
    </div>
  );
}

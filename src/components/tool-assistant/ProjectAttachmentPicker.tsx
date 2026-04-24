import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Calculator,
  Repeat,
  Building2,
  CheckCircle2,
  Target,
  Search,
  Star,
} from "lucide-react";

export interface ProjectAttachment {
  projectId: string;
  name: string;
  projectType: string;
  ownerLabel: string;
  summary: string;
}

interface ProjectRow {
  id: string;
  name: string;
  project_type: string;
  inputs: Record<string, any> | null;
  results: Record<string, any> | null;
  updated_at: string;
  user_id: string;
  show_in_vitrine: boolean;
  vitrine_title?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAttach: (attachment: ProjectAttachment) => void;
  alreadyAttachedIds: string[];
}

const TYPE_META: Record<
  string,
  { label: string; icon: any }
> = {
  simulador: { label: "Simulador", icon: Calculator },
  permuta: { label: "Permuta", icon: Repeat },
  hbu: { label: "H&BU", icon: Building2 },
  decisor: { label: "Decisor", icon: CheckCircle2 },
  preco_teto: { label: "Preço Teto", icon: Target },
};

const TYPE_ROUTE_TO_KEY: Record<string, string> = {
  "/simulador": "simulador",
  "/permuta": "permuta",
  "/highest-best-use": "hbu",
  "/decisor": "decisor",
  "/preco-teto": "preco_teto",
};

function formatBR(n: number) {
  if (!isFinite(n)) return "-";
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function serializeProject(row: ProjectRow): string {
  const lines: string[] = [];
  const meta = TYPE_META[row.project_type];
  lines.push(`PROJETO: ${row.name}`);
  lines.push(`FERRAMENTA: ${meta?.label ?? row.project_type}`);
  lines.push(`Atualizado em: ${new Date(row.updated_at).toLocaleString("pt-BR")}`);
  lines.push("");
  lines.push("== INPUTS ==");
  const flatten = (obj: any, prefix = "") => {
    if (obj === null || obj === undefined) return;
    if (typeof obj !== "object") {
      lines.push(`${prefix}: ${typeof obj === "number" ? formatBR(obj) : obj}`);
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`));
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object") flatten(v, key);
      else if (v !== null && v !== undefined && v !== "")
        lines.push(`${key}: ${typeof v === "number" ? formatBR(v) : v}`);
    }
  };
  flatten(row.inputs ?? {});
  lines.push("");
  lines.push("== RESULTADOS ==");
  flatten(row.results ?? {});
  return lines.join("\n").slice(0, 12_000);
}

export function ProjectAttachmentPicker({
  open,
  onOpenChange,
  onAttach,
  alreadyAttachedIds,
}: Props) {
  const { user } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState<"mine" | "vitrine">("mine");
  const [mine, setMine] = useState<ProjectRow[]>([]);
  const [vitrine, setVitrine] = useState<ProjectRow[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Detecta projeto atual via URL: ?id=...
  const currentProjectInfo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (!id) return null;
    const typeKey = TYPE_ROUTE_TO_KEY[location.pathname];
    return { id, typeKey };
  }, [location]);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        // RLS já restringe: own projects (aprovados) + vitrine pública
        const [mineRes, vitrineRes] = await Promise.all([
          supabase
            .from("toolbox_projects")
            .select("id,name,project_type,inputs,results,updated_at,user_id,show_in_vitrine,vitrine_title")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(100),
          supabase
            .from("toolbox_projects")
            .select("id,name,project_type,inputs,results,updated_at,user_id,show_in_vitrine,vitrine_title")
            .eq("show_in_vitrine", true)
            .order("updated_at", { ascending: false })
            .limit(100),
        ]);

        if (cancelled) return;

        const mineRows = (mineRes.data ?? []) as ProjectRow[];
        const vitRows = (vitrineRes.data ?? []) as ProjectRow[];
        setMine(mineRows);
        setVitrine(vitRows);

        // Carrega nomes dos autores da vitrine (excluindo o próprio usuário)
        const authorIds = Array.from(
          new Set(vitRows.map((p) => p.user_id).filter((id) => id !== user.id)),
        );
        if (authorIds.length > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("user_id,name")
            .in("user_id", authorIds);
          const map: Record<string, string> = {};
          (profs ?? []).forEach((p: any) => {
            map[p.user_id] = p.name || "Autor";
          });
          if (!cancelled) setAuthors(map);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  const handleAttach = (row: ProjectRow) => {
    const meta = TYPE_META[row.project_type];
    const ownerLabel =
      row.user_id === user?.id
        ? "Meu projeto"
        : `Vitrine · ${authors[row.user_id] ?? "Autor"}`;
    onAttach({
      projectId: row.id,
      name: row.vitrine_title || row.name,
      projectType: meta?.label ?? row.project_type,
      ownerLabel,
      summary: serializeProject(row),
    });
    onOpenChange(false);
  };

  const filterRows = (rows: ProjectRow[]) => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.vitrine_title ?? "").toLowerCase().includes(q) ||
        (TYPE_META[r.project_type]?.label.toLowerCase() ?? "").includes(q),
    );
  };

  const currentProject = useMemo(() => {
    if (!currentProjectInfo) return null;
    return mine.find((m) => m.id === currentProjectInfo.id) ?? null;
  }, [mine, currentProjectInfo]);

  const renderRow = (row: ProjectRow, opts?: { highlight?: boolean }) => {
    const meta = TYPE_META[row.project_type];
    const Icon = meta?.icon ?? Calculator;
    const attached = alreadyAttachedIds.includes(row.id);
    const isMine = row.user_id === user?.id;
    return (
      <div
        key={row.id}
        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
          opts?.highlight
            ? "border-accent/60 bg-accent/5"
            : "border-border hover:border-accent/40"
        }`}
      >
        <div className="h-9 w-9 shrink-0 rounded-md bg-accent/10 flex items-center justify-center text-accent">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">
              {row.vitrine_title || row.name}
            </p>
            {opts?.highlight && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 gap-1">
                <Star className="h-2.5 w-2.5" />
                Atual
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {meta?.label ?? row.project_type} ·{" "}
            {isMine ? "Meu projeto" : `Vitrine · ${authors[row.user_id] ?? "Autor"}`}{" "}
            · {new Date(row.updated_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <Button
          size="sm"
          variant={attached ? "secondary" : "default"}
          disabled={attached}
          onClick={() => handleAttach(row)}
        >
          {attached ? "Anexado" : "Anexar"}
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle>Anexar projeto à TOOL</DialogTitle>
          <DialogDescription>
            A TOOL só analisa projetos do sistema — seus próprios ou aprovados na vitrine.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou ferramenta…"
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <div className="px-5">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mine">
                Meus projetos
                <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[10px]">
                  {mine.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="vitrine">
                Vitrine
                <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[10px]">
                  {vitrine.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="mine" className="m-0">
            <ScrollArea className="h-[360px] px-5 py-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : mine.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  Você ainda não salvou nenhum projeto.
                </div>
              ) : (
                <div className="space-y-2">
                  {currentProject &&
                    filterRows([currentProject]).length > 0 &&
                    renderRow(currentProject, { highlight: true })}
                  {filterRows(mine.filter((m) => m.id !== currentProject?.id)).map(
                    (r) => renderRow(r),
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="vitrine" className="m-0">
            <ScrollArea className="h-[360px] px-5 py-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : vitrine.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  Nenhum projeto publicado na vitrine ainda.
                </div>
              ) : (
                <div className="space-y-2">
                  {filterRows(vitrine).map((r) => renderRow(r))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

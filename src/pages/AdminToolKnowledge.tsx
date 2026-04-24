import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Upload, Trash2, FileText, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Doc {
  id: string;
  title: string;
  original_filename: string;
  file_type: string;
  storage_path: string;
  chunk_count: number;
  enabled: boolean;
  created_at: string;
}

const ACCEPTED = ".pdf,.docx,.txt,.md";
const MAX_SIZE = 10 * 1024 * 1024;

export default function AdminToolKnowledge() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = async () => {
      if (!user) { navigate("/"); return; }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "super_admin"]);
      const ok = !!(data && data.length > 0);
      setAuthorized(ok);
      if (ok) loadDocs();
    };
    check();
  }, [user, navigate]);

  const loadDocs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tool_knowledge_documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar documentos");
    else setDocs((data as Doc[]) || []);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_SIZE) {
      toast.error("Arquivo excede 10MB");
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
  };

  const upload = async () => {
    if (!file || !title.trim() || !user) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "docx", "txt", "md"].includes(ext)) {
      toast.error("Formato não suportado. Use PDF, DOCX, TXT ou MD.");
      return;
    }

    setUploading(true);
    try {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("tool-knowledge")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const { data: doc, error: insErr } = await supabase
        .from("tool_knowledge_documents")
        .insert({
          title: title.trim(),
          original_filename: file.name,
          file_type: ext,
          storage_path: path,
          uploaded_by: user.id,
        })
        .select()
        .single();
      if (insErr) throw insErr;

      toast.info("Processando documento…");
      const { error: fnErr } = await supabase.functions.invoke("tool-ingest-document", {
        body: { documentId: doc.id },
      });
      if (fnErr) {
        toast.error("Falha no processamento. Documento salvo, mas sem chunks.");
      } else {
        toast.success("Documento processado e disponível para a TOOL!");
      }

      setDialogOpen(false);
      setTitle("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadDocs();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  const toggleEnabled = async (doc: Doc) => {
    const { error } = await supabase
      .from("tool_knowledge_documents")
      .update({ enabled: !doc.enabled })
      .eq("id", doc.id);
    if (error) toast.error("Erro ao atualizar");
    else {
      setDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, enabled: !d.enabled } : d));
    }
  };

  const remove = async (doc: Doc) => {
    if (!confirm(`Excluir "${doc.title}"? Essa ação não pode ser desfeita.`)) return;
    await supabase.storage.from("tool-knowledge").remove([doc.storage_path]);
    const { error } = await supabase
      .from("tool_knowledge_documents")
      .delete()
      .eq("id", doc.id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Documento removido");
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    }
  };

  if (authorized === null) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }
  if (!authorized) {
    return <div className="p-8 text-center text-muted-foreground">Acesso restrito a administradores.</div>;
  }

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-accent" />
            Conhecimento da TOOL
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Documentos enviados aqui viram a base de conhecimento da TOOL — a assistente que responde dúvidas dos usuários.
            Ela usa esse conteúdo, junto com o manual base, para gerar respostas mais precisas.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" /> Enviar documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar documento para a TOOL</DialogTitle>
              <DialogDescription>
                Formatos aceitos: PDF, DOCX, TXT, MD (máx 10MB). O conteúdo será extraído e indexado automaticamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Manual completo Setter Toolbox v2"
                  disabled={uploading}
                />
              </div>
              <div>
                <Label htmlFor="file">Arquivo</Label>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept={ACCEPTED}
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {file && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {file.name} • {(file.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={uploading}>
                Cancelar
              </Button>
              <Button onClick={upload} disabled={!file || !title.trim() || uploading}>
                {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {uploading ? "Processando…" : "Enviar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : docs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Nenhum documento ainda. A TOOL responderá apenas com o conhecimento base do Setter Toolbox.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Pedaços</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{d.title}</div>
                        <div className="text-xs text-muted-foreground">{d.original_filename}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">{d.file_type}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{d.chunk_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={d.enabled} onCheckedChange={() => toggleEnabled(d)} />
                      <span className="text-xs text-muted-foreground">
                        {d.enabled ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => remove(d)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

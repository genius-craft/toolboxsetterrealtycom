import { useEffect, useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AIVitrineCopyButton } from "@/components/ai/AIVitrineCopyButton";
import { useToggleVitrineStatus, AdminProject } from "@/hooks/useAdminProjects";
import type { AutoFillTool } from "@/components/ai/AutoFillButton";
import { toast } from "sonner";

interface VitrinePublishDialogProps {
  project: AdminProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mapeia o project_type do banco para o tool slug usado pela IA
const TOOL_MAP: Record<string, AutoFillTool> = {
  simulador: "simulador",
  permuta: "permuta",
  "highest-best-use": "hbu",
  hbu: "hbu",
  decisor: "decisor",
  "preco-teto": "preco_teto",
  preco_teto: "preco_teto",
};

export function VitrinePublishDialog({
  project,
  open,
  onOpenChange,
}: VitrinePublishDialogProps) {
  const toggleVitrine = useToggleVitrineStatus();
  const [showInVitrine, setShowInVitrine] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (project) {
      setShowInVitrine(project.show_in_vitrine);
      setTitle(project.vitrine_title ?? "");
      setDescription(project.vitrine_description ?? "");
    }
  }, [project]);

  if (!project) return null;

  const aiTool = TOOL_MAP[project.project_type];

  const handleSave = async () => {
    try {
      await toggleVitrine.mutateAsync({
        projectId: project.id,
        showInVitrine,
        vitrineTitle: title.trim(),
        vitrineDescription: description.trim(),
      });
      toast.success(
        showInVitrine
          ? "Projeto publicado na vitrine!"
          : "Projeto removido da vitrine.",
      );
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar configuração da vitrine.");
    }
  };

  const handleAICopy = (copy: { title: string; description: string }) => {
    if (copy.title) setTitle(copy.title);
    if (copy.description) setDescription(copy.description);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            Vitrine pública
          </DialogTitle>
          <DialogDescription>
            Configure se este projeto aparece na vitrine e personalize o título
            e descrição que serão exibidos para os visitantes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                Exibir na vitrine pública
              </Label>
              <p className="text-xs text-muted-foreground">
                Quando ativo, este projeto fica visível em /vitrine.
              </p>
            </div>
            <Switch
              checked={showInVitrine}
              onCheckedChange={setShowInVitrine}
            />
          </div>

          <div className="flex items-center justify-end">
            {aiTool && (
              <AIVitrineCopyButton
                tool={aiTool}
                projectName={project.name}
                inputs={(project.inputs as Record<string, unknown>) ?? {}}
                results={(project.results as Record<string, unknown>) ?? {}}
                onResult={handleAICopy}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vitrine-title" className="text-sm font-medium">
              Título na vitrine
            </Label>
            <Input
              id="vitrine-title"
              placeholder={project.name}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/120
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vitrine-desc" className="text-sm font-medium">
              Descrição curta
            </Label>
            <Textarea
              id="vitrine-desc"
              placeholder="Resumo de 2–3 frases destacando o atrativo do projeto."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={400}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/400
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={toggleVitrine.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={toggleVitrine.isPending}
          >
            {toggleVitrine.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { dealSchema, type DealInput } from "@/lib/investidores/schemas";
import type { Deal } from "./DealCard";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  deal: Deal | null;
  onSaved: () => void;
}

export function DealFormDialog({ open, onOpenChange, deal, onSaved }: Props) {
  const form = useForm<DealInput>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      titulo: "",
      status: "Disponível",
      imagem_url: "",
      descricao: "",
      investimento_total: "",
      cap_rate: "",
      noi_anual: "",
      receita_mensal: "",
      opex: "",
      localizacao: "",
      tipo_ativo: "",
      inquilino_perfil: "",
      ativo: true,
      ordem: 0,
    },
  });

  useEffect(() => {
    if (deal) {
      form.reset({
        titulo: deal.titulo,
        status: deal.status,
        imagem_url: deal.imagem_url || "",
        descricao: deal.descricao || "",
        investimento_total: deal.investimento_total || "",
        cap_rate: deal.cap_rate || "",
        noi_anual: deal.noi_anual || "",
        receita_mensal: deal.receita_mensal || "",
        opex: deal.opex || "",
        localizacao: deal.localizacao || "",
        tipo_ativo: deal.tipo_ativo || "",
        inquilino_perfil: deal.inquilino_perfil || "",
        ativo: deal.ativo,
        ordem: deal.ordem,
      });
    } else {
      form.reset();
    }
  }, [deal, open]);

  const onSubmit = async (values: DealInput) => {
    const payload = {
      ...values,
      titulo: values.titulo,
      status: values.status,
      imagem_url: values.imagem_url || null,
      descricao: values.descricao || null,
    } as any;
    const { error } = deal
      ? await supabase.from("deals").update(payload).eq("id", deal.id)
      : await supabase.from("deals").insert([payload]);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(deal ? "Ativo atualizado" : "Ativo criado");
    onSaved();
    onOpenChange(false);
  };

  const ativo = form.watch("ativo");

  const field = (name: keyof DealInput, label: string, placeholder?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} placeholder={placeholder} {...form.register(name as any)} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{deal ? "Editar ativo" : "Novo ativo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field("titulo", "Título *", "Projeto Strip Mall – Araçatuba / SP")}
            {field("status", "Status *", "Fase de Estruturação")}
            {field("localizacao", "Localização", "Araçatuba / SP")}
            {field("tipo_ativo", "Tipo de ativo", "Strip Mall")}
            {field("inquilino_perfil", "Perfil do inquilino", "Academia + Drogaria")}
            {field("imagem_url", "URL da imagem", "https://...")}
            {field("investimento_total", "Investimento total", "R$ 6.740.000")}
            {field("cap_rate", "Cap Rate", "12% a.a. (1,00% a.m.)")}
            {field("noi_anual", "NOI anual", "R$ 809.400")}
            {field("receita_mensal", "Receita mensal", "R$ 71.000")}
            {field("opex", "OPEX", "R$ 0 (Contrato NNN)")}
            {field("ordem", "Ordem (menor = primeiro)", "0")}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" rows={4} {...form.register("descricao")} />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label className="font-medium">Visível na vitrine</Label>
              <p className="text-xs text-muted-foreground">
                Quando desligado, o ativo some imediatamente da página pública.
              </p>
            </div>
            <Switch
              checked={ativo}
              onCheckedChange={(v) => form.setValue("ativo", v, { shouldDirty: true })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deal ? "Salvar alterações" : "Criar ativo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

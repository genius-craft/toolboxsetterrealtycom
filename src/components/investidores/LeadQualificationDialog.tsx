import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import {
  leadSchema,
  LeadInput,
  PERFIL_OPTIONS,
  PERFIL_LABEL,
  buildWhatsappUrl,
} from "@/lib/investidores/schemas";
import { useInvestorUnlock } from "@/contexts/InvestorUnlockContext";
import type { Deal } from "./DealCard";

interface Props {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function LeadQualificationDialog({ deal, open, onOpenChange }: Props) {
  const { setUnlocked } = useInvestorUnlock();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome: "",
      email: "",
      whatsapp: "",
      perfil_alocacao: "aquisicao_integral",
      consentimento_lgpd: false as unknown as true,
    },
  });

  const onSubmit = async (values: LeadInput) => {
    if (!deal) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("leads_investidores").insert({
        nome: values.nome,
        email: values.email,
        whatsapp: values.whatsapp,
        perfil_alocacao: values.perfil_alocacao,
        projeto_interesse: deal.titulo,
        deal_id: deal.id,
        consentimento_lgpd: values.consentimento_lgpd,
        consentimento_at: new Date().toISOString(),
        user_agent: navigator.userAgent.slice(0, 500),
      });
      if (error) throw error;

      setUnlocked(true);

      const url = buildWhatsappUrl({
        leadName: values.nome,
        perfilLabel: PERFIL_LABEL[values.perfil_alocacao],
        projectName: deal.titulo,
      });
      window.open(url, "_blank", "noopener,noreferrer");

      toast.success("Acesso liberado. Em instantes nosso especialista falará com você.");
      onOpenChange(false);
      form.reset();
    } catch (err: any) {
      console.error(err);
      toast.error("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Acesso a dados completos</DialogTitle>
          <DialogDescription>
            {deal ? <>Você está consultando <strong>{deal.titulo}</strong>.</> : null} Preencha
            seus dados para conversar com um especialista Setter e receber o Memorando de
            Informações.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" {...form.register("nome")} />
            {form.formState.errors.nome && (
              <p className="text-xs text-destructive">{form.formState.errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail corporativo</Label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              placeholder="+55 (11) 99999-9999"
              {...form.register("whatsapp")}
            />
            {form.formState.errors.whatsapp && (
              <p className="text-xs text-destructive">{form.formState.errors.whatsapp.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Perfil de alocação</Label>
            <RadioGroup
              defaultValue="aquisicao_integral"
              onValueChange={(v) => form.setValue("perfil_alocacao", v as any)}
              className="space-y-2"
            >
              {PERFIL_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  htmlFor={opt.value}
                  className="flex items-start gap-3 rounded-md border border-input p-3 cursor-pointer hover:bg-accent/50 transition"
                >
                  <RadioGroupItem value={opt.value} id={opt.value} className="mt-0.5" />
                  <span className="text-sm leading-snug">{opt.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
            <Checkbox
              id="lgpd"
              onCheckedChange={(v) =>
                form.setValue("consentimento_lgpd", (v === true) as true, { shouldValidate: true })
              }
            />
            <Label htmlFor="lgpd" className="text-xs leading-snug font-normal cursor-pointer">
              Autorizo a Setter a tratar meus dados para contato comercial, conforme a{" "}
              <Link to="/privacidade" target="_blank" className="underline">
                Política de Privacidade
              </Link>
              . (LGPD)
            </Label>
          </div>
          {form.formState.errors.consentimento_lgpd && (
            <p className="text-xs text-destructive -mt-2">
              {form.formState.errors.consentimento_lgpd.message as string}
            </p>
          )}

          <p className="text-[11px] text-muted-foreground leading-snug">
            Material exclusivamente informativo. Não constitui oferta pública de valores
            mobiliários nos termos da Resolução CVM 88/160. Rentabilidades passadas não
            garantem resultados futuros.
          </p>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1E3A5F] hover:bg-[#264a78]"
            size="lg"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Desbloquear e abrir WhatsApp"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

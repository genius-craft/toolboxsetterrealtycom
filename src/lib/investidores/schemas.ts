import { z } from "zod";

export const PERFIL_OPTIONS = [
  { value: "aquisicao_integral", label: "Adquirir ativo integralmente (Liquidez ≥ R$ 6,5MM)" },
  { value: "co_investment", label: "Co-investment / Sociedade em SPE" },
  { value: "corretor", label: "Sou corretor representando cliente final" },
] as const;

export type PerfilAlocacao = (typeof PERFIL_OPTIONS)[number]["value"];

export const leadSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  whatsapp: z
    .string()
    .trim()
    .min(10, "WhatsApp inválido")
    .max(20)
    .regex(/^[+()\d\s-]+$/, "Use apenas números e símbolos de telefone"),
  perfil_alocacao: z.enum([
    "aquisicao_integral",
    "co_investment",
    "corretor",
  ] as const),
  consentimento_lgpd: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar a política para prosseguir" }),
  }),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const dealSchema = z.object({
  titulo: z.string().trim().min(2).max(200),
  status: z.string().trim().min(2).max(80),
  imagem_url: z.string().trim().url().or(z.literal("")).optional(),
  descricao: z.string().trim().max(2000).optional().or(z.literal("")),
  investimento_total: z.string().trim().max(80).optional().or(z.literal("")),
  cap_rate: z.string().trim().max(80).optional().or(z.literal("")),
  noi_anual: z.string().trim().max(80).optional().or(z.literal("")),
  receita_mensal: z.string().trim().max(80).optional().or(z.literal("")),
  opex: z.string().trim().max(80).optional().or(z.literal("")),
  localizacao: z.string().trim().max(120).optional().or(z.literal("")),
  tipo_ativo: z.string().trim().max(80).optional().or(z.literal("")),
  inquilino_perfil: z.string().trim().max(160).optional().or(z.literal("")),
  ativo: z.boolean().default(true),
  ordem: z.coerce.number().int().default(0),
});

export type DealInput = z.infer<typeof dealSchema>;

export const PERFIL_LABEL: Record<PerfilAlocacao, string> = Object.fromEntries(
  PERFIL_OPTIONS.map((o) => [o.value, o.label])
) as Record<PerfilAlocacao, string>;

export function buildWhatsappUrl(opts: {
  phone?: string;
  leadName: string;
  perfilLabel: string;
  projectName: string;
}) {
  const phone = (opts.phone || "5519971223648").replace(/\D/g, "");
  const msg = `Olá, equipe Setter. Analisei o ${opts.projectName} na Vitrine. Meu nome é ${opts.leadName} e tenho interesse na modalidade ${opts.perfilLabel}. Gostaria de receber o Memorando de Informações completo.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

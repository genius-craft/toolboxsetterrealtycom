import { Lock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInvestorUnlock } from "@/contexts/InvestorUnlockContext";
import { cn } from "@/lib/utils";

export interface Deal {
  id: string;
  status: string;
  titulo: string;
  imagem_url: string | null;
  investimento_total: string | null;
  cap_rate: string | null;
  noi_anual: string | null;
  receita_mensal: string | null;
  opex: string | null;
  descricao: string | null;
  localizacao: string | null;
  tipo_ativo: string | null;
  inquilino_perfil: string | null;
  ativo: boolean;
  ordem: number;
}

interface Props {
  deal: Deal;
  onUnlockClick: (deal: Deal) => void;
}

function Metric({ label, value, locked }: { label: string; value: string | null; locked?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "text-sm font-medium text-white text-right truncate",
            locked && "blur-md select-none pointer-events-none"
          )}
        >
          {value}
        </span>
        {locked && <Lock className="h-3.5 w-3.5 text-white/40 shrink-0" />}
      </div>
    </div>
  );
}

export function DealCard({ deal, onUnlockClick }: Props) {
  const { unlocked } = useInvestorUnlock();

  return (
    <article className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#14181E] flex flex-col transition hover:border-white/20 hover:shadow-2xl">
      {/* Image */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {deal.imagem_url ? (
          <img
            src={deal.imagem_url}
            alt={deal.titulo}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/20 text-xs">
            Sem imagem
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-[#1E3A5F] text-white border-0 hover:bg-[#1E3A5F]">
            {deal.status}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-white leading-snug">{deal.titulo}</h3>
        {deal.localizacao && (
          <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
            <MapPin className="h-3 w-3" /> {deal.localizacao}
          </p>
        )}
        {deal.descricao && (
          <p className="mt-3 text-sm text-white/70 line-clamp-3">{deal.descricao}</p>
        )}

        <div className="mt-4 rounded-lg bg-black/30 px-4 py-2">
          <Metric label="Cap Rate" value={deal.cap_rate} />
          <Metric label="Investimento Total" value={deal.investimento_total} locked={!unlocked} />
          <Metric label="Receita Mensal" value={deal.receita_mensal} locked={!unlocked} />
          <Metric label="NOI Anual" value={deal.noi_anual} locked={!unlocked} />
          <Metric label="OPEX" value={deal.opex} locked={!unlocked} />
        </div>

        <Button
          onClick={() => onUnlockClick(deal)}
          className="mt-5 w-full bg-[#1E3A5F] hover:bg-[#264a78] text-white font-medium"
          size="lg"
        >
          {unlocked ? "Falar com especialista" : "Desbloquear dados e falar com especialista"}
        </Button>
      </div>
    </article>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, TrendingUp, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InvestorUnlockProvider } from "@/contexts/InvestorUnlockContext";
import { DealCard, type Deal } from "@/components/investidores/DealCard";
import { LeadQualificationDialog } from "@/components/investidores/LeadQualificationDialog";
import setterLogo from "@/assets/setter-logo.png";

function InvestidoresInner() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Deal | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = "Setter Investimentos | Ativos imobiliários corporativos";
    let cancelled = false;
    supabase
      .from("deals")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error(error);
        setDeals((data as any) || []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUnlock = (deal: Deal) => {
    setSelected(deal);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0F1216] text-white">

      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/investidores" className="flex items-center gap-2">
            <img src={setterLogo} alt="Setter" className="h-7 w-auto" />
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Investimentos</span>
          </Link>
          <a
            href="https://wa.me/5519971223648"
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs uppercase tracking-wider text-white/70 hover:text-white"
          >
            Falar com a Setter
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">
          Vitrine privada
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
          Ativos imobiliários corporativos
          <br />
          <span className="text-white/60">estruturados para geração de renda.</span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          Projetos com contratos de longo prazo e inquilinos resilientes nos setores de
          varejo essencial, saúde e serviços — desenhados para previsibilidade de fluxo de
          caixa.
        </p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-white/60">
          <ShieldCheck className="h-3.5 w-3.5" />
          Acesso restrito a investidores qualificados e Family Offices
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20 text-white/50 text-sm">
            Nenhum ativo disponível no momento. Entre em contato para conhecer próximas oportunidades.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((d) => (
              <DealCard key={d.id} deal={d} onUnlockClick={handleUnlock} />
            ))}
          </div>
        )}
      </section>

      {/* Credibility */}
      <section className="border-t border-white/5 bg-[#0B0D11]">
        <div className="max-w-5xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <TrendingUp className="h-5 w-5 mx-auto mb-3 text-[#7AA7D9]" />
            <div className="text-2xl font-semibold">Cap Rate alvo 12% a.a.</div>
            <p className="text-xs text-white/50 mt-2">Modelagem em contratos NNN de longo prazo</p>
          </div>
          <div>
            <ShieldCheck className="h-5 w-5 mx-auto mb-3 text-[#7AA7D9]" />
            <div className="text-2xl font-semibold">Inquilinos resilientes</div>
            <p className="text-xs text-white/50 mt-2">Varejo essencial, saúde e serviços</p>
          </div>
          <div>
            <FileText className="h-5 w-5 mx-auto mb-3 text-[#7AA7D9]" />
            <div className="text-2xl font-semibold">Diligência estruturada</div>
            <p className="text-xs text-white/50 mt-2">Análise completa via Toolbox proprietária</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-10 text-xs text-white/40 space-y-3">
          <p className="leading-relaxed">
            <strong className="text-white/60">Aviso CVM:</strong> As informações
            apresentadas têm caráter exclusivamente informativo e não constituem oferta
            pública de valores mobiliários nos termos da Resolução CVM 88/160. Os ativos
            apresentados destinam-se a investidores qualificados e Family Offices,
            mediante diligência prévia. Rentabilidades passadas não garantem resultados
            futuros. Investimentos imobiliários envolvem riscos.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/privacidade" className="hover:text-white/80">
              Política de Privacidade (LGPD)
            </Link>
            <Link to="/termos" className="hover:text-white/80">
              Termos de Uso
            </Link>
            <a href="mailto:contato@setterrealty.com" className="hover:text-white/80">
              contato@setterrealty.com
            </a>
            <span className="text-white/30">© {new Date().getFullYear()} Setter Realty</span>
          </div>
        </div>
      </footer>

      <LeadQualificationDialog deal={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}

export default function Investidores() {
  return (
    <InvestorUnlockProvider>
      <InvestidoresInner />
    </InvestorUnlockProvider>
  );
}

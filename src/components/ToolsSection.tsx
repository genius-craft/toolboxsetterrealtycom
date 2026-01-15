import { Calculator, ArrowRightLeft, Building2, CheckCircle, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const tools = [
  {
    icon: Calculator,
    title: "Simulador de Viabilidade",
    path: "/simulador",
    description:
      "Análise completa de viabilidade financeira com TIR, Cap Rate, NOI, Payback e fluxo de caixa projetado.",
    features: [
      "3 cenários automáticos",
      "Matriz de sensibilidade",
      "Múltiplas unidades",
      "Veredito automático",
    ],
    color: "from-amber-500/20 to-orange-500/10",
  },
  {
    icon: ArrowRightLeft,
    title: "Calculadora de Permuta",
    path: "/permuta",
    description:
      "Compare vender terreno à vista vs. fazer permuta com incorporadora. Descubra o percentual justo.",
    features: [
      "VGV do empreendimento",
      "Valor presente descontado",
      "Deal Score (-100 a +100)",
      "Comparativo visual",
    ],
    color: "from-blue-500/20 to-cyan-500/10",
  },
  {
    icon: Building2,
    title: "Highest & Best Use",
    path: "/highest-best-use",
    description:
      "Descubra qual tipo de uso maximiza o valor do seu terreno: Residencial, Comercial ou Misto.",
    features: [
      "VPL por tipo de uso",
      "TIR do desenvolvimento",
      "Score de viabilidade",
      "Recomendação técnica",
    ],
    color: "from-emerald-500/20 to-green-500/10",
  },
  {
    icon: CheckCircle,
    title: "Decisor Go/No-Go",
    path: "/decisor",
    description:
      "Veredicto rápido sobre viabilidade de compra ou venda. Modo COMPRA e modo VENDA integrados.",
    features: [
      "Yield vs. mínimo desejado",
      "Preço máximo aceitável",
      "Análise de parceria",
      "Score de aprovação",
    ],
    color: "from-purple-500/20 to-violet-500/10",
  },
];

const ToolsSection = () => {
  return (
    <section id="ferramentas" className="py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 mb-6">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-accent tracking-wide uppercase">
              Ferramentas
            </span>
          </div>
          <h2 className="section-title mb-6">
            4 Calculadoras Profissionais
          </h2>
          <p className="section-subtitle mx-auto">
            Cada ferramenta foi desenvolvida para resolver um problema
            específico do investidor imobiliário, com métricas precisas e
            relatórios apresentáveis.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {tools.map((tool, index) => (
            <Link
              key={index}
              to={tool.path}
              className="group"
            >
              <div className={`tool-card h-full relative overflow-hidden animate-fade-up`}
                   style={{ animationDelay: `${index * 100}ms` }}>
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <tool.icon className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{tool.description}</p>

                  {/* Features List */}
                  <ul className="space-y-2.5">
                    {tool.features.map((feature, fIndex) => (
                      <li
                        key={fIndex}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;

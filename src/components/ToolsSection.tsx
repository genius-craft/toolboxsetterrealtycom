import { Calculator, ArrowRightLeft, Building2, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const tools = [
  {
    icon: Calculator,
    title: "Simulador de Viabilidade",
    path: "/simulador",
    description:
      "Análise completa de viabilidade financeira com TIR, Cap Rate, NOI, Payback e fluxo de caixa projetado para 10 anos.",
    features: [
      "3 cenários (Pessimista, Realista, Otimista)",
      "Matriz de sensibilidade",
      "Múltiplas unidades",
      "Veredito automático",
    ],
    color: "from-blue-500 to-blue-600",
    delay: "delay-100",
  },
  {
    icon: ArrowRightLeft,
    title: "Calculadora de Permuta",
    path: "/permuta",
    description:
      "Compare vender terreno à vista vs. fazer permuta com incorporadora. Descubra o percentual justo e o Deal Score.",
    features: [
      "VGV do empreendimento",
      "Valor presente descontado",
      "Deal Score (-100 a +100)",
      "Comparativo visual",
    ],
    color: "from-emerald-500 to-emerald-600",
    delay: "delay-200",
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
    color: "from-violet-500 to-violet-600",
    delay: "delay-300",
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
    color: "from-amber-500 to-amber-600",
    delay: "delay-400",
  },
];

const ToolsSection = () => {
  return (
    <section id="ferramentas" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            Ferramentas
          </span>
          <h2 className="section-title mb-4">
            4 Calculadoras Profissionais
          </h2>
          <p className="section-subtitle mx-auto">
            Cada ferramenta foi desenvolvida para resolver um problema
            específico do investidor imobiliário, com métricas precisas e
            relatórios apresentáveis.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tools.map((tool, index) => (
            <div
              key={index}
              className={`tool-card group animate-fade-up ${tool.delay}`}
            >
              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} mb-5`}
              >
                <tool.icon className="w-7 h-7 text-primary-foreground" />
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-foreground mb-2">
                {tool.title}
              </h3>
              <p className="text-muted-foreground mb-5">{tool.description}</p>

              {/* Features List */}
              <ul className="space-y-2 mb-6">
                {tool.features.map((feature, fIndex) => (
                  <li
                    key={fIndex}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button variant="ghost" className="group/btn p-0 h-auto font-semibold text-foreground">
                Acessar Ferramenta
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;

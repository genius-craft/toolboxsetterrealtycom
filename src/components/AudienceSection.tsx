import { TrendingUp, Users, Home } from "lucide-react";

const audiences = [
  {
    icon: TrendingUp,
    title: "Investidores",
    description:
      "Oportunidades validadas matematicamente com análise de risco e retorno projetado. Tome decisões baseadas em dados, não em intuição.",
    benefits: [
      "TIR e Cap Rate calculados automaticamente",
      "Análise de cenários (pessimista, realista, otimista)",
      "Comparativo de investimentos",
    ],
  },
  {
    icon: Users,
    title: "Corretores",
    description:
      "Acelere fechamentos com dados técnicos e relatórios prontos para apresentação. Destaque-se da concorrência com análises profissionais.",
    benefits: [
      "Relatórios PDF personalizados",
      "Dados que convencem clientes",
      "Fechamento mais rápido",
    ],
  },
  {
    icon: Home,
    title: "Proprietários",
    description:
      "Descubra o valor real (vocação) do seu ativo e maximize seu potencial comercial. Saiba o melhor caminho: vender, alugar ou desenvolver.",
    benefits: [
      "Highest & Best Use do seu terreno",
      "Comparativo venda vs. permuta",
      "Potencial de valorização",
    ],
  },
];

const AudienceSection = () => {
  return (
    <section id="publico" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4 uppercase tracking-wider">
            Para Quem
          </span>
          <h2 className="section-title mb-4">
            Feito Para Profissionais do Mercado
          </h2>
          <p className="section-subtitle mx-auto">
            Independente do seu perfil, o Setter Toolbox oferece as ferramentas
            certas para suas decisões imobiliárias.
          </p>
        </div>

        {/* Audience Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="relative rounded-lg p-8 bg-card border border-border shadow-card overflow-hidden animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary mb-6">
                <audience.icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-foreground mb-3 font-serif">
                {audience.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{audience.description}</p>

              {/* Benefits */}
              <ul className="space-y-3">
                {audience.benefits.map((benefit, bIndex) => (
                  <li
                    key={bIndex}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;

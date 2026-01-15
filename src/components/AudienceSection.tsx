import { TrendingUp, Users, Home, Check } from "lucide-react";

const audiences = [
  {
    icon: TrendingUp,
    title: "Investidores",
    description:
      "Oportunidades validadas matematicamente com análise de risco e retorno projetado.",
    benefits: [
      "TIR e Cap Rate calculados automaticamente",
      "Análise de cenários (pessimista, realista, otimista)",
      "Comparativo de investimentos",
    ],
    gradient: "from-accent/20 via-accent/5 to-transparent",
  },
  {
    icon: Users,
    title: "Corretores",
    description:
      "Acelere fechamentos com dados técnicos e relatórios prontos para apresentação.",
    benefits: [
      "Relatórios PDF personalizados",
      "Dados que convencem clientes",
      "Fechamento mais rápido",
    ],
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
  },
  {
    icon: Home,
    title: "Proprietários",
    description:
      "Descubra o valor real do seu ativo e maximize seu potencial comercial.",
    benefits: [
      "Highest & Best Use do seu terreno",
      "Comparativo venda vs. permuta",
      "Potencial de valorização",
    ],
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
];

const AudienceSection = () => {
  return (
    <section id="publico" className="py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 mb-6">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-accent tracking-wide uppercase">
              Para Quem
            </span>
          </div>
          <h2 className="section-title mb-6">
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
              className="group relative rounded-2xl p-8 bg-card border border-border shadow-card overflow-hidden animate-fade-up hover:shadow-card-hover hover:-translate-y-1 transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${audience.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <audience.icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-foreground mb-3 font-serif group-hover:text-accent transition-colors">
                  {audience.title}
                </h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">{audience.description}</p>

                {/* Benefits */}
                <ul className="space-y-4">
                  {audience.benefits.map((benefit, bIndex) => (
                    <li
                      key={bIndex}
                      className="flex items-start gap-3 text-sm text-foreground"
                    >
                      <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent/20 transition-colors">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;

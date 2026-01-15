import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
const HeroSection = () => {
  return <section className="relative gradient-hero min-h-[90vh] flex items-center overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          

          {/* Main Heading - Serif font */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground mb-6 leading-tight animate-fade-up delay-100 font-serif">
            Seu Cockpit de{" "}
            <span className="text-accent">Decisão</span> para
            Investimentos Imobiliários
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/60 mb-10 max-w-2xl mx-auto animate-fade-up delay-200 leading-relaxed">
            Substitua planilhas fragmentadas por calculadoras profissionais
            integradas. Análises padronizadas, validadas matematicamente e
            prontas para apresentação.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up delay-300">
            <Button variant="gold" size="xl">
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Ver Demonstração
            </Button>
          </div>

          {/* Stats - Monospace numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up delay-400">
            <div className="flex flex-col items-center p-6 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
              <TrendingUp className="w-7 h-7 text-accent mb-3" strokeWidth={1.5} />
              <span className="text-3xl font-semibold text-primary-foreground mb-1 font-mono">
                4
              </span>
              <span className="text-sm text-primary-foreground/50 tracking-wide">
                Ferramentas Profissionais
              </span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
              <Shield className="w-7 h-7 text-accent mb-3" strokeWidth={1.5} />
              <span className="text-3xl font-semibold text-primary-foreground mb-1 font-mono">
                100%
              </span>
              <span className="text-sm text-primary-foreground/50 tracking-wide">
                Análises Validadas
              </span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
              <Zap className="w-7 h-7 text-accent mb-3" strokeWidth={1.5} />
              <span className="text-3xl font-semibold text-primary-foreground mb-1 font-mono">
                10x
              </span>
              <span className="text-sm text-primary-foreground/50 tracking-wide">
                Mais Rápido
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>;
};
export default HeroSection;
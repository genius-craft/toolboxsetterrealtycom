import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
const HeroSection = () => {
  return <section className="relative gradient-hero min-h-[100vh] flex items-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] animate-pulse" style={{
        animationDelay: '1s'
      }} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
        
        {/* Decorative lines */}
        <div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
        <div className="absolute bottom-32 right-20 w-px h-48 bg-gradient-to-b from-transparent via-accent/20 to-transparent hidden lg:block" />
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Premium Badge */}
          

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-primary-foreground mb-8 leading-[1.1] animate-fade-up delay-100 font-serif">
            Seu Cockpit de{" "}
            <span className="relative inline-block">
              <span className="text-gradient-gold">Decisão</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M1 5.5Q50 1 100 5.5T199 5.5" stroke="url(#gold-gradient)" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gold-gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop offset="0%" stopColor="hsl(26, 90%, 37%)" />
                    <stop offset="100%" stopColor="hsl(38, 92%, 50%)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br className="hidden md:block" />
            para Investimentos Imobiliários
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/50 mb-12 max-w-3xl mx-auto animate-fade-up delay-200 leading-relaxed font-light">
            Substitua planilhas fragmentadas por calculadoras profissionais
            integradas. Análises padronizadas, validadas matematicamente e
            prontas para apresentação a investidores.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-up delay-300">
            <Link to="/simulador">
              <Button variant="gold" size="xl" className="group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Começar Análise Gratuita
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-up delay-400">
            <div className="stat-card group">
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <span className="block text-3xl font-semibold text-primary-foreground font-mono">
                    4
                  </span>
                  <span className="text-sm text-primary-foreground/40 tracking-wide">
                    Ferramentas Pro
                  </span>
                </div>
              </div>
            </div>
            
            <div className="stat-card group">
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Shield className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <span className="block text-3xl font-semibold text-primary-foreground font-mono">
                    100%
                  </span>
                  <span className="text-sm text-primary-foreground/40 tracking-wide">
                    Validado
                  </span>
                </div>
              </div>
            </div>
            
            <div className="stat-card group">
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Zap className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <span className="block text-3xl font-semibold text-primary-foreground font-mono">
                    10x
                  </span>
                  <span className="text-sm text-primary-foreground/40 tracking-wide">
                    Mais Rápido
                  </span>
                </div>
              </div>
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
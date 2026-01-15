import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, FileText, Sparkles } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const CTASection = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main CTA Card */}
          <div className="relative gradient-hero rounded-3xl p-12 md:p-20 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Grid pattern */}
              <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px),
                                   linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }}
              />
            </div>

            <div className="relative z-10 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">
                  Comece Gratuitamente
                </span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-semibold text-primary-foreground mb-6 font-serif leading-tight">
                Pronto Para Tomar Decisões
                <br />
                com <span className="text-gradient-gold">Confiança?</span>
              </h2>
              <p className="text-lg text-primary-foreground/50 mb-12 max-w-2xl mx-auto leading-relaxed">
                Comece a usar o Setter Toolbox gratuitamente ou fale com um
                especialista para validar suas análises.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button variant="gold" size="xl" className="group">
                      Ir para Dashboard
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="gold" 
                    size="xl" 
                    className="group"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    Criar Conta Gratuita
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
                <a 
                  href="https://wa.me/5519971223648?text=Olá! Gostaria de saber mais sobre o Setter Toolbox" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="heroOutline" size="xl" className="group">
                    <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                    Falar com Especialista
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Secondary CTAs */}
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="group tool-card flex items-center gap-5 cursor-pointer">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-7 h-7 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                  Exportar PDF Profissional
                </h3>
                <p className="text-sm text-muted-foreground">
                  Relatórios prontos para apresentar a clientes e parceiros.
                </p>
              </div>
            </div>

            <a 
              href="https://wa.me/5519971223648?text=Olá! Gostaria de validar minha análise com um especialista" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <div className="group tool-card flex items-center gap-5 cursor-pointer h-full">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <MessageCircle className="w-7 h-7 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                    Validar Estudo com Especialista
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tenha certeza das suas análises com consultoria especializada.
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </section>
  );
};

export default CTASection;

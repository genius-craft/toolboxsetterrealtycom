import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, FileText } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA Card */}
          <div className="relative gradient-hero rounded-lg p-12 md:p-16 overflow-hidden">
            {/* Subtle Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground mb-4 font-serif">
                Pronto Para Tomar Decisões com{" "}
                <span className="text-accent">Confiança?</span>
              </h2>
              <p className="text-lg text-primary-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                Comece a usar o Setter Toolbox gratuitamente ou fale com um
                especialista para validar suas análises.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="gold" size="xl">
                  Criar Conta Gratuita
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="heroOutline" size="xl">
                  <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                  Falar com Especialista
                </Button>
              </div>
            </div>
          </div>

          {/* Secondary CTAs */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="tool-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Exportar PDF Profissional
                </h3>
                <p className="text-sm text-muted-foreground">
                  Relatórios prontos para apresentar a clientes e parceiros.
                </p>
              </div>
            </div>

            <div className="tool-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Validar Estudo com Especialista
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tenha certeza das suas análises com consultoria especializada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

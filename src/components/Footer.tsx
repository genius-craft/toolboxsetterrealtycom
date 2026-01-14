import { Calculator } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-primary-foreground">
                Setter<span className="text-accent">Toolbox</span>
              </span>
            </div>
            <p className="text-primary-foreground/60 max-w-md">
              Plataforma proprietária de ferramentas de análise para
              investimentos imobiliários. Substitua planilhas fragmentadas por
              calculadoras profissionais integradas.
            </p>
          </div>

          {/* Ferramentas */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">
              Ferramentas
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/simulador"
                  className="text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Simulador de Viabilidade
                </a>
              </li>
              <li>
                <a
                  href="/permuta"
                  className="text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Calculadora de Permuta
                </a>
              </li>
              <li>
                <a
                  href="/highest-best-use"
                  className="text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Highest & Best Use
                </a>
              </li>
              <li>
                <a
                  href="/decisor"
                  className="text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Decisor Go/No-Go
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">
              Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Sobre Nós
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Termos de Uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/40 text-sm">
            © {new Date().getFullYear()} Setter Toolbox. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Calculator, Linkedin, Instagram, Mail, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary relative overflow-hidden">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center transition-transform group-hover:scale-105">
                <Calculator className="w-6 h-6 text-accent-foreground" strokeWidth={1.5} />
              </div>
              <span className="text-2xl font-bold text-primary-foreground">
                Setter<span className="text-accent">Toolbox</span>
              </span>
            </Link>
            <p className="text-primary-foreground/40 max-w-md leading-relaxed mb-8">
              Plataforma proprietária de ferramentas de análise para
              investimentos imobiliários. Substitua planilhas fragmentadas por
              calculadoras profissionais integradas.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/40 hover:text-accent hover:border-accent/30 transition-all"
              >
                <Linkedin className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/40 hover:text-accent hover:border-accent/30 transition-all"
              >
                <Instagram className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a 
                href="mailto:contato@settertoolbox.com" 
                className="w-10 h-10 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/40 hover:text-accent hover:border-accent/30 transition-all"
              >
                <Mail className="w-5 h-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Ferramentas */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-6 uppercase tracking-wider text-sm">
              Ferramentas
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/simulador"
                  className="text-primary-foreground/40 hover:text-accent transition-colors"
                >
                  Simulador de Viabilidade
                </Link>
              </li>
              <li>
                <Link
                  to="/permuta"
                  className="text-primary-foreground/40 hover:text-accent transition-colors"
                >
                  Calculadora de Permuta
                </Link>
              </li>
              <li>
                <Link
                  to="/highest-best-use"
                  className="text-primary-foreground/40 hover:text-accent transition-colors"
                >
                  Highest & Best Use
                </Link>
              </li>
              <li>
                <Link
                  to="/decisor"
                  className="text-primary-foreground/40 hover:text-accent transition-colors"
                >
                  Decisor Go/No-Go
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-6 uppercase tracking-wider text-sm">
              Links
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-primary-foreground/40 hover:text-accent transition-colors"
                >
                  Sobre Nós
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-primary-foreground/40 hover:text-accent transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <Link
                  to="/termos"
                  className="text-primary-foreground/40 hover:text-accent transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/privacidade"
                  className="text-primary-foreground/40 hover:text-accent transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/30 text-sm">
            © {new Date().getFullYear()} Setter Toolbox. Todos os direitos reservados.
          </p>
          <p className="text-primary-foreground/20 text-xs">
            Feito com precisão para o mercado imobiliário brasileiro.
          </p>
        </div>

        {/* CVM Disclaimer */}
        <div className="border-t border-primary-foreground/10 mt-8 pt-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-primary-foreground/20 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-primary-foreground/20 text-xs leading-relaxed max-w-4xl">
              <strong className="text-primary-foreground/30">Aviso Legal:</strong> As ferramentas disponibilizadas 
              pela Setter Toolbox têm caráter exclusivamente educacional e informativo. Os cálculos e análises 
              apresentados não constituem recomendação de investimento, oferta ou solicitação de compra ou venda 
              de qualquer ativo. A Setter Toolbox não é uma instituição financeira, corretora de valores ou 
              consultoria de investimentos registrada na CVM (Comissão de Valores Mobiliários). Rentabilidade 
              passada não é garantia de resultados futuros. Antes de tomar qualquer decisão de investimento, 
              consulte um profissional devidamente habilitado.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

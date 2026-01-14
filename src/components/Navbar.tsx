import { Button } from "@/components/ui/button";
import { Calculator, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary-foreground/10">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center">
              <Calculator className="w-5 h-5 text-accent-foreground" strokeWidth={1.5} />
            </div>
            <span className="text-xl font-bold text-primary-foreground">
              Setter<span className="text-accent">Toolbox</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#ferramentas" className="nav-link">
              Ferramentas
            </a>
            <a href="#publico" className="nav-link">
              Para Quem
            </a>
            <a href="#como-funciona" className="nav-link">
              Como Funciona
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
              Entrar
            </Button>
            <Button variant="gold" size="sm">
              Validar com Especialista
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
            ) : (
              <Menu className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-foreground/10 animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#ferramentas" className="nav-link py-2">
                Ferramentas
              </a>
              <a href="#publico" className="nav-link py-2">
                Para Quem
              </a>
              <a href="#como-funciona" className="nav-link py-2">
                Como Funciona
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-primary-foreground/10">
                <Button variant="outline" className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Entrar
                </Button>
                <Button variant="gold" className="w-full">
                  Validar com Especialista
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

import { Button } from "@/components/ui/button";
import { Calculator, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary-foreground/10">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center">
                <Calculator className="w-5 h-5 text-accent-foreground" strokeWidth={1.5} />
              </div>
              <span className="text-xl font-bold text-primary-foreground">
                Setter<span className="text-accent">Toolbox</span>
              </span>
            </Link>

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
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="gold" size="sm">
                        <User className="w-4 h-4 mr-2" />
                        Minha Conta
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Meus Projetos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    Entrar
                  </Button>
                  <Button variant="gold" size="sm" onClick={() => setAuthModalOpen(true)}>
                    Validar com Especialista
                  </Button>
                </>
              )}
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
                <a href="#ferramentas" className="nav-link py-2" onClick={() => setIsMenuOpen(false)}>
                  Ferramentas
                </a>
                <a href="#publico" className="nav-link py-2" onClick={() => setIsMenuOpen(false)}>
                  Para Quem
                </a>
                <a href="#como-funciona" className="nav-link py-2" onClick={() => setIsMenuOpen(false)}>
                  Como Funciona
                </a>
                <div className="flex flex-col gap-2 pt-4 border-t border-primary-foreground/10">
                  {user ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button variant="gold" className="w-full" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                        onClick={() => {
                          setAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        Entrar
                      </Button>
                      <Button 
                        variant="gold" 
                        className="w-full"
                        onClick={() => {
                          setAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        Validar com Especialista
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
};

export default Navbar;

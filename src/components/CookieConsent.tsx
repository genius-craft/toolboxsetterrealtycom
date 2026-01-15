import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-up">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card p-6 rounded-2xl border border-border/50 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-6 h-6 text-accent" strokeWidth={1.5} />
            </div>
            
            {/* Text */}
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                Utilizamos cookies
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Usamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo. 
                Ao continuar navegando, você concorda com nossa{" "}
                <Link 
                  to="/privacidade" 
                  className="text-accent hover:underline"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                className="flex-1 md:flex-none"
              >
                Rejeitar
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleAccept}
                className="flex-1 md:flex-none"
              >
                Aceitar Cookies
              </Button>
            </div>
            
            {/* Close button (mobile) */}
            <button 
              onClick={handleReject}
              className="absolute top-3 right-3 md:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
